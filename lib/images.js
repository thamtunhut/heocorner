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

const useBlob = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

export async function saveImage(buf, baseName) {
  if (!buf || !buf.length) throw new HttpError(400, "Chưa có dữ liệu ảnh");
  if (buf.length > MAX_BYTES) throw new HttpError(413, "Ảnh quá lớn (tối đa 3MB sau khi nén)");
  const kind = sniff(buf);
  if (!kind) throw new HttpError(400, "Chỉ hỗ trợ ảnh WebP, JPG hoặc PNG");
  const name = String(baseName || "anh").toLowerCase().replace(/[^a-z0-9-]+/g, "-").slice(0, 60) || "anh";

  if (useBlob()) {
    const { put } = await import("@vercel/blob");
    const r = await put(`products/${name}.${kind.ext}`, buf, {
      access: "public", contentType: kind.type, addRandomSuffix: true, cacheControlMaxAge: 31536000
    });
    return r.url;
  }
  if (process.env.VERCEL) throw new HttpError(500, "Chưa cấu hình Vercel Blob (BLOB_READ_WRITE_TOKEN) để lưu ảnh.");

  const dir = path.resolve(process.cwd(), "public", "uploads");
  fs.mkdirSync(dir, { recursive: true });
  const file = `${name}-${crypto.randomBytes(4).toString("hex")}.${kind.ext}`;
  fs.writeFileSync(path.join(dir, file), buf);
  return "/uploads/" + file;
}

/** Xóa ảnh đã tải lên (bỏ qua ảnh gốc trong /assets). Lỗi xóa ảnh không làm hỏng thao tác chính. */
export async function deleteImages(urls) {
  for (const url of [...new Set(urls.filter(Boolean))]) {
    try {
      if (url.startsWith("/uploads/")) {
        const file = path.resolve(process.cwd(), "public", "uploads", path.basename(url));
        if (fs.existsSync(file)) fs.unlinkSync(file);
      } else if (/\.public\.blob\.vercel-storage\.com\//.test(url) && useBlob()) {
        const { del } = await import("@vercel/blob");
        await del(url);
      }
    } catch (e) {
      console.warn("Không xóa được ảnh", url, e.message);
    }
  }
}
