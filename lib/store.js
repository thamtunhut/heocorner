// Lớp lưu trữ key-value kiểu Redis.
//  - Production (Vercel): Upstash Redis qua REST API (biến môi trường KV_REST_API_* hoặc UPSTASH_REDIS_REST_*).
//  - Local: file JSON tại data/local-db.json — cùng tập lệnh để test local đúng logic production.
import fs from "node:fs";
import path from "node:path";

const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

/* ---------------- Upstash (REST) ---------------- */
function upstashDriver() {
  async function call(pathname, body) {
    const res = await fetch(REDIS_URL.replace(/\/$/, "") + pathname, {
      method: "POST",
      headers: { Authorization: "Bearer " + REDIS_TOKEN, "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error("Redis error: " + (data && data.error ? data.error : res.status));
    return data;
  }
  return {
    name: "upstash",
    async exec(cmd) {
      const d = await call("", cmd.map(String));
      if (d.error) throw new Error("Redis error: " + d.error);
      return d.result;
    },
    async pipeline(cmds) {
      if (!cmds.length) return [];
      const d = await call("/pipeline", cmds.map((c) => c.map(String)));
      return d.map((r) => { if (r.error) throw new Error("Redis error: " + r.error); return r.result; });
    }
  };
}

/* ---------------- File JSON (local) ---------------- */
function fileDriver() {
  const file = process.env.LOCAL_DB_FILE || path.resolve(process.cwd(), "data", "local-db.json");
  let db = {};
  try { db = JSON.parse(fs.readFileSync(file, "utf8")); } catch { db = {}; }
  const save = () => {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, JSON.stringify(db));
  };
  const now = () => Date.now();
  const live = (k) => {
    const e = db[k];
    if (!e) return null;
    if (e.exp && e.exp <= now()) { delete db[k]; return null; }
    return e;
  };
  const ensure = (k, type, init) => {
    let e = live(k);
    if (!e) { e = db[k] = { t: type, v: init }; }
    if (e.t !== type) throw new Error("WRONGTYPE " + k);
    return e;
  };
  const range = (arr, start, stop) => {
    const n = arr.length;
    let s = Number(start), e = Number(stop);
    if (s < 0) s = n + s; if (e < 0) e = n + e;
    return arr.slice(Math.max(0, s), Math.min(n - 1, e) + 1);
  };

  const C = {
    GET(k) { const e = live(k); return e ? e.v : null; },
    SET(k, v, ...opt) {
      const ex = opt[0] && String(opt[0]).toUpperCase() === "EX" ? Number(opt[1]) : 0;
      db[k] = { t: "str", v: String(v), exp: ex ? now() + ex * 1000 : 0 };
      return "OK";
    },
    DEL(...ks) { let n = 0; ks.forEach((k) => { if (live(k)) { delete db[k]; n++; } }); return n; },
    EXISTS(k) { return live(k) ? 1 : 0; },
    INCR(k) { const e = ensure(k, "str", "0"); e.v = String(Number(e.v) + 1); return Number(e.v); },
    EXPIRE(k, s) { const e = live(k); if (!e) return 0; e.exp = now() + Number(s) * 1000; return 1; },
    TTL(k) { const e = live(k); if (!e) return -2; if (!e.exp) return -1; return Math.ceil((e.exp - now()) / 1000); },
    PFADD(k, ...m) {
      const e = ensure(k, "set", []);
      let changed = 0;
      m.forEach((x) => { if (!e.v.includes(String(x))) { e.v.push(String(x)); changed = 1; } });
      return changed;
    },
    PFCOUNT(...ks) {
      const all = new Set();
      ks.forEach((k) => { const e = live(k); if (e) e.v.forEach((x) => all.add(x)); });
      return all.size;
    },
    HINCRBY(k, f, n) { const e = ensure(k, "hash", {}); e.v[f] = (Number(e.v[f]) || 0) + Number(n); return e.v[f]; },
    HGETALL(k) { const e = live(k); if (!e) return []; return Object.entries(e.v).flatMap(([f, v]) => [f, String(v)]); },
    LPUSH(k, ...vals) { const e = ensure(k, "list", []); vals.forEach((v) => e.v.unshift(String(v))); return e.v.length; },
    LTRIM(k, s, t) { const e = live(k); if (e) e.v = range(e.v, s, t); return "OK"; },
    LRANGE(k, s, t) { const e = live(k); return e ? range(e.v, s, t) : []; }
  };
  const WRITES = new Set(["SET", "DEL", "INCR", "EXPIRE", "PFADD", "HINCRBY", "LPUSH", "LTRIM"]);

  function run(cmd) {
    const name = String(cmd[0]).toUpperCase();
    const fn = C[name];
    if (!fn) throw new Error("Lệnh chưa hỗ trợ trong file driver: " + name);
    return { result: fn(...cmd.slice(1).map(String)), write: WRITES.has(name) };
  }
  return {
    name: "file",
    async exec(cmd) { const r = run(cmd); if (r.write) save(); return r.result; },
    async pipeline(cmds) {
      let w = false;
      const out = cmds.map((c) => { const r = run(c); w = w || r.write; return r.result; });
      if (w) save();
      return out;
    }
  };
}

/* ---------------- Chọn driver ---------------- */
let driver;
function getDriver() {
  if (driver) return driver;
  if (REDIS_URL && REDIS_TOKEN) driver = upstashDriver();
  else if (process.env.VERCEL) {
    throw new Error("Chưa cấu hình database: cần KV_REST_API_URL và KV_REST_API_TOKEN (Upstash Redis).");
  } else driver = fileDriver();
  return driver;
}

const toObj = (arr) => {
  if (!arr) return {};
  if (!Array.isArray(arr)) return arr;
  const o = {};
  for (let i = 0; i < arr.length; i += 2) o[arr[i]] = arr[i + 1];
  return o;
};

export const store = {
  get driverName() { return getDriver().name; },
  exec: (...cmd) => getDriver().exec(cmd),
  pipeline: (cmds) => getDriver().pipeline(cmds),
  get: (k) => getDriver().exec(["GET", k]),
  set: (k, v, exSeconds) => getDriver().exec(exSeconds ? ["SET", k, v, "EX", exSeconds] : ["SET", k, v]),
  del: (...ks) => getDriver().exec(["DEL", ...ks]),
  ttl: (k) => getDriver().exec(["TTL", k]),
  async incrWithTtl(k, seconds) {
    const n = await getDriver().exec(["INCR", k]);
    if (n === 1) await getDriver().exec(["EXPIRE", k, seconds]);
    return n;
  },
  async getJSON(k) {
    const v = await getDriver().exec(["GET", k]);
    if (v == null) return null;
    return typeof v === "string" ? JSON.parse(v) : v;
  },
  setJSON: (k, v) => getDriver().exec(["SET", k, JSON.stringify(v)]),
  async hgetall(k) { return toObj(await getDriver().exec(["HGETALL", k])); },
  toObj
};
