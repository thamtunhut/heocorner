/*
 * DỮ LIỆU SẢN PHẨM — HEO CORNER
 * Sửa giá / thêm / bớt sản phẩm tại đây. Không cần đụng vào file khác.
 *
 * id      : tên ảnh trong assets/img/sp/ (không có đuôi). Ảnh lớn là <id>-lg.webp
 * cat     : mã danh mục (xem CATEGORIES bên dưới)
 * variants: mỗi dòng là một quy cách / giá. price tính bằng đồng (số nguyên).
 * badge   : "Mới", "Hot", "Combo"... (tuỳ chọn)
 * abv     : nồng độ cồn (tuỳ chọn)
 */

window.CATEGORIES = [
  { id: "all",    name: "Tất cả" },
  { id: "pho-thong", name: "Bia nhập khẩu & phổ thông", short: "Bia phổ thông" },
  { id: "bi",     name: "Bia Bỉ & Slovakia" },
  { id: "duc",    name: "Bia Đức thượng hạng", short: "Bia Đức" },
  { id: "chau-a", name: "Bia châu Á" },
  { id: "angkor", name: "Bia Angkor" },
  { id: "ruou",   name: "Rượu mạnh & Soju" },
  { id: "bom-5l", name: "Bom 5 lít" }
];

window.PRODUCTS = [
  /* ---------- 1. BIA NHẬP KHẨU & PHỔ THÔNG ---------- */
  { id: "corona-extra", cat: "pho-thong", name: "Corona Extra", origin: "Mexico / Nhập khẩu", badge: "Hot",
    desc: "Bia vàng nhẹ, uống lạnh kèm lát chanh và chút muối là chuẩn bài.",
    variants: [
      { label: "250ml", pack: "Thùng 24 chai", price: 545000 },
      { label: "330ml", pack: "Thùng 24 chai", price: 635000 },
      { label: "355ml (Mexico)", pack: "Thùng 24 chai", price: 898000 }
    ] },
  { id: "heineken-original", cat: "pho-thong", name: "Heineken Original Hà Lan", origin: "Hà Lan",
    desc: "Premium lager nhập khẩu 100% từ Hà Lan.",
    variants: [{ label: "250ml", pack: "Thùng 24 chai", price: 880000 }] },
  { id: "heineken-ken-phap", cat: "pho-thong", name: "Heineken Ken Pháp", origin: "Pháp",
    desc: "Format đặc biệt 24 chai × 250ml, mát lạnh chuẩn vị.",
    variants: [{ label: "250ml", pack: "Thùng 24 chai", price: 880000 }] },
  { id: "budweiser", cat: "pho-thong", name: "Budweiser King of Beers", origin: "Mỹ (SX tại VN)",
    desc: "Biểu tượng bia Mỹ, vị cân bằng, êm và dễ uống.",
    variants: [
      { label: "330ml", pack: "Thùng 24 lon", price: 390000 },
      { label: "250ml", pack: "Thùng 24 lon", price: 300000 }
    ] },
  { id: "michelob-ultra", cat: "pho-thong", name: "Michelob Ultra", origin: "Mỹ", badge: "Low Carb",
    desc: "Bia không đường, low carb — 0g đường, chỉ 68 kcal/lon.",
    variants: [{ label: "250ml", pack: "Thùng 24 lon", price: 270000 }] },
  { id: "1664-blanc", cat: "pho-thong", name: "1664 Blanc", origin: "Pháp (SX tại VN)",
    desc: "Bia lúa mì vị cam thơm mát, êm và dịu.",
    variants: [
      { label: "250ml", pack: "Thùng 24 lon", price: 295000 },
      { label: "330ml", pack: "Thùng 24 lon", price: 395000 }
    ] },
  { id: "tuborg-green", cat: "pho-thong", name: "Tuborg Green", origin: "Đan Mạch",
    desc: "Lager Đan Mạch thanh mát, giá cực mềm.",
    variants: [{ label: "330ml", pack: "Thùng 24 lon", price: 265000 }] },
  { id: "tuborg-ice", cat: "pho-thong", name: "Tuborg Ice — Phiên bản trúng thưởng", origin: "Đan Mạch", badge: "Trúng thưởng",
    desc: "Bật nắp lon có cơ hội trúng thưởng.",
    variants: [{ label: "250ml", pack: "Thùng 20 lon", price: 240000 }] },

  /* ---------- 2. BIA BỈ & SLOVAKIA ---------- */
  { id: "duvel", cat: "bi", name: "Duvel Blond", origin: "Bỉ", abv: "8.5%",
    desc: "Huyền thoại bia Bỉ — Belgian strong blond ale.",
    variants: [{ label: "330ml", pack: "Thùng 24 chai", price: 1568888 }] },
  { id: "la-chouffe", cat: "bi", name: "La Chouffe Blonde", origin: "Bỉ", abv: "8%",
    desc: "Bia vàng Bỉ hương đào, mơ, quýt; thoảng rau mùi và thảo mộc.",
    variants: [{ label: "330ml", pack: "Thùng 24 chai", price: 1568888 }] },
  { id: "kristoffel-blonde", cat: "bi", name: "Kristoffel Blonde", origin: "Bỉ",
    desc: "Bia tu viện Bỉ — cân bằng, thanh dịu, chuẩn Abbey.",
    variants: [{ label: "330ml", pack: "Thùng 24 chai", price: 955000 }] },
  { id: "kristoffel-white", cat: "bi", name: "Kristoffel White", origin: "Bỉ",
    desc: "Bia tu viện Bỉ dòng lúa mì tươi mát.",
    variants: [{ label: "330ml", pack: "Thùng 24 chai", price: 955000 }] },
  { id: "kristoffel-dark", cat: "bi", name: "Kristoffel Dark", origin: "Bỉ",
    desc: "Bia tu viện Bỉ dòng đen, hương caramel và cacao.",
    variants: [{ label: "330ml", pack: "Thùng 24 chai", price: 955000 }] },
  { id: "stella-artois", cat: "bi", name: "Stella Artois", origin: "Bỉ", abv: "5%",
    desc: "Tinh tế vị Bỉ — gắn kết khoảnh khắc.",
    variants: [{ label: "500ml", pack: "Thùng 24 lon", price: 938000 }] },
  { id: "martens-extra", cat: "bi", name: "Martens Extra 7%", origin: "Bỉ", abv: "7%",
    desc: "Bia lager cao cấp từ Bỉ. Mua từ 3 thùng giá còn tốt hơn.",
    variants: [
      { label: "500ml — mua lẻ 1 thùng", pack: "Thùng 24 lon", price: 888888 },
      { label: "500ml — mua từ 3 thùng", pack: "Thùng 24 lon", price: 868868 }
    ] },
  { id: "steiger", cat: "bi", name: "Steiger Vàng / Steiger Đen", origin: "Slovakia", abv: "5%",
    desc: "Truyền thống 500 năm từ 1473 — bia Slovakia nhập khẩu.",
    variants: [{ label: "500ml", pack: "Thùng 24 lon", price: 925000 }] },

  /* ---------- 3. BIA ĐỨC ---------- */
  { id: "paderborner-pilger", cat: "duc", name: "Paderborner Pilger Naturtrüb", origin: "Đức",
    desc: "Bia Đức tự nhiên, nguyên bản 500ml.",
    variants: [{ label: "500ml", pack: "Thùng 24 lon", price: 948000 }] },
  { id: "warsteiner", cat: "duc", name: "Warsteiner Brewers Gold", origin: "Đức", badge: "Mới về",
    desc: "Hương vị vàng từ nước Đức, êm mượt và đậm đà.",
    variants: [{ label: "500ml", pack: "Thùng 24 lon", price: 1395000 }] },
  { id: "apostel-weissbier", cat: "duc", name: "Apostel Weissbier Hell & Dunkel", origin: "Đức", abv: "5.3%",
    desc: "Bia lúa mì truyền thống Đức, hai vị sáng & đen.",
    variants: [{ label: "500ml", pack: "Thùng 24 lon", price: 968000 }] },
  { id: "4-dong-lua-mi-duc", cat: "duc", name: "4 dòng bia lúa mì Đức", origin: "Đức", badge: "Best seller",
    desc: "Königbacher, Karlsbräu, Leikeim, Klosterkeller — thơm mát, dễ uống.",
    variants: [{ label: "500ml", pack: "Thùng 24 lon", price: 968000 }] },
  { id: "eichbaum", cat: "duc", name: "Eichbaum Hefeweizen Hell & Red Lager", origin: "Đức", abv: "5.2% / 5.9%",
    desc: "Since 1679 — lúa mì sáng và red lager đậm caramel.",
    variants: [{ label: "500ml", pack: "Thùng 24 lon", price: 936000 }] },
  { id: "eichbaum-stout-75", cat: "duc", name: "Eichbaum Stout 7.5 Superior", origin: "Đức", abv: "7.5%",
    desc: "Bia đen nhập khẩu Đức — đậm vị, mạnh mẽ.",
    variants: [{ label: "500ml", pack: "Thùng 24 lon", price: 988000 }] },
  { id: "st-wendeler", cat: "duc", name: "St. Wendeler IPA & Weizen", origin: "Đức", abv: "5.0% / 5.1%",
    desc: "IPA thơm hoa bia và Weizen lúa mì êm dịu.",
    variants: [{ label: "500ml", pack: "Thùng 24 lon", price: 925000 }] },
  { id: "kaiserdom", cat: "duc", name: "Kaiserdom", origin: "Đức",
    desc: "Kellerbier, Hefe-Weißbier, Dark Lager, Pilsener — truyền thống từ 1718.",
    variants: [{ label: "500ml", pack: "Thùng 24 lon", price: 925000 }] },
  { id: "konigsbacher-weizen", cat: "duc", name: "Königbacher Weizen", origin: "Đức", abv: "5.1%",
    desc: "Bia lúa mạch truyền thống, vị mềm mại, cân bằng.",
    variants: [{ label: "500ml", pack: "Thùng 24 lon", price: 925000 }] },

  /* ---------- 4. BIA CHÂU Á ---------- */
  { id: "asahi-lon", cat: "chau-a", name: "Asahi Super Dry (lon)", origin: "TQ (CN Nhật)",
    desc: "Karakuchi — vị khô, sắc nét đặc trưng Nhật Bản.",
    variants: [{ label: "Lon 330ml", pack: "Thùng 24 lon", price: 310000 }] },
  { id: "asahi-chai", cat: "chau-a", name: "Asahi Super Dry (chai)", origin: "TQ (CN Nhật)",
    desc: "Rẻ đến không ngờ — chai 330ml.",
    variants: [{ label: "Chai 330ml", pack: "Thùng 24 chai", price: 320000 }] },
  { id: "tsingtao", cat: "chau-a", name: "Bia Tsingtao", origin: "Trung Quốc",
    desc: "Thanh mát sảng khoái, chuẩn chất Trung Hoa.",
    variants: [
      { label: "Chai 640ml", pack: "Thùng 12 chai", price: 520000 },
      { label: "Chai 330ml", pack: "Thùng 24 chai", price: 570000 },
      { label: "Lon 330ml", pack: "Thùng 24 lon", price: 480000 }
    ] },
  { id: "chaliman-1583", cat: "chau-a", name: "Bia Chaliman 1583", origin: "Trung Quốc",
    desc: "Lon 1 lít — đậm đà, dễ uống, hậu vị êm.",
    variants: [{ label: "Lon 1 lít", pack: "Thùng 6 lon", price: 360000 }] },

  /* ---------- 4b. BIA ANGKOR (theo poster cửa hàng) ---------- */
  { id: "angkor-lon", cat: "angkor", name: "Angkor Premium Lager (lon)", origin: "Campuchia", abv: "5%",
    desc: "Niềm tự hào của bia Campuchia.",
    variants: [{ label: "Lon 330ml", pack: "Thùng 24 lon", price: 345000 }] },
  { id: "angkor-sky-lon", cat: "angkor", name: "Angkor Sky (lon)", origin: "Campuchia", abv: "4%",
    desc: "Light & smooth — nhẹ nhàng mà đậm chất.",
    variants: [{ label: "Lon 330ml", pack: "Thùng 24 lon", price: 390000 }] },
  { id: "angkor-nap-giat", cat: "angkor", name: "Angkor chai nắp giật", origin: "Campuchia", abv: "5%",
    desc: "Giựt một cái — “bụp” đã tai! Thơm & ngon hơn bản lon.",
    variants: [{ label: "Chai 330ml", pack: "Thùng 24 chai", price: 550000 }] },
  { id: "angkor-sky-chai", cat: "angkor", name: "Angkor Sky (chai nắp giật)", origin: "Campuchia", abv: "4%",
    desc: "Nhẹ êm, mát lạnh, dễ uống.",
    variants: [{ label: "Chai 330ml", pack: "Thùng 24 chai", price: 570000 }] },
  { id: "angkor-extra-stout", cat: "angkor", name: "Angkor Extra Stout", origin: "Campuchia", abv: "8%",
    desc: "Bia đen 8% — đậm vị, có lực, hương malt rang, caramel, cà phê.",
    variants: [{ label: "Chai 330ml", pack: "Thùng 24 chai", price: 720000 }] },
  { id: "angkor-combo-mix", cat: "angkor", name: "Siêu combo mix Angkor", origin: "Campuchia", badge: "Combo",
    desc: "Thùng 24 chai, 3 loại: 8 Angkor nắp giật, 8 Angkor Sky, 8 Angkor Extra Stout.",
    variants: [{ label: "Mix 3 loại × 8 chai", pack: "Thùng 24 chai", price: 650000 }] },

  /* ---------- 5. RƯỢU MẠNH & SOJU ---------- */
  { id: "jack-daniels", cat: "ruou", name: "Jack Daniel's Old No.7", origin: "Mỹ", abv: "40%",
    desc: "Tennessee Whiskey — huyền thoại whiskey Mỹ.",
    variants: [{ label: "Chai 1 lít", pack: "Chai 1 lít", price: 670000 }] },
  { id: "jagermeister", cat: "ruou", name: "Jägermeister", origin: "Đức", abv: "35%",
    desc: "Thức uống huyền thoại từ nước Đức, 56 loại thảo mộc.",
    variants: [{ label: "Chai 1 lít", pack: "Chai 1 lít", price: 480000 }] },
  { id: "soju-6-vi", cat: "ruou", name: "Soju Hàn Quốc 6 vị", origin: "Hàn Quốc",
    desc: "Đào, táo, dâu, nho, việt quất, truyền thống — mix vị thoải mái.",
    variants: [
      { label: "Chai lẻ 360ml", pack: "Chai 360ml", price: 60000 },
      { label: "Nguyên thùng", pack: "Thùng 20 chai × 360ml", price: 1100000 }
    ] },

  /* ---------- 6. BOM 5 LÍT ---------- */
  { id: "heineken-5l", cat: "bom-5l", name: "Heineken Original — Bình 5 lít", origin: "Hà Lan",
    desc: "Nhập khẩu 100% từ Hà Lan. Mua cặp tiết kiệm hơn.",
    variants: [
      { label: "1 bình", pack: "Bình 5 lít", price: 888000 },
      { label: "1 cặp", pack: "Cặp 2 bình 5 lít", price: 1668000 }
    ] },
  { id: "feldschlosschen-schwarzbier", cat: "bom-5l", name: "Feldschlösschen Schwarzbier", origin: "Đức", abv: "5%", badge: "Mới",
    desc: "Bia đen lager Đức, mạch nha rang, caramel & chocolate.",
    variants: [{ label: "Bình 5 lít", pack: "Bình 5 lít", price: 690000 }] },
  { id: "feldschlosschen-hefeweizen", cat: "bom-5l", name: "Feldschlösschen Hefeweizen", origin: "Đức", abv: "5%", badge: "Mới",
    desc: "Bia lúa mì Đức, hương chuối chín & đinh hương.",
    variants: [{ label: "Bình 5 lít", pack: "Bình 5 lít", price: 690000 }] }
];
