// Test lưu ảnh lên Vercel Blob bằng cách xác thực mới (BLOB_STORE_ID + OIDC),
// dùng server Blob giả qua VERCEL_BLOB_API_URL — không cần tài khoản Vercel thật.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";

const seen = [];
let fake, base;

before(async () => {
  fake = http.createServer((req, res) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      seen.push({ method: req.method, url: req.url, headers: req.headers, size: Buffer.concat(chunks).length });
      res.setHeader("Content-Type", "application/json");
      if (req.url.startsWith("/delete")) return res.end("{}");
      const pathname = new URL(req.url, "http://x").searchParams.get("pathname") || "x";
      const url = `https://abc123.public.blob.vercel-storage.com/${pathname.replace(/\.webp$/, "-RND.webp")}`;
      res.end(JSON.stringify({ url, downloadUrl: url + "?download=1", pathname, contentType: "image/webp", contentDisposition: "inline", etag: "1" }));
    });
  });
  await new Promise((r) => fake.listen(0, r));
  base = `http://127.0.0.1:${fake.address().port}`;
  Object.assign(process.env, { VERCEL: "1", VERCEL_BLOB_API_URL: base, BLOB_STORE_ID: "store_abc123" });
  delete process.env.BLOB_READ_WRITE_TOKEN;
  delete process.env.VERCEL_OIDC_TOKEN;
});
after(() => {
  fake.close();
  for (const k of ["VERCEL", "VERCEL_BLOB_API_URL", "BLOB_STORE_ID"]) delete process.env[k];
});

const { saveImage, deleteImages } = await import("../lib/images.js");
const webp = Buffer.concat([Buffer.from("RIFF"), Buffer.alloc(4), Buffer.from("WEBPVP8 "), Buffer.alloc(64)]);

test("có BLOB_STORE_ID nhưng thiếu token OIDC thì báo lỗi rõ ràng", async () => {
  await assert.rejects(() => saveImage(webp, "anh", { headers: {} }), /OIDC/);
});

test("tải ảnh bằng BLOB_STORE_ID + header x-vercel-oidc-token", async () => {
  const req = { headers: { "x-vercel-oidc-token": "fake.oidc.token" } };
  const url = await saveImage(webp, "bia-test", req);
  assert.match(url, /^https:\/\/abc123\.public\.blob\.vercel-storage\.com\/products\/bia-test/);
  const put = seen.find((r) => r.method === "PUT");
  assert.ok(put, "đã gọi API Blob");
  assert.equal(put.headers.authorization, "Bearer fake.oidc.token");
  assert.equal(put.headers["x-vercel-blob-store-id"], "abc123");
  assert.equal(put.size, webp.length);

  await deleteImages([url], req);
  const del = seen.find((r) => r.url.startsWith("/delete"));
  assert.ok(del, "đã gọi API xóa ảnh");
  assert.equal(del.headers.authorization, "Bearer fake.oidc.token");
});

test("trên Vercel mà chưa kết nối Blob thì báo cần kết nối", async () => {
  delete process.env.BLOB_STORE_ID;
  await assert.rejects(() => saveImage(webp, "anh", { headers: {} }), /Chưa kết nối Vercel Blob/);
  process.env.BLOB_STORE_ID = "store_abc123";
});
