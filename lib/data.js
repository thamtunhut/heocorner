// Sản phẩm, danh mục, cài đặt cửa hàng và nhật ký hoạt động.
import crypto from "node:crypto";
import { store } from "./store.js";
import { HttpError } from "./http.js";
import seed from "../data/seed.js";

const K = { products: "db:products", categories: "db:categories", settings: "db:settings", logs: "db:logs" };
export const STATUSES = { available: "Còn hàng", out: "Tạm hết", discontinued: "Ngừng bán" };

const DEFAULT_SETTINGS = { announcement: { enabled: false, text: "", link: "" } };

/* ---------- Đọc / khởi tạo ---------- */
async function load(key, fallback) {
  const v = await store.getJSON(key);
  if (v != null) return v;
  const init = structuredClone(fallback);
  await store.setJSON(key, init);
  return init;
}
export const getProducts = () => load(K.products, seed.products);
export const getCategories = () => load(K.categories, seed.categories);
export async function getSettings() {
  const s = await load(K.settings, seed.settings || DEFAULT_SETTINGS);
  return { ...DEFAULT_SETTINGS, ...s, announcement: { ...DEFAULT_SETTINGS.announcement, ...(s.announcement || {}) } };
}
const saveProducts = (list) => store.setJSON(K.products, list);

/** Dữ liệu cho trang khách: chỉ sản phẩm đang hiển thị, sắp xếp ghim -> thứ tự -> ngừng bán cuối. */
export async function getPublicCatalog() {
  const [products, categories, settings] = await Promise.all([getProducts(), getCategories(), getSettings()]);
  const rank = (p) => (p.status === "discontinued" ? 2 : p.featured ? 0 : 1);
  const visible = products
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => p.visible !== false)
    .sort((a, b) => rank(a.p) - rank(b.p) || a.i - b.i)
    .map(({ p }) => {
      const { createdAt, updatedAt, visible, ...pub } = p;
      return pub;
    });
  return { categories, products: visible, settings: { announcement: settings.announcement } };
}

/* ---------- Kiểm tra dữ liệu ---------- */
const str = (v, max, field, required = false) => {
  const s = typeof v === "string" ? v.trim().replace(/\s+/g, " ") : v == null ? "" : String(v).trim();
  if (required && !s) throw new HttpError(400, `Vui lòng nhập ${field}`);
  if (s.length > max) throw new HttpError(400, `${field} tối đa ${max} ký tự`);
  return s;
};
const money = (v, field, allowNull = false) => {
  if (allowNull && (v === null || v === undefined || v === "")) return null;
  const n = typeof v === "string" ? Number(v.replace(/[^\d]/g, "")) : Number(v);
  if (!Number.isInteger(n) || n < 0 || n > 1e9) throw new HttpError(400, `${field} không hợp lệ`);
  return n;
};
const IMG_OK = /^(\/(assets|uploads)\/[\w\-./]+\.(webp|jpe?g|png)|https:\/\/[\w-]+\.public\.blob\.vercel-storage\.com\/[\w\-./%]+)$/i;
const imageUrl = (v, field) => {
  const s = typeof v === "string" ? v.trim() : "";
  if (!s) return "";
  if (!IMG_OK.test(s) || s.includes("..")) throw new HttpError(400, `${field} không hợp lệ`);
  return s;
};

export function slugify(s) {
  return String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48) || "sp";
}

