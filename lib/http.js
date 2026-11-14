// Tiện ích HTTP dùng chung cho Vercel function và dev server local.

export class HttpError extends Error {
  constructor(status, message, extra) {
    super(message);
    this.status = status;
    this.extra = extra;
  }
}

/** Đọc raw body (không đụng tới req.body của Vercel để tự kiểm soát giới hạn kích thước). */
export function readRaw(req, limit = 5 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (c) => {
      size += c.length;
      if (size > limit) { reject(new HttpError(413, "Dữ liệu gửi lên quá lớn")); req.destroy(); return; }
      chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export async function readJSON(req, limit = 2 * 1024 * 1024) {
  const buf = await readRaw(req, limit);
  if (!buf.length) return {};
  try { return JSON.parse(buf.toString("utf8")); }
  catch { throw new HttpError(400, "Dữ liệu JSON không hợp lệ"); }
}

export function send(res, status, data, headers = {}) {
  const body = data === undefined ? "" : JSON.stringify(data);
  res.statusCode = status;
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
  if (data !== undefined) res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(body);
}

export function parseCookies(req) {
  const out = {};
  (req.headers.cookie || "").split(";").forEach((p) => {
    const i = p.indexOf("=");
    if (i > 0) out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim());
  });
  return out;
}

export function isHttps(req) {
  return Boolean(process.env.VERCEL) || req.headers["x-forwarded-proto"] === "https";
}

export function clientIp(req) {
  // Trên Vercel, x-real-ip / x-forwarded-for do Vercel ghi đè nên tin được.
  // Ở local thì không tin header (tránh giả IP để né khóa đăng nhập).
  if (process.env.VERCEL) {
    const ip = req.headers["x-real-ip"] || String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
    if (ip) return ip;
  }
  return (req.socket && req.socket.remoteAddress) || "unknown";
}

export function getPath(req) {
  const url = new URL(req.url, "http://x");
  let p = url.pathname;
  // Vercel rewrite /api/:path* -> /api?route=:path* — lấy lại đường dẫn gốc
  if ((p === "/api" || p === "/api/" || p === "/api/index") && url.searchParams.get("route")) {
    p = "/api/" + url.searchParams.get("route");
  }
  return { path: p.replace(/\/+$/, "") || "/", query: Object.fromEntries(url.searchParams) };
}
