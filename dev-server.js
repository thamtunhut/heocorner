// Server chạy thử local: phục vụ thư mục public/ và chuyển /api/* vào cùng router như trên Vercel.
// Dùng: npm run dev  (đọc cấu hình từ file .env.local)
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

// Nạp .env.local trước khi import router
const envFile = path.resolve(".env.local");
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
const { handle } = await import("./lib/router.js");

const PORT = Number(process.env.PORT) || 5173;
const ROOT = path.resolve("public");
const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".json": "application/json", ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml", ".ico": "image/x-icon", ".txt": "text/plain; charset=utf-8"
};

function serveStatic(req, res) {
  let p = decodeURIComponent(new URL(req.url, "http://x").pathname);
  let file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403).end(); return; }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
    if (!p.endsWith("/")) { res.writeHead(308, { Location: p + "/" }).end(); return; }
    file = path.join(file, "index.html");
  }
  if (!fs.existsSync(file)) { res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("404 Không tìm thấy"); return; }
  res.writeHead(200, { "Content-Type": TYPES[path.extname(file).toLowerCase()] || "application/octet-stream", "Cache-Control": /\.(html|js|css)$/.test(file) ? "no-store" : "no-cache" });
  fs.createReadStream(file).pipe(res);
}

http.createServer((req, res) => {
  const t = Date.now();
  res.on("finish", () => {
    if (req.url.startsWith("/api/")) console.log(`${req.method} ${req.url} → ${res.statusCode} (${Date.now() - t}ms)`);
  });
  if (req.url.startsWith("/api/") || req.url === "/api") return handle(req, res);
  serveStatic(req, res);
}).listen(PORT, () => {
  console.log(`Heo Corner local: http://localhost:${PORT}  |  Admin: http://localhost:${PORT}/admin/`);
});
