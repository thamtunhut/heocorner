// Lưu ảnh sản phẩm: Vercel Blob khi chạy production, thư mục public/uploads khi chạy local.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { HttpError } from "./http.js";

const MAX_BYTES = 3 * 1024 * 1024;

function sniff(buf) {
  if (buf.length > 12 && buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") return { ext: "webp", type: "image/webp" };
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return { ext: "jpg", type: "image/jpeg" };
  if (buf.length > 8 && buf.toString("hex", 0, 8) === "89504e470d0a1a0a") return { ext: "png", type: "image/png" };
  return null;
}

/**
 * Cách xác thực Vercel Blob:
 *  - Cũ: biến BLOB_READ_WRITE_TOKEN.
 *  - Mới (Vercel hiện tạo mặc định): BLOB_STORE_ID + token OIDC mà Vercel gắn vào mỗi request
 *    (header x-vercel-oidc-token, hoặc biến VERCEL_OIDC_TOKEN).
 * Trả về options cho put/del, hoặc null nếu chưa cấu hình.
 */
function blobAuth(req) {
  if (process.env.BLOB_READ_WRITE_TOKEN) return { token: process.env.BLOB_READ_WRITE_TOKEN };
  const storeId = (process.env.BLOB_STORE_ID || "").trim();
  if (!storeId) return null;
  const oidcToken = String((req && req.headers && req.headers["x-vercel-oidc-token"]) || process.env.VERCEL_OIDC_TOKEN || "").trim();
  if (!oidcToken) {
    throw new HttpError(500, "Đã có BLOB_STORE_ID nhưng thiếu token OIDC. Vào Vercel → Settings → Security → bật “Secure Backend Access with OIDC Federation” rồi Redeploy.");
  }
  return { oidcToken, storeId };
}

export async function saveImage(buf, baseName, req) {
  if (!buf || !buf.length) throw new HttpError(400, "Chưa có dữ liệu ảnh");
  if (buf.length > MAX_BYTES) throw new HttpError(413, "Ảnh quá lớn (tối đa 3MB sau khi nén)");
  const kind = sniff(buf);
  if (!kind) throw new HttpError(400, "Chỉ hỗ trợ ảnh WebP, JPG hoặc PNG");
  const name = String(baseName || "anh").toLowerCase().replace(/[^a-z0-9-]+/g, "-").slice(0, 60) || "anh";

  const auth = blobAuth(req);
  if (auth) {
    const { put } = await import("@vercel/blob");
    try {
      const r = await put(`products/${name}.${kind.ext}`, buf, {
        ...auth, access: "public", contentType: kind.type, addRandomSuffix: true, cacheControlMaxAge: 31536000
      });
      return r.url;
    } catch (e) {
      console.error("Vercel Blob put lỗi:", e);
      throw new HttpError(502, "Không lưu được ảnh lên Vercel Blob: " + (e && e.message ? e.message : "lỗi không xác định"));
    }
  }
  if (process.env.VERCEL) throw new HttpError(500, "Chưa kết nối Vercel Blob cho project (cần BLOB_STORE_ID hoặc BLOB_READ_WRITE_TOKEN), rồi Redeploy.");

  const dir = path.resolve(process.cwd(), "public", "uploads");
  fs.mkdirSync(dir, { recursive: true });
  const file = `${name}-${crypto.randomBytes(4).toString("hex")}.${kind.ext}`;
  fs.writeFileSync(path.join(dir, file), buf);
  return "/uploads/" + file;
}

/** Xóa ảnh đã tải lên (bỏ qua ảnh gốc trong /assets). Lỗi xóa ảnh không làm hỏng thao tác chính. */
export async function deleteImages(urls, req) {
  for (const url of [...new Set(urls.filter(Boolean))]) {
    try {
      if (url.startsWith("/uploads/")) {
        const file = path.resolve(process.cwd(), "public", "uploads", path.basename(url));
        if (fs.existsSync(file)) fs.unlinkSync(file);
      } else if (/\.public\.blob\.vercel-storage\.com\//.test(url)) {
        const auth = blobAuth(req);
        if (!auth) continue;
        const { del } = await import("@vercel/blob");
        await del(url, auth);
      }
    } catch (e) {
      console.warn("Không xóa được ảnh", url, e.message);
    }
  }
}