function validateProduct(input, categories, existing = {}) {
  const p = { ...existing };
  const has = (f) => Object.prototype.hasOwnProperty.call(input, f);
  if (has("name") || !existing.name) p.name = str(input.name, 120, "tên sản phẩm", true);
  if (has("cat") || !existing.cat) {
    if (!categories.some((c) => c.id === input.cat)) throw new HttpError(400, "Danh mục không hợp lệ");
    p.cat = input.cat;
  }
  if (has("origin")) p.origin = str(input.origin, 60, "xuất xứ");
  if (has("abv")) p.abv = str(input.abv, 20, "độ cồn");
  if (has("badge")) p.badge = str(input.badge, 20, "nhãn nổi bật");
  if (has("desc")) p.desc = str(input.desc, 500, "mô tả");
  if (has("status") || !existing.status) {
    const st = input.status || "available";
    if (!STATUSES[st]) throw new HttpError(400, "Tình trạng không hợp lệ");
    p.status = st;
  }
  if (has("visible") || existing.visible === undefined) p.visible = input.visible === undefined ? true : Boolean(input.visible);
  if (has("featured") || existing.featured === undefined) p.featured = Boolean(input.featured);
  if (has("image") || !existing.image) {
    const img = input.image || {};
    p.image = { thumb: imageUrl(img.thumb, "Ảnh"), large: imageUrl(img.large || img.thumb, "Ảnh lớn") };
  }
  if (has("variants") || !existing.variants) {
    if (!Array.isArray(input.variants) || !input.variants.length) throw new HttpError(400, "Cần ít nhất 1 quy cách / giá");
    if (input.variants.length > 12) throw new HttpError(400, "Tối đa 12 quy cách cho 1 sản phẩm");
    p.variants = input.variants.map((v, i) => {
      const row = `quy cách #${i + 1}`;
      const out = {
        label: str(v && v.label, 60, `tên ${row}`, true),
        pack: str(v && v.pack, 60, `đóng gói ${row}`, true),
        price: money(v && v.price, `giá ${row}`),
        oldPrice: money(v && v.oldPrice, `giá cũ ${row}`, true)
      };
      if (out.oldPrice !== null && out.oldPrice <= out.price) out.oldPrice = null; // giá cũ phải cao hơn giá bán
      return out;
    });
  }
  for (const f of ["origin", "abv", "badge", "desc"]) if (p[f] === undefined) p[f] = "";
  return p;
}

/* ---------- CRUD sản phẩm ---------- */
export async function listAdminProducts() {
  return getProducts();
}

export async function createProduct(input) {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  const p = validateProduct(input, categories);
  let id = slugify(p.name);
  while (products.some((x) => x.id === id)) id = slugify(p.name) + "-" + crypto.randomBytes(2).toString("hex");
  const now = new Date().toISOString();
  const product = { id, ...p, createdAt: now, updatedAt: now };
  products.unshift(product); // sản phẩm mới lên đầu
  await saveProducts(products);
  return product;
}

export async function updateProduct(id, input) {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  const i = products.findIndex((x) => x.id === id);
  if (i < 0) throw new HttpError(404, "Không tìm thấy sản phẩm");
  const before = products[i];
  const p = validateProduct(input, categories, before);
  products[i] = { ...p, id, createdAt: before.createdAt, updatedAt: new Date().toISOString() };
  await saveProducts(products);
  return { product: products[i], before };
}

export async function deleteProduct(id) {
  const products = await getProducts();
  const i = products.findIndex((x) => x.id === id);
  if (i < 0) throw new HttpError(404, "Không tìm thấy sản phẩm");
  const [removed] = products.splice(i, 1);
  await saveProducts(products);
  return removed;
}

export async function reorderProducts(ids) {
  const products = await getProducts();
  if (!Array.isArray(ids)) throw new HttpError(400, "Danh sách thứ tự không hợp lệ");
  const pos = new Map(ids.map((id, i) => [id, i]));
  const sorted = products
    .map((p, i) => ({ p, k: pos.has(p.id) ? pos.get(p.id) : ids.length + i }))
    .sort((a, b) => a.k - b.k)
    .map((x) => x.p);
  await saveProducts(sorted);
  return sorted;
}

