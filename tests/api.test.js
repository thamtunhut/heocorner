// Test API end-to-end trên database tạm (không ảnh hưởng data/local-db.json).
// Chạy: npm test
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const TMP_DB = path.join(os.tmpdir(), `heo-test-${process.pid}.json`);
process.env.LOCAL_DB_FILE = TMP_DB;
process.env.ADMIN_USERNAME = "admin";
process.env.ADMIN_PASSWORD = "Test1234pass";
process.env.SESSION_SECRET = "x".repeat(40);
delete process.env.KV_REST_API_URL;
delete process.env.BLOB_READ_WRITE_TOKEN;

const { handle } = await import("../lib/router.js");
let server, base;
const BROWSER = "Mozilla/5.0 (Windows NT 10.0) Chrome/130 Safari/537.36";

before(async () => {
  server = http.createServer(handle);
  await new Promise((r) => server.listen(0, r));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => {
  server.close();
  fs.rmSync(TMP_DB, { force: true });
});

async function call(method, url, { body, cookie, csrf = true, ua = BROWSER, raw } = {}) {
  const headers = { "User-Agent": ua };
  if (csrf) headers["X-Requested-With"] = "heo-admin";
  if (cookie) headers.Cookie = cookie;
  let payload;
  if (raw) { payload = raw; headers["Content-Type"] = "application/octet-stream"; }
  else if (body !== undefined) { payload = JSON.stringify(body); headers["Content-Type"] = "application/json"; }
  const res = await fetch(base + url, { method, headers, body: payload });
  const text = await res.text();
  return { status: res.status, data: text ? JSON.parse(text) : null, cookie: (res.headers.get("set-cookie") || "").split(";")[0] };
}
async function login(password = "Test1234pass") {
  const r = await call("POST", "/api/auth/login", { body: { username: "admin", password } });
  assert.equal(r.status, 200, JSON.stringify(r.data));
  return r.cookie;
}

const sample = {
  name: "Bia Thử Nghiệm 330ml", cat: "duc", origin: "Đức", abv: "5%", badge: "Mới", desc: "Mô tả <b>test</b>",
  status: "available", visible: true,
  variants: [{ label: "330ml", pack: "Thùng 24 lon", price: 500000, oldPrice: 550000 }]
};

test("trang khách lấy được danh mục và sản phẩm ban đầu", async () => {
  const r = await call("GET", "/api/products", { csrf: false });
  assert.equal(r.status, 200);
  assert.equal(r.data.products.length, 41);
  assert.equal(r.data.categories.length, 7);
  assert.ok(!("createdAt" in r.data.products[0]), "không lộ trường nội bộ");
});

test("chặn request thiếu header chống CSRF và chặn khi chưa đăng nhập", async () => {
  assert.equal((await call("POST", "/api/auth/login", { body: { username: "admin", password: "x" }, csrf: false })).status, 403);
  assert.equal((await call("GET", "/api/admin/products")).status, 401);
  assert.equal((await call("GET", "/api/admin/stats")).status, 401);
  assert.equal((await call("POST", "/api/admin/products", { body: sample })).status, 401);
});

test("đăng nhập đúng tạo phiên; cookie giả bị từ chối", async () => {
  const cookie = await login();
  assert.match(cookie, /^hc_admin=/);
  const me = await call("GET", "/api/auth/me", { cookie });
  assert.equal(me.status, 200);
  assert.equal(me.data.username, "admin");
  const forged = cookie.slice(0, -3) + "abc";
  assert.equal((await call("GET", "/api/auth/me", { cookie: forged })).status, 401);
});

test("thêm / sửa tình trạng / ẩn / xóa sản phẩm", async () => {
  const cookie = await login();
  const bad = await call("POST", "/api/admin/products", { cookie, body: { ...sample, variants: [] } });
  assert.equal(bad.status, 400);
  const badCat = await call("POST", "/api/admin/products", { cookie, body: { ...sample, cat: "khong-co" } });
  assert.equal(badCat.status, 400);
  const badImg = await call("POST", "/api/admin/products", { cookie, body: { ...sample, image: { thumb: "javascript:alert(1)" } } });
  assert.equal(badImg.status, 400);
  // CSRF: thay đổi dữ liệu mà thiếu header phải bị chặn dù có cookie
  assert.equal((await call("POST", "/api/admin/products", { cookie, body: sample, csrf: false })).status, 403);

  const c = await call("POST", "/api/admin/products", { cookie, body: sample });
  assert.equal(c.status, 201);
  const id = c.data.product.id;
  assert.equal(id, "bia-thu-nghiem-330ml");
  assert.equal(c.data.product.variants[0].oldPrice, 550000);

  let pub = await call("GET", "/api/products", { csrf: false });
  assert.equal(pub.data.products.length, 42);

  const u = await call("PUT", `/api/admin/products/${id}`, { cookie, body: { status: "out" } });
  assert.equal(u.status, 200);
  assert.equal(u.data.product.status, "out");
  assert.equal(u.data.product.name, sample.name, "sửa 1 trường không làm mất trường khác");
  assert.equal((await call("PUT", `/api/admin/products/${id}`, { cookie, body: { status: "het" } })).status, 400);

  await call("PUT", `/api/admin/products/${id}`, { cookie, body: { status: "discontinued" } });
  pub = await call("GET", "/api/products", { csrf: false });
  assert.equal(pub.data.products.at(-1).id, id, "ngừng bán xếp cuối danh sách");

  await call("PUT", `/api/admin/products/${id}`, { cookie, body: { visible: false } });
  pub = await call("GET", "/api/products", { csrf: false });
  assert.ok(!pub.data.products.some((p) => p.id === id), "sản phẩm ẩn không hiện cho khách");

  const d = await call("DELETE", `/api/admin/products/${id}`, { cookie });
  assert.equal(d.status, 200);
  assert.equal((await call("DELETE", `/api/admin/products/${id}`, { cookie })).status, 404);
  const logs = await call("GET", "/api/admin/logs", { cookie });
  assert.ok(logs.data.logs.some((l) => l.action === "delete"));
});

test("ghim nổi bật và sắp xếp thứ tự", async () => {
  const cookie = await login();
  await call("PUT", "/api/admin/products/jagermeister", { cookie, body: { featured: true } });
  let pub = await call("GET", "/api/products", { csrf: false });
  assert.equal(pub.data.products[0].id, "jagermeister");
  await call("PUT", "/api/admin/products/jagermeister", { cookie, body: { featured: false } });

  const all = (await call("GET", "/api/admin/products", { cookie })).data.products.map((p) => p.id);
  const ids = [all[1], all[0], ...all.slice(2)];
  assert.equal((await call("PUT", "/api/admin/products-order", { cookie, body: { ids } })).status, 200);
  pub = await call("GET", "/api/products", { csrf: false });
  assert.equal(pub.data.products[0].id, all[1]);
});

test("tải ảnh lên: nhận WebP thật, từ chối file không phải ảnh", async () => {
  const cookie = await login();
  const webp = Buffer.concat([Buffer.from("RIFF"), Buffer.alloc(4), Buffer.from("WEBPVP8 "), Buffer.alloc(32)]);
  const ok = await call("POST", "/api/admin/upload?name=test-anh", { cookie, raw: webp });
  assert.equal(ok.status, 201);
  assert.match(ok.data.url, /^\/uploads\/test-anh-[0-9a-f]+\.webp$/);
  const file = path.resolve("public", ok.data.url.slice(1));
  assert.ok(fs.existsSync(file));

  const bad = await call("POST", "/api/admin/upload?name=x", { cookie, raw: Buffer.from("<script>alert(1)</script>") });
  assert.equal(bad.status, 400);

  // Tạo sản phẩm dùng ảnh đó rồi xóa => ảnh được dọn
  const c = await call("POST", "/api/admin/products", { cookie, body: { ...sample, name: "SP Có Ảnh", image: { thumb: ok.data.url, large: ok.data.url } } });
  assert.equal(c.status, 201);
  await call("DELETE", `/api/admin/products/${c.data.product.id}`, { cookie });
  assert.ok(!fs.existsSync(file), "ảnh tải lên bị xóa cùng sản phẩm");
});

test("thống kê: đếm khách, bỏ qua bot và lượt của admin", async () => {
  const cookie = await login();
  await call("POST", "/api/track", { body: { type: "pageview" }, csrf: false });
  await call("POST", "/api/track", { body: { type: "pageview" }, csrf: false }); // cùng khách => 1 khách, 2 lượt xem
  await call("POST", "/api/track", { body: { type: "pageview" }, csrf: false, ua: BROWSER + " Firefox" }); // khách khác
  await call("POST", "/api/track", { body: { type: "pageview" }, csrf: false, ua: "Googlebot/2.1" });
  await call("POST", "/api/track", { body: { type: "pageview" }, csrf: false, cookie });
  await call("POST", "/api/track", { body: { type: "zalo" }, csrf: false });
  await call("POST", "/api/track", { body: { type: "product", id: "duvel" }, csrf: false });
  await call("POST", "/api/track", { body: { type: "product", id: "duvel" }, csrf: false });

  const s = await call("GET", "/api/admin/stats", { cookie });
  assert.equal(s.status, 200);
  assert.equal(s.data.today.visitors, 2);
  assert.equal(s.data.today.pageviews, 3);
  assert.equal(s.data.today.zalo, 1);
  assert.equal(s.data.week.visitors, 2);
  assert.equal(s.data.month.visitors, 2);
  assert.equal(s.data.series.length, 30);
  assert.equal(s.data.topProducts[0].id, "duvel");
  assert.equal(s.data.topProducts[0].views, 2);
  assert.equal(s.data.products.total, 41);
});

test("danh mục: không cho xóa danh mục còn sản phẩm, cho thêm mới", async () => {
  const cookie = await login();
  const cur = (await call("GET", "/api/admin/categories", { cookie })).data.categories;
  const del = await call("PUT", "/api/admin/categories", { cookie, body: { categories: cur.filter((c) => c.id !== "duc") } });
  assert.equal(del.status, 400);
  const add = await call("PUT", "/api/admin/categories", { cookie, body: { categories: [...cur, { name: "Rượu vang" }] } });
  assert.equal(add.status, 200);
  assert.equal(add.data.categories.at(-1).id, "ruou-vang");
});

test("thông báo đầu trang hiện cho khách và kiểm tra liên kết", async () => {
  const cookie = await login();
  assert.equal((await call("PUT", "/api/admin/settings", { cookie, body: { announcement: { enabled: true, text: "KM", link: "javascript:alert(1)" } } })).status, 400);
  assert.equal((await call("PUT", "/api/admin/settings", { cookie, body: { announcement: { enabled: true, text: "" } } })).status, 400);
  const ok = await call("PUT", "/api/admin/settings", { cookie, body: { announcement: { enabled: true, text: "Giảm 5%", link: "#san-pham" } } });
  assert.equal(ok.status, 200);
  const pub = await call("GET", "/api/products", { csrf: false });
  assert.equal(pub.data.settings.announcement.text, "Giảm 5%");
});

test("sao lưu và khôi phục", async () => {
  const cookie = await login();
  const dump = (await call("GET", "/api/admin/export", { cookie })).data;
  assert.equal(dump.app, "heo-corner");
  const n = dump.products.length;
  const small = { ...dump, products: dump.products.slice(0, 3) };
  const r = await call("POST", "/api/admin/import", { cookie, body: small });
  assert.equal(r.status, 200);
  assert.equal((await call("GET", "/api/products", { csrf: false })).data.products.length, 3);
  assert.equal((await call("POST", "/api/admin/import", { cookie, body: { foo: 1 } })).status, 400);
  await call("POST", "/api/admin/import", { cookie, body: dump });
  assert.equal((await call("GET", "/api/admin/products", { cookie })).data.products.length, n);
});

test("đổi mật khẩu: phiên cũ mất hiệu lực", async () => {
  const cookie = await login();
  assert.equal((await call("POST", "/api/auth/password", { cookie, body: { current: "sai", next: "Moi12345" } })).status, 400);
  assert.equal((await call("POST", "/api/auth/password", { cookie, body: { current: "Test1234pass", next: "ngan1" } })).status, 400);
  const ok = await call("POST", "/api/auth/password", { cookie, body: { current: "Test1234pass", next: "Moi12345abc" } });
  assert.equal(ok.status, 200);
  assert.equal((await call("GET", "/api/auth/me", { cookie })).status, 401, "cookie cũ hết hiệu lực");
  assert.equal((await call("GET", "/api/auth/me", { cookie: ok.cookie })).status, 200, "cookie mới dùng được");
  process.env.ADMIN_PASSWORD = "Moi12345abc";
});

// Để cuối cùng vì sẽ khóa IP 127.0.0.1 trong 30 phút
test("sai mật khẩu 5 lần thì khóa 30 phút, kể cả khi nhập đúng", async () => {
  for (let i = 1; i <= 4; i++) {
    const r = await call("POST", "/api/auth/login", { body: { username: "admin", password: "sai-" + i } });
    assert.equal(r.status, 401);
    assert.equal(r.data.remaining, 5 - i);
  }
  const fifth = await call("POST", "/api/auth/login", { body: { username: "admin", password: "sai-5" } });
  assert.equal(fifth.status, 429);
  assert.equal(fifth.data.retryAfter, 1800);

  const right = await call("POST", "/api/auth/login", { body: { username: "admin", password: "Moi12345abc" } });
  assert.equal(right.status, 429, "đang khóa thì mật khẩu đúng cũng bị từ chối");
  assert.ok(right.data.retryAfter > 1790);

  const otherUser = await call("POST", "/api/auth/login", { body: { username: "khac", password: "x" } });
  assert.equal(otherUser.status, 429, "khóa theo IP: đổi tên đăng nhập cũng không né được");

  const logs = JSON.parse(fs.readFileSync(TMP_DB, "utf8"))["db:logs"].v.map((x) => JSON.parse(x));
  assert.ok(logs.some((l) => l.action === "lock"));
});
