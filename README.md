# Heo Corner — Website & trang quản trị

Website giới thiệu bia & rượu nhập khẩu của Heo Corner (135 Âu Cơ, P. Hòa Bình, TP.HCM) kèm trang quản trị `/admin`.
Chạy được miễn phí trên **Vercel** (gói Hobby) + **Upstash Redis** (lưu dữ liệu) + **Vercel Blob** (lưu ảnh).

## Cấu trúc

```
public/            Trang tĩnh (Vercel phục vụ thư mục này)
  index.html       Trang khách — đọc sản phẩm từ /api/products
  admin/           Trang quản trị (đăng nhập, thống kê, sản phẩm…)
  assets/          CSS, JS, ảnh poster gốc
api/index.js       1 serverless function duy nhất, mọi /api/* rewrite về đây
lib/               Logic backend: store (Redis/file), auth, data, stats, images, router
data/seed.js       Dữ liệu khởi tạo (chỉ dùng khi database còn trống)
dev-server.js      Server chạy thử local
tests/             Test API (npm test)
```

## Chạy thử trên máy (local)

```bash
npm install
cp .env.example .env.local   # rồi điền ADMIN_USERNAME, ADMIN_PASSWORD, SESSION_SECRET
npm run dev
```

- Trang khách: http://localhost:5173
- Trang quản trị: http://localhost:5173/admin/
- Local lưu dữ liệu ở `data/local-db.json`, ảnh ở `public/uploads/` (đều không commit). Xóa 2 thứ này để về dữ liệu ban đầu.
- `npm test` chạy bộ test API trên database tạm.

## Tính năng quản trị

- Đăng nhập tài khoản/mật khẩu; **sai 5 lần khóa 30 phút** (theo tài khoản và theo IP); phiên 8 giờ; đổi mật khẩu đăng xuất mọi thiết bị.
- Thống kê **khách truy cập hôm nay / 7 ngày / 30 ngày** (khách duy nhất), lượt xem trang, lượt bấm Zalo, biểu đồ 30 ngày, sản phẩm được xem nhiều. Không đếm bot và không đếm admin.
- Thêm / sửa / xóa sản phẩm, ảnh tự nén WebP trong trình duyệt.
- Tình trạng **Còn hàng / Tạm hết / Ngừng bán**, ẩn/hiện, ghim lên đầu, sắp xếp thứ tự, giá cũ (khuyến mãi).
- Quản lý danh mục, thanh thông báo đầu trang, nhật ký hoạt động, sao lưu/khôi phục JSON.

## Triển khai lên Vercel (khi sẵn sàng)

1. Import repo vào Vercel (Framework: **Other**, không cần build command).
2. **Storage → Upstash (Redis)** từ Marketplace → gắn vào project (tự thêm `KV_REST_API_URL`, `KV_REST_API_TOKEN`).
3. **Storage → Blob** → gắn vào project (tự thêm `BLOB_READ_WRITE_TOKEN`).
4. **Settings → Environment Variables**: thêm `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `SESSION_SECRET` (chuỗi ngẫu nhiên ≥ 32 ký tự).
5. Deploy, đăng nhập `/admin` và **đổi mật khẩu ngay**.
