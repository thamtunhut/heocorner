// Router cho toàn bộ API — 1 serverless function duy nhất trên Vercel.
import { HttpError, send, readJSON, readRaw, clientIp, getPath } from "./http.js";
import * as auth from "./auth.js";
import * as data from "./data.js";
import * as stats from "./stats.js";
import { saveImage, deleteImages } from "./images.js";
import { store } from "./store.js";

const NO_STORE = { "Cache-Control": "no-store" };

/* ---------- Bảo vệ CSRF cho request thay đổi dữ liệu ---------- */
function checkCsrf(req) {
  if (req.headers["x-requested-with"] !== "heo-admin") throw new HttpError(403, "Yêu cầu không hợp lệ");
  const origin = req.headers.origin;
  if (origin) {
    const host = req.headers["x-forwarded-host"] || req.headers.host;
    try { if (new URL(origin).host !== host) throw 0; }
    catch { throw new HttpError(403, "Nguồn yêu cầu không hợp lệ"); }
  }
}

const ctx = (req, user) => ({ ip: clientIp(req), user: user ? user.username : "" });

function describeChanges(before, after) {
  const out = [];
  if (before.status !== after.status) out.push(`tình trạng: ${data.STATUSES[before.status]} → ${data.STATUSES[after.status]}`);
  if (before.visible !== after.visible) out.push(after.visible ? "hiện trên web" : "ẩn khỏi web");
  if (before.featured !== after.featured) out.push(after.featured ? "ghim nổi bật" : "bỏ ghim");
  const price = (p) => p.variants.map((v) => v.price).join("/");
  if (price(before) !== price(after)) out.push(`giá: ${price(before)} → ${price(after)}`);
  for (const [f, label] of [["name", "tên"], ["cat", "danh mục"], ["desc", "mô tả"], ["origin", "xuất xứ"], ["abv", "độ cồn"], ["badge", "nhãn"]]) {
    if ((before[f] || "") !== (after[f] || "")) out.push(label);
  }
  if (JSON.stringify(before.image) !== JSON.stringify(after.image)) out.push("ảnh");
  if (JSON.stringify(before.variants) !== JSON.stringify(after.variants) && price(before) === price(after)) out.push("quy cách");
  return out.join(", ") || "không đổi";
}

async function unusedImages(urls, products) {
  const used = new Set(products.flatMap((p) => [p.image && p.image.thumb, p.image && p.image.large]));
  return urls.filter((u) => u && !used.has(u));
}

/* ---------- Bảng route ---------- */
const routes = [];
const on = (method, pattern, handler, opts = {}) => {
  const keys = [];
  const re = new RegExp("^" + pattern.replace(/:(\w+)/g, (_, k) => { keys.push(k); return "([^/]+)"; }) + "$");
  routes.push({ method, re, keys, handler, ...opts });
};

/* Công khai */
on("GET", "/api/products", async (req, res) => {
  send(res, 200, await data.getPublicCatalog(), NO_STORE); // không cache: admin đổi là khách thấy ngay
});

on("POST", "/api/track", async (req, res) => {
  const body = await readJSON(req, 2048).catch(() => ({}));
  const ua = String(req.headers["user-agent"] || "");
  // Không đếm bot và không đếm lượt của chính admin đang đăng nhập
  if (!stats.isBot(ua) && !auth.readSession(req)) {
    const type = ["pageview", "product", "zalo"].includes(body.type) ? body.type : null;
    const productId = typeof body.id === "string" && /^[a-z0-9-]{1,80}$/.test(body.id) ? body.id : null;
    if (type) await stats.track(type, { ip: clientIp(req), ua, productId });
  }
  send(res, 204, undefined, NO_STORE);
});

/* Đăng nhập */
on("POST", "/api/auth/login", async (req, res) => {
  checkCsrf(req);
  const { username, password } = await readJSON(req, 4096);
  const ip = clientIp(req);
  try {
    const user = await auth.login(username, password, ip);
    await data.addLog("login", "Đăng nhập thành công", { ip, user: user.username });
    send(res, 200, { ok: true, username: user.username }, { ...NO_STORE, "Set-Cookie": auth.sessionCookie(req, user) });
  } catch (e) {
    if (e instanceof HttpError && e.extra && e.extra.failed) {
      await data.addLog(e.extra.locked ? "lock" : "login_fail",
        (e.extra.locked ? "Khóa đăng nhập 30 phút" : "Đăng nhập sai") + ` (tài khoản: ${String(username).slice(0, 40)})`, { ip });
    }
    throw e;
  }
}, { public: true });

on("POST", "/api/auth/logout", async (req, res) => {
  checkCsrf(req);
  send(res, 200, { ok: true }, { ...NO_STORE, "Set-Cookie": auth.clearCookie(req) });
}, { public: true });

on("GET", "/api/auth/me", async (req, res, { user }) => {
  send(res, 200, { username: user.username, storage: store.driverName }, NO_STORE);
});

on("POST", "/api/auth/password", async (req, res, { user }) => {
  const { current, next } = await readJSON(req, 4096);
  const u = await auth.changePassword(current, next);
  await data.addLog("password", "Đổi mật khẩu", ctx(req, user));
  send(res, 200, { ok: true }, { ...NO_STORE, "Set-Cookie": auth.sessionCookie(req, u) });
});

/* Thống kê */
on("GET", "/api/admin/stats", async (req, res) => {
  const products = await data.getProducts();
  const s = await stats.getStats(products);
  const counts = { total: products.length, available: 0, out: 0, discontinued: 0, hidden: 0 };
  products.forEach((p) => { counts[p.status] = (counts[p.status] || 0) + 1; if (p.visible === false) counts.hidden++; });
  send(res, 200, { ...s, products: counts }, NO_STORE);
});