/* ---------- Danh mục ---------- */
function normalizeCategories(input) {
  if (!Array.isArray(input) || !input.length) throw new HttpError(400, "Cần ít nhất 1 danh mục");
  if (input.length > 30) throw new HttpError(400, "Tối đa 30 danh mục");
  const seen = new Set();
  return input.map((c, i) => {
    const name = str(c && c.name, 60, `tên danh mục #${i + 1}`, true);
    let id = slugify((c && typeof c.id === "string" && c.id.trim()) || name);
    while (seen.has(id)) id = id + "-" + (i + 1);
    seen.add(id);
    return { id, name, short: str(c && c.short, 30, `tên ngắn danh mục #${i + 1}`) };
  });
}

export async function saveCategories(input) {
  const cats = normalizeCategories(input);
  const products = await getProducts();
  const ids = new Set(cats.map((c) => c.id));
  const missing = [...new Set(products.map((p) => p.cat))].filter((id) => !ids.has(id));
  if (missing.length) {
    const used = products.filter((p) => missing.includes(p.cat)).length;
    throw new HttpError(400, `Không thể xóa danh mục đang có ${used} sản phẩm. Hãy chuyển sản phẩm sang danh mục khác trước.`);
  }
  await store.setJSON(K.categories, cats);
  return cats;
}

/* ---------- Cài đặt ---------- */
async function normalizeSettings(input) {
  const cur = await getSettings();
  const a = (input && input.announcement) || {};
  const link = str(a.link, 300, "liên kết");
  if (link && !/^(https?:\/\/|#|\/)/i.test(link)) throw new HttpError(400, "Liên kết phải bắt đầu bằng https://, / hoặc #");
  const next = { ...cur, announcement: { enabled: Boolean(a.enabled), text: str(a.text, 200, "nội dung thông báo"), link } };
  if (next.announcement.enabled && !next.announcement.text) throw new HttpError(400, "Vui lòng nhập nội dung thông báo");
  return next;
}
export async function saveSettings(input) {
  const next = await normalizeSettings(input);
  await store.setJSON(K.settings, next);
  return next;
}

/* ---------- Sao lưu / khôi phục ---------- */
export async function exportAll() {
  const [products, categories, settings] = await Promise.all([getProducts(), getCategories(), getSettings()]);
  return { app: "heo-corner", version: 1, exportedAt: new Date().toISOString(), categories, products, settings };
}

export async function importAll(data) {
  if (!data || data.app !== "heo-corner" || !Array.isArray(data.products) || !Array.isArray(data.categories)) {
    throw new HttpError(400, "File sao lưu không đúng định dạng Heo Corner");
  }
  const cats = normalizeCategories(data.categories);
  const seen = new Set();
  const products = data.products.map((raw, i) => {
    try {
      const p = validateProduct(raw, cats);
      let id = slugify(raw.id || p.name);
      while (seen.has(id)) id += "-" + i;
      seen.add(id);
      return { id, ...p, createdAt: raw.createdAt || new Date().toISOString(), updatedAt: raw.updatedAt || new Date().toISOString() };
    } catch (e) {
      throw new HttpError(400, `Sản phẩm thứ ${i + 1} (${raw && raw.name}) lỗi: ${e.message}`);
    }
  });
  // Kiểm tra hết rồi mới ghi, tránh khôi phục dở dang
  const settings = data.settings ? await normalizeSettings(data.settings) : null;
  await store.setJSON(K.categories, cats);
  await saveProducts(products);
  if (settings) await store.setJSON(K.settings, settings);
  return { products: products.length, categories: cats.length };
}

/* ---------- Nhật ký ---------- */
export async function addLog(action, detail, ctx = {}) {
  const entry = { t: new Date().toISOString(), action, detail: String(detail || "").slice(0, 300), user: ctx.user || "", ip: ctx.ip || "" };
  await store.pipeline([["LPUSH", K.logs, JSON.stringify(entry)], ["LTRIM", K.logs, 0, 299]]);
}
export async function getLogs(limit = 100) {
  const rows = await store.exec("LRANGE", K.logs, 0, Math.min(limit, 300) - 1);
  return (rows || []).map((r) => { try { return typeof r === "string" ? JSON.parse(r) : r; } catch { return null; } }).filter(Boolean);
}
