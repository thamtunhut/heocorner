# Heo Corner — Website giới thiệu sản phẩm

Trang tĩnh (HTML/CSS/JS) giới thiệu bia & rượu nhập khẩu của Heo Corner — 135 Âu Cơ, P. Hòa Bình, TP.HCM.

## Cấu trúc

- `index.html` — trang chính
- `assets/css/style.css` — giao diện
- `assets/js/products.js` — **dữ liệu sản phẩm & giá** (sửa giá ở đây)
- `assets/js/app.js` — lọc, tìm kiếm, popup, nút Zalo
- `assets/img/sp/` — ảnh poster (`<id>.webp` cho thẻ, `<id>-lg.webp` cho popup)

## Chạy thử local

```bash
python -m http.server 5173
```

Mở http://localhost:5173

Sau khi sửa CSS/JS, tăng số `?v=` trong `index.html` để trình duyệt không dùng bản cũ.