/* Sản phẩm */
on("GET", "/api/admin/products", async (req, res) => {
  const [products, categories] = await Promise.all([data.listAdminProducts(), data.getCategories()]);
  send(res, 200, { products, categories, statuses: data.STATUSES }, NO_STORE);
});

on("POST", "/api/admin/products", async (req, res, { user }) => {
  const p = await data.createProduct(await readJSON(req));
  await data.addLog("create", `Thêm sản phẩm "${p.name}"`, ctx(req, user));
  send(res, 201, { product: p }, NO_STORE);
});

on("PUT", "/api/admin/products/:id", async (req, res, { user, params }) => {
  const { product, before } = await data.updateProduct(params.id, await readJSON(req));
  const changes = describeChanges(before, product);
  await data.addLog("update", `Sửa "${product.name}": ${changes}`, ctx(req, user));
  const oldImgs = [before.image && before.image.thumb, before.image && before.image.large];
  await deleteImages(await unusedImages(oldImgs, await data.getProducts()));
  send(res, 200, { product }, NO_STORE);
});

on("DELETE", "/api/admin/products/:id", async (req, res, { user, params }) => {
  const removed = await data.deleteProduct(params.id);
  await data.addLog("delete", `Xóa sản phẩm "${removed.name}"`, ctx(req, user));
  const imgs = [removed.image && removed.image.thumb, removed.image && removed.image.large];
  await deleteImages(await unusedImages(imgs, await data.getProducts()));
  send(res, 200, { ok: true }, NO_STORE);
});

on("PUT", "/api/admin/products-order", async (req, res, { user }) => {
  const { ids } = await readJSON(req);
  await data.reorderProducts(ids);
  await data.addLog("reorder", "Sắp xếp lại thứ tự sản phẩm", ctx(req, user));
  send(res, 200, { ok: true }, NO_STORE);
});

on("POST", "/api/admin/upload", async (req, res, { query }) => {
  const buf = await readRaw(req, 4 * 1024 * 1024);
  const url = await saveImage(buf, query.name);
  send(res, 201, { url }, NO_STORE);
});

/* Danh mục & cài đặt */
on("GET", "/api/admin/categories", async (req, res) => {
  const [categories, products] = await Promise.all([data.getCategories(), data.getProducts()]);
  const counts = {};
  products.forEach((p) => { counts[p.cat] = (counts[p.cat] || 0) + 1; });
  send(res, 200, { categories, counts }, NO_STORE);
});
on("PUT", "/api/admin/categories", async (req, res, { user }) => {
  const { categories } = await readJSON(req);
  const saved = await data.saveCategories(categories);
  await data.addLog("categories", `Cập nhật danh mục (${saved.length} mục)`, ctx(req, user));
  send(res, 200, { categories: saved }, NO_STORE);
});
on("GET", "/api/admin/settings", async (req, res) => send(res, 200, await data.getSettings(), NO_STORE));
on("PUT", "/api/admin/settings", async (req, res, { user }) => {
  const s = await data.saveSettings(await readJSON(req));
  await data.addLog("settings", s.announcement.enabled ? `Bật thông báo: "${s.announcement.text}"` : "Tắt thông báo đầu trang", ctx(req, user));
  send(res, 200, s, NO_STORE);
});

/* Nhật ký, sao lưu */
on("GET", "/api/admin/logs", async (req, res) => send(res, 200, { logs: await data.getLogs(200) }, NO_STORE));
on("GET", "/api/admin/export", async (req, res, { user }) => {
  const dump = await data.exportAll();
  await data.addLog("export", "Tải file sao lưu", ctx(req, user));
  send(res, 200, dump, { ...NO_STORE, "Content-Disposition": `attachment; filename="heo-corner-backup-${stats.dayKey()}.json"` });
});
on("POST", "/api/admin/import", async (req, res, { user }) => {
  const r = await data.importAll(await readJSON(req, 4 * 1024 * 1024));
  await data.addLog("import", `Khôi phục từ file sao lưu: ${r.products} sản phẩm, ${r.categories} danh mục`, ctx(req, user));
  send(res, 200, r, NO_STORE);
});

/* ---------- Xử lý request ---------- */
export async function handle(req, res) {
  try {
    const { path, query } = getPath(req);
    const method = req.method.toUpperCase();
    let matchedPath = false;
    for (const r of routes) {
      const m = r.re.exec(path);
      if (!m) continue;
      matchedPath = true;
      if (r.method !== method) continue;
      const params = Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]));
      const isAdmin = path.startsWith("/api/admin/") || (path.startsWith("/api/auth/") && !r.public);
      let user = null;
      if (isAdmin) {
        if (method !== "GET") checkCsrf(req);
        user = await auth.requireAdmin(req);
      }
      return await r.handler(req, res, { params, query, user });
    }
    throw new HttpError(matchedPath ? 405 : 404, matchedPath ? "Phương thức không được hỗ trợ" : "Không tìm thấy API");
  } catch (e) {
    const status = e instanceof HttpError ? e.status : 500;
    if (status >= 500) console.error(e);
    const headers = { ...NO_STORE };
    if (e.extra && e.extra.retryAfter) headers["Retry-After"] = String(e.extra.retryAfter);
    send(res, status, { error: status >= 500 && !(e instanceof HttpError) ? "Lỗi máy chủ, vui lòng thử lại" : e.message, ...(e.extra || {}) }, headers);
  }
}
