// Đăng nhập admin: băm mật khẩu scrypt, phiên bằng cookie ký HMAC, khóa 30 phút sau 5 lần sai.
import crypto from "node:crypto";
import { store } from "./store.js";
import { HttpError, parseCookies, isHttps } from "./http.js";

export const MAX_FAILS = 5;
export const LOCK_SECONDS = 30 * 60;
const SESSION_HOURS = 8;
const COOKIE = "hc_admin";
const USER_KEY = "admin:user";

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new HttpError(500, "Chưa cấu hình SESSION_SECRET (tối thiểu 32 ký tự).");
  return s;
}

/* ---------- Mật khẩu ---------- */
const SCRYPT = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
export function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64, SCRYPT);
  return salt.toString("hex") + ":" + hash.toString("hex");
}
function verifyPassword(password, stored) {
  const [saltHex, hashHex] = String(stored).split(":");
  if (!saltHex || !hashHex) return false;
  const hash = crypto.scryptSync(password, Buffer.from(saltHex, "hex"), 64, SCRYPT);
  return crypto.timingSafeEqual(hash, Buffer.from(hashHex, "hex"));
}
// Hash giả để thời gian phản hồi giống nhau khi sai tên đăng nhập
const DUMMY_HASH = hashPassword(crypto.randomBytes(12).toString("hex"));

export function validateNewPassword(pw) {
  if (typeof pw !== "string" || pw.length < 8) throw new HttpError(400, "Mật khẩu mới phải có ít nhất 8 ký tự");
  if (pw.length > 128) throw new HttpError(400, "Mật khẩu quá dài");
  if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) throw new HttpError(400, "Mật khẩu mới cần có cả chữ và số");
}

/* ---------- Tài khoản admin ---------- */
export async function getAdmin() {
  let user = await store.getJSON(USER_KEY);
  if (!user) {
    const username = (process.env.ADMIN_USERNAME || "").trim();
    const password = process.env.ADMIN_PASSWORD || "";
    if (!username || !password) {
      throw new HttpError(500, "Chưa cấu hình ADMIN_USERNAME / ADMIN_PASSWORD cho lần đăng nhập đầu tiên.");
    }
    user = { username, hash: hashPassword(password), ver: 1, createdAt: new Date().toISOString() };
    await store.setJSON(USER_KEY, user);
  }
  return user;
}

export async function changePassword(current, next) {
  const user = await getAdmin();
  if (!verifyPassword(String(current || ""), user.hash)) throw new HttpError(400, "Mật khẩu hiện tại không đúng");
  validateNewPassword(next);
  user.hash = hashPassword(next);
  user.ver = (user.ver || 1) + 1; // vô hiệu mọi phiên cũ
  user.passwordChangedAt = new Date().toISOString();
  await store.setJSON(USER_KEY, user);
  return user;
}

/* ---------- Khóa khi sai nhiều lần ---------- */
const norm = (u) => String(u || "").trim().toLowerCase().slice(0, 64);
const keys = (username, ip) => ({
  failU: "auth:fail:u:" + norm(username),
  failIp: "auth:fail:ip:" + ip,
  lockU: "auth:lock:u:" + norm(username),
  lockIp: "auth:lock:ip:" + ip
});

async function lockStatus(k) {
  const [tu, ti] = await store.pipeline([["TTL", k.lockU], ["TTL", k.lockIp]]);
  const t = Math.max(Number(tu), Number(ti));
  return t > 0 ? t : 0;
}

export async function login(username, password, ip) {
  if (typeof username !== "string" || typeof password !== "string" || !username.trim() || !password) {
    throw new HttpError(400, "Vui lòng nhập tài khoản và mật khẩu");
  }
  const k = keys(username, ip);
  const locked = await lockStatus(k);
  if (locked) {
    throw new HttpError(429, `Đăng nhập sai quá ${MAX_FAILS} lần. Vui lòng thử lại sau ${Math.ceil(locked / 60)} phút.`,
      { retryAfter: locked, locked: true });
  }

  const user = await getAdmin();
  const nameOk = norm(username) === norm(user.username);
  const passOk = verifyPassword(password, nameOk ? user.hash : DUMMY_HASH) && nameOk;

  if (!passOk) {
    const [fu, fi] = await store.pipeline([["INCR", k.failU], ["INCR", k.failIp]]);
    const cmds = [];
    if (Number(fu) === 1) cmds.push(["EXPIRE", k.failU, LOCK_SECONDS]);
    if (Number(fi) === 1) cmds.push(["EXPIRE", k.failIp, LOCK_SECONDS]);
    const fails = Math.max(Number(fu), Number(fi));
    if (fails >= MAX_FAILS) {
      cmds.push(["SET", k.lockU, "1", "EX", LOCK_SECONDS], ["SET", k.lockIp, "1", "EX", LOCK_SECONDS],
        ["DEL", k.failU], ["DEL", k.failIp]);
    }
    if (cmds.length) await store.pipeline(cmds);
    if (fails >= MAX_FAILS) {
      throw new HttpError(429, `Đăng nhập sai quá ${MAX_FAILS} lần. Tài khoản bị khóa ${LOCK_SECONDS / 60} phút.`,
        { retryAfter: LOCK_SECONDS, locked: true, failed: true });
    }
    throw new HttpError(401, `Sai tài khoản hoặc mật khẩu. Còn ${MAX_FAILS - fails} lần thử.`,
      { remaining: MAX_FAILS - fails, failed: true });
  }

  await store.del(k.failU, k.failIp);
  return user;
}

/* ---------- Phiên đăng nhập ---------- */
const b64 = (s) => Buffer.from(s).toString("base64url");
const sign = (data) => crypto.createHmac("sha256", secret()).update(data).digest("base64url");

export function sessionCookie(req, user) {
  const exp = Date.now() + SESSION_HOURS * 3600 * 1000;
  const payload = b64(JSON.stringify({ u: user.username, v: user.ver, exp }));
  const token = payload + "." + sign(payload);
  return `${COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_HOURS * 3600}${isHttps(req) ? "; Secure" : ""}`;
}

export function clearCookie(req) {
  return `${COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${isHttps(req) ? "; Secure" : ""}`;
}

/** Trả về payload phiên nếu hợp lệ (chỉ kiểm tra chữ ký + hạn), không đọc DB. */
export function readSession(req) {
  const token = parseCookies(req)[COOKIE];
  if (!token || !token.includes(".")) return null;
  const [payload, sig] = token.split(".");
  let expected;
  try { expected = sign(payload); } catch { return null; }
  const a = Buffer.from(sig), b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!data.exp || data.exp < Date.now()) return null;
    return data;
  } catch { return null; }
}

/** Bắt buộc đăng nhập; kiểm tra thêm phiên bản mật khẩu (đổi mật khẩu => đăng xuất mọi nơi). */
export async function requireAdmin(req) {
  const s = readSession(req);
  if (!s) throw new HttpError(401, "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
  const user = await getAdmin();
  if (norm(s.u) !== norm(user.username) || s.v !== user.ver) {
    throw new HttpError(401, "Phiên đăng nhập không còn hiệu lực, vui lòng đăng nhập lại");
  }
  return user;
}
