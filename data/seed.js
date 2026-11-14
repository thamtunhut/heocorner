// Dữ liệu khởi tạo — chỉ dùng lần đầu khi database còn trống.
export default {
  "categories": [
    {
      "id": "pho-thong",
      "name": "Bia nhập khẩu & phổ thông",
      "short": "Bia phổ thông"
    },
    {
      "id": "bi",
      "name": "Bia Bỉ & Slovakia",
      "short": ""
    },
    {
      "id": "duc",
      "name": "Bia Đức thượng hạng",
      "short": "Bia Đức"
    },
    {
      "id": "chau-a",
      "name": "Bia châu Á",
      "short": ""
    },
    {
      "id": "angkor",
      "name": "Bia Angkor",
      "short": ""
    },
    {
      "id": "ruou",
      "name": "Rượu mạnh & Soju",
      "short": ""
    },
    {
      "id": "bom-5l",
      "name": "Bom 5 lít",
      "short": ""
    }
  ],
  "products": [
    {
      "id": "corona-extra",
      "name": "Corona Extra",
      "cat": "pho-thong",
      "origin": "Mexico / Nhập khẩu",
      "abv": "",
      "badge": "Hot",
      "desc": "Bia vàng nhẹ, uống lạnh kèm lát chanh và chút muối là chuẩn bài.",
      "status": "available",
      "visible": true,
      "featured": false,
      "image": {
        "thumb": "/assets/img/sp/corona-extra.webp",
        "large": "/assets/img/sp/corona-extra-lg.webp"
      },
      "variants": [
        {
          "label": "250ml",
          "pack": "Thùng 24 chai",
          "price": 545000,
          "oldPrice": null
        },
        {
          "label": "330ml",
          "pack": "Thùng 24 chai",
          "price": 635000,
          "oldPrice": null
        },
        {
          "label": "355ml (Mexico)",
          "pack": "Thùng 24 chai",
          "price": 898000,
          "oldPrice": null
        }
      ],
      "createdAt": "2026-11-14T14:54:31.333Z",
      "updatedAt": "2026-11-14T14:54:31.333Z"
    },
    {
      "id": "heineken-original",
      "name": "Heineken Original Hà Lan",
      "cat": "pho-thong",
      "origin": "Hà Lan",
      "abv": "",
      "badge": "",
      "desc": "Premium lager nhập khẩu 100% từ Hà Lan.",
      "status": "available",
      "visible": true,
      "featured": false,
      "image": {
        "thumb": "/assets/img/sp/heineken-original.webp",
        "large": "/assets/img/sp/heineken-original-lg.webp"
      },
      "variants": [
        {
          "label": "250ml",
          "pack": "Thùng 24 chai",
          "price": 880000,
          "oldPrice": null
        }
      ],
      "createdAt": "2026-11-14T14:54:31.333Z",
      "updatedAt": "2026-11-14T14:54:31.333Z"
    },
    {
      "id": "heineken-ken-phap",
      "name": "Heineken Ken Pháp",
      "cat": "pho-thong",
      "origin": "Pháp",
      "abv": "",
      "badge": "",
      "desc": "Format đặc biệt 24 chai × 250ml, mát lạnh chuẩn vị.",
      "status": "available",
      "visible": true,
      "featured": false,
      "image": {
        "thumb": "/assets/img/sp/heineken-ken-phap.webp",
        "large": "/assets/img/sp/heineken-ken-phap-lg.webp"
      },
      "variants": [
        {
          "label": "250ml",
          "pack": "Thùng 24 chai",
          "price": 880000,
          "oldPrice": null
        }
      ],
      "createdAt": "2026-11-14T14:54:31.333Z",
      "updatedAt": "2026-11-14T14:54:31.333Z"
    },
    {
      "id": "budweiser",
      "name": "Budweiser King of Beers",
      "cat": "pho-thong",
      "origin": "Mỹ (SX tại VN)",
      "abv": "",
      "badge": "",
      "desc": "Biểu tượng bia Mỹ, vị cân bằng, êm và dễ uống.",
      "status": "available",
      "visible": true,
      "featured": false,
      "image": {
        "thumb": "/assets/img/sp/budweiser.webp",
        "large": "/assets/img/sp/budweiser-lg.webp"
      },
      "variants": [
        {
          "label": "330ml",
          "pack": "Thùng 24 lon",
          "price": 390000,
          "oldPrice": null
        },
        {
          "label": "250ml",
          "pack": "Thùng 24 lon",
          "price": 300000,
          "oldPrice": null
        }
      ],
      "createdAt": "2026-11-14T14:54:31.333Z",
      "updatedAt": "2026-11-14T14:54:31.333Z"
    },
    {
      "id": "michelob-ultra",
      "name": "Michelob Ultra",
      "cat": "pho-thong",
      "origin": "Mỹ",
      "abv": "",
      "badge": "Low Carb",
      "desc": "Bia không đường, low carb — 0g đường, chỉ 68 kcal/lon.",
      "status": "available",
      "visible": true,
      "featured": false,
      "image": {
        "thumb": "/assets/img/sp/michelob-ultra.webp",
        "large": "/assets/img/sp/michelob-ultra-lg.webp"
      },
      "variants": [
        {
          "label": "250ml",
          "pack": "Thùng 24 lon",
          "price": 270000,
          "oldPrice": null
        }
      ],
      "createdAt": "2026-11-14T14:54:31.333Z",
      "updatedAt": "2026-11-14T14:54:31.333Z"
    },
    {
      "id": "1664-blanc",
      "name": "1664 Blanc",
      "cat": "pho-thong",
      "origin": "Pháp (SX tại VN)",
      "abv": "",
      "badge": "",
      "desc": "Bia lúa mì vị cam thơm mát, êm và dịu.",
      "status": "available",
      "visible": true,
      "featured": false,
      "image": {
        "thumb": "/assets/img/sp/1664-blanc.webp",
        "large": "/assets/img/sp/1664-blanc-lg.webp"
      },
      "variants": [
        {
          "label": "250ml",
          "pack": "Thùng 24 lon",
          "price": 295000,
          "oldPrice": null
        },
        {
          "label": "330ml",
          "pack": "Thùng 24 lon",
          "price": 395000,
          "oldPrice": null
        }
      ],
      "createdAt": "2026-11-14T14:54:31.333Z",
      "updatedAt": "2026-11-14T14:54:31.333Z"
    },
    {
      "id": "tuborg-green",
      "name": "Tuborg Green",
      "cat": "pho-thong",
      "origin": "Đan Mạch",
      "abv": "",
      "badge": "",
      "desc": "Lager Đan Mạch thanh mát, giá cực mềm.",
      "status": "available",
      "visible": true,
      "featured": false,
      "image": {
        "thumb": "/assets/img/sp/tuborg-green.webp",
        "large": "/assets/img/sp/tuborg-green-lg.webp"
      },
      "variants": [
        {
          "label": "330ml",
          "pack": "Thùng 24 lon",
          "price": 265000,
          "oldPrice": null
        }
      ],
      "createdAt": "2026-11-14T14:54:31.333Z",
      "updatedAt": "2026-11-14T14:54:31.333Z"
    },
    {
      "id": "tuborg-ice",
      "name": "Tuborg Ice — Phiên bản trúng thưởng",
      "cat": "pho-thong",
      "origin": "Đan Mạch",
      "abv": "",
      "badge": "Trúng thưởng",
      "desc": "Bật nắp lon có cơ hội trúng thưởng.",
      "status": "available",
      "visible": true,
      "featured": false,
      "image": {
        "thumb": "/assets/img/sp/tuborg-ice.webp",
        "large": "/assets/img/sp/tuborg-ice-lg.webp"
      },
      "variants": [
        {
          "label": "250ml",
          "pack": "Thùng 20 lon",
          "price": 240000,
          "oldPrice": null
        }
      ],
      "createdAt": "2026-11-14T14:54:31.333Z",
      "updatedAt": "2026-11-14T14:54:31.333Z"
    },
    {
      "id": "duvel",
      "name": "Duvel Blond",
      "cat": "bi",
      "origin": "Bỉ",
      "abv": "8.5%",
      "badge": "",
      "desc": "Huyền thoại bia Bỉ — Belgian strong blond ale.",
      "status": "available",
      "visible": true,
      "featured": false,
      "image": {
        "thumb": "/assets/img/sp/duvel.webp",
        "large": "/assets/img/sp/duvel-lg.webp"
      },
      "variants": [
        {
          "label": "330ml",
          "pack": "Thùng 24 chai",
          "price": 1568888,
          "oldPrice": null
        }
      ],
      "createdAt": "2026-11-14T14:54:31.333Z",
      "updatedAt": "2026-11-14T14:54:31.333Z"
    },
    {
      "id": "la-chouffe",
      "name": "La Chouffe Blonde",
      "cat": "bi",
      "origin": "Bỉ",
      "abv": "8%",
      "badge": "",
      "desc": "Bia vàng Bỉ hương đào, mơ, quýt; thoảng rau mùi và thảo mộc.",
      "status": "available",
      "visible": true,
      "featured": false,
      "image": {
        "thumb": "/assets/img/sp/la-chouffe.webp",
        "large": "/assets/img/sp/la-chouffe-lg.webp"
      },
      "variants": [
        {
          "label": "330ml",
          "pack": "Thùng 24 chai",
          "price": 1568888,
          "oldPrice": null
        }
      ],
      "createdAt": "2026-11-14T14:54:31.333Z",
      "updatedAt": "2026-11-14T14:54:31.333Z"
    },
    {
      "id": "kristoffel-blonde",
      "name": "Kristoffel Blonde",
      "cat": "bi",
      "origin": "Bỉ",
      "abv": "",
      "badge": "",
      "desc": "Bia tu viện Bỉ — cân bằng, thanh dịu, chuẩn Abbey.",
      "status": "available",
      "visible": true,
      "featured": false,
      "image": {
        "thumb": "/assets/img/sp/kristoffel-blonde.webp",
        "large": "/assets/img/sp/kristoffel-blonde-lg.webp"
      },
      "variants": [
        {
          "label": "330ml",
          "pack": "Thùng 24 chai",
          "price": 955000,
          "oldPrice": null
        }
      ],
      "createdAt": "2026-11-14T14:54:31.333Z",
      "updatedAt": "2026-11-14T14:54:31.333Z"
    },
    {
      "id": "kristoffel-white",
      "name": "Kristoffel White",
      "cat": "bi",
      "origin": "Bỉ",
      "abv": "",
      "badge": "",
      "desc": "Bia tu viện Bỉ dòng lúa mì tươi mát.",
      "status": "available",
      "visible": true,
      "featured": false,
      "image": {
        "thumb": "/assets/img/sp/kristoffel-white.webp",
        "large": "/assets/img/sp/kristoffel-white-lg.webp"
      },
      "variants": [
        {
          "label": "330ml",
          "pack": "Thùng 24 chai",
          "price": 955000,
          "oldPrice": null
        }
      ],
      "createdAt": "2026-11-14T14:54:31.333Z",
      "updatedAt": "2026-11-14T14:54:31.333Z"
    },
    {
      "id": "kristoffel-dark",
      "name": "Kristoffel Dark",
      "cat": "bi",
      "origin": "Bỉ",
      "abv": "",
      "badge": "",
      "desc": "Bia tu viện Bỉ dòng đen, hương caramel và cacao.",
      "status": "available",
      "visible": true,
      "featured": false,
      "image": {
        "thumb": "/assets/img/sp/kristoffel-dark.webp",
        "large": "/assets/img/sp/kristoffel-dark-lg.webp"
      },
      "variants": [
        {
          "label": "330ml",
          "pack": "Thùng 24 chai",
          "price": 955000,
          "oldPrice": null
        }
      ],
      "createdAt": "2026-11-14T14:54:31.333Z",
      "updatedAt": "2026-11-14T14:54:31.333Z"
    },
    {
      "id": "stella-artois",
      "name": "Stella Artois",
      "cat": "bi",
      "origin": "Bỉ",
      "abv": "5%",
      "badge": "",
      "desc": "Tinh tế vị Bỉ — gắn kết khoảnh khắc.",
      "status": "available",
      "visible": true,
      "featured": false,
      "image": {
        "thumb": "/assets/img/sp/stella-artois.webp",
        "large": "/assets/img/sp/stella-artois-lg.webp"
      },
      "variants": [
        {
          "label": "500ml",
          "pack": "Thùng 24 lon",
          "price": 938000,
          "oldPrice": null
        }
      ],
      "createdAt": "2026-11-14T14:54:31.333Z",
      "updatedAt": "2026-11-14T14:54:31.333Z"
    },
    {
      "id": "martens-extra",
      "name": "Martens Extra 7%",
      "cat": "bi",
      "origin": "Bỉ",
      "abv": "7%",
      "badge": "",
      "desc": "Bia lager cao cấp từ Bỉ. Mua từ 3 thùng giá còn tốt hơn.",
      "status": "available",
      "visible": true,
      "featured": false,
      "image": {
        "thumb": "/assets/img/sp/martens-extra.webp",
        "large": "/assets/img/sp/martens-extra-lg.webp"
      },
      "variants": [
        {
          "label": "500ml — mua lẻ 1 thùng",
          "pack": "Thùng 24 lon",
          "price": 888888,
          "oldPrice": null
        },
        {
          "label": "500ml — mua từ 3 thùng",
          "pack": "Thùng 24 lon",
          "price": 868868,
          "oldPrice": null
        }
      ],
      "createdAt": "2026-11-14T14:54:31.333Z",
      "updatedAt": "2026-11-14T14:54:31.333Z"
    },
    {
      "id": "steiger",
      "name": "Steiger Vàng / Steiger Đen",
      "cat": "bi",
      "origin": "Slovakia",
      "abv": "5%",
      "badge": "",
      "desc": "Truyền thống 500 năm từ 1473 — bia Slovakia nhập khẩu.",
      "status": "available",
      "visible": true,
      "featured": false,
      "image": {
        "thumb": "/assets/img/sp/steiger.webp",
        "large": "/assets/img/sp/steiger-lg.webp"
      },
      "variants": [
        {
          "label": "500ml",
          "pack": "Thùng 24 lon",
          "price": 925000,
          "oldPrice": null
        }
      ],
      "createdAt": "2026-11-14T14:54:31.333Z",
      "updatedAt": "2026-11-14T14:54:31.333Z"
    },
    {
      "id": "paderborner-pilger",
      "name": "Paderborner Pilger Naturtrüb",
      "cat": "duc",
      "origin": "Đức",
      "abv": "",
      "badge": "",
      "desc": "Bia Đức tự nhiên, nguyên bản 500ml.",
      "status": "available",
      "visible": true,
      "featured": false,
      "image": {
        "thumb": "/assets/img/sp/paderborner-pilger.webp",
        "large": "/assets/img/sp/paderborner-pilger-lg.webp"
      },
      "variants": [
        {
          "label": "500ml",
          "pack": "Thùng 24 lon",
          "price": 948000,
          "oldPrice": null
        }
      ],
      "createdAt": "2026-11-14T14:54:31.333Z",
      "updatedAt": "2026-11-14T14:54:31.333Z"
    },
    {
      "id": "warsteiner",
      "name": "Warsteiner Brewers Gold",
      "cat": "duc",
      "origin": "Đức",
      "abv": "",
      "badge": "Mới về",
      "desc": "Hương vị vàng từ nước Đức, êm mượt và đậm đà.",
      "status": "available",
      "visible": true,
      "featured": false,
      "image": {
        "thumb": "/assets/img/sp/warsteiner.webp",
        "large": "/assets/img/sp/warsteiner-lg.webp"
      },
      "variants": [
        {
          "label": "500ml",
          "pack": "Thùng 24 lon",
          "price": 1395000,
          "oldPrice": null
        }
      ],
      "createdAt": "2026-11-14T14:54:31.333Z",
      "updatedAt": "2026-11-14T14:54:31.333Z"
    },
    {
      "id": "apostel-weissbier",
      "name": "Apostel Weissbier Hell & Dunkel",
      "cat": "duc",
      "origin": "Đức",
      "abv": "5.3%",
      "badge": "",
      "desc": "Bia lúa mì truyền thống Đức, hai vị sáng & đen.",
      "status": "available",
      "visible": true,
      "featured": false,
      "image": {
        "thumb": "/assets/img/sp/apostel-weissbier.webp",
        "large": "/assets/img/sp/apostel-weissbier-lg.webp"
      },
      "variants": [
        {
          "label": "500ml",
          "pack": "Thùng 24 lon",
          "price": 968000,
          "oldPrice": null
        }
      ],
      "createdAt": "2026-11-14T14:54:31.333Z",
      "updatedAt": "2026-11-14T14:54:31.333Z"
    },
    {
      "id": "4-dong-lua-mi-duc",
      "name": "4 dòng bia lúa mì Đức",
      "cat": "duc",
      "origin": "Đức",
      "abv": "",
      "badge": "Best seller",
      "desc": "Königbacher, Karlsbräu, Leikeim, Klosterkeller — thơm mát, dễ uống.",
      "status": "available",
      "visible": true,
      "featured": false,
      "image": {
        "thumb": "/assets/img/sp/4-dong-lua-mi-duc.webp",
        "large": "/assets/img/sp/4-dong-lua-mi-duc-lg.webp"
      },
      "variants": [
        {
          "label": "500ml",
          "pack": "Thùng 24 lon",
          "price": 968000,
          "oldPrice": null
        }
      ],
      "createdAt": "2026-11-14T14:54:31.333Z",
      "updatedAt": "2026-11-14T14:54:31.333Z"
    },
    {
      "id": "eichbaum",
      "name": "Eichbaum Hefeweizen Hell & Red Lager",
      "cat": "duc",
      "origin": "Đức",
      "abv": "5.2% / 5.9%",
      "badge": "",
      "desc": "Since 1679 — lúa mì sáng và red lager đậm caramel.",
      "status": "available",
      "visible": true,
      "featured": false,
      "image": {
        "thumb": "/assets/img/sp/eichbaum.webp",
        "large": "/assets/img/sp/eichbaum-lg.webp"
      },
      "variants": [
        {
          "label": "500ml",
          "pack": "Thùng 24 lon",
          "price": 936000,
          "oldPrice": null
        }
      ],
      "createdAt": "2026-11-14T14:54:31.333Z",
      "updatedAt": "2026-11-14T14:54:31.333Z"
    },
    {
      "id": "eichbaum-stout-75",
      "name": "Eichbaum Stout 7.5 Superior",
      "cat": "duc",
      "origin": "Đức",
      "abv": "7.5%",
      "badge": "",
      "desc": "Bia đen nhập khẩu Đức — đậm vị, mạnh mẽ.",
      "status": "available",
      "visible": true,
      "featured": false,
      "image": {
        "thumb": "/assets/img/sp/eichbaum-stout-75.webp",
        "large": "/assets/img/sp/eichbaum-stout-75-lg.webp"
      },
      "variants": [
        {
          "label": "500ml",
          "pack": "Thùng 24 lon",
          "price": 988000,
          "oldPrice": null
        }
      ],
      "createdAt": "2026-11-14T14:54:31.333Z",
      "updatedAt": "2026-11-14T14:54:31.333Z"
    },
    {
      "id": "st-wendeler",
      "name": "St. Wendeler IPA & Weizen",
      "cat": "duc",
      "origin": "Đức",
      "abv": "5.0% / 5.1%",
      "badge": "",
      "desc": "IPA thơm hoa bia và Weizen lúa mì êm dịu.",
      "status": "available",
      "visible": true,
      "featured": false,
      "image": {
        "thumb": "/assets/img/sp/st-wendeler.webp",
        "large": "/assets/img/sp/st-wendeler-lg.webp"
      },
      "variants": [
        {
          "label": "500ml",
          "pack": "Thùng 24 lon",
          "price": 925000,
          "oldPrice": null
        }
      ],
      "createdAt": "2026-11-14T14:54:31.333Z",
      "updatedAt": "2026-11-14T14:54:31.333Z"
    },
    {
      "id": "kaiserdom",
      "name": "Kaiserdom",
      "cat": "duc",
      "origin": "Đức",
      "abv": "",
      "badge": "",
      "desc": "Kellerbier, Hefe-Weißbier, Dark Lager, Pilsener — truyền thống từ 1718.",
      "status": "available",
      "visible": true,
      "featured": false,
      "image": {
        "thumb": "/assets/img/sp/kaiserdom.webp",
        "large": "/assets/img/sp/kaiserdom-lg.webp"
      },
      "variants": [
        {
          "label": "500ml",
          "pack": "Thùng 24 lon",
          "price": 925000,
          "oldPrice": null
        }
      ],
      "createdAt": "2026-11-14T14:54:31.333Z",
      "updatedAt": "2026-11-14T14:54:31.333Z"
    },
    {
      "id": "konigsbacher-weizen",
      "name": "Königbacher Weizen",
      "cat": "duc",
      "origin": "Đức",
      "abv": "5.1%",
      "badge": "",
      "desc": "Bia lúa mạch truyền thống, vị mềm mại, cân bằng.",
      "status": "available",
      "visible": true,
      "featured": false,
      "image": {
        "thumb": "/assets/img/sp/konigsbacher-weizen.webp",
        "large": "/assets/img/sp/konigsbacher-weizen-lg.webp"
      },
      "variants": [
        {
          "label": "500ml",
          "pack": "Thùng 24 lon",
          "price": 925000,
          "oldPrice": null
        }
      ],
      "createdAt": "2026-11-14T14:54:31.333Z",
      "updatedAt": "2026-11-14T14:54:31.333Z"
    },
    {
      "id": "asahi-lon",
      "name": "Asahi Super Dry (lon)",
      "cat": "chau-a",
      "origin": "TQ (CN Nhật)",
      "abv": "",
      "badge": "",
      "desc": "Karakuchi — vị khô, sắc nét đặc trưng Nhật Bản.",
      "status": "available",
      "visible": true,
      "featured": false,
      "image": {
        "thumb": "/assets/img/sp/asahi-lon.webp",
        "large": "/assets/img/sp/asahi-lon-lg.webp"
      },
      "variants": [
        {
          "label": "Lon 330ml",
          "pack": "Thùng 24 lon",
          "price": 310000,
          "oldPrice": null
        }
      ],
      "createdAt": "2026-11-14T14:54:31.333Z",
      "updatedAt": "2026-11-14T14:54:31.333Z"
    },
    {
      "id": "asahi-chai",
      "name": "Asahi Super Dry (chai)",
      "cat": "chau-a",
      "origin": "TQ (CN Nhật)",
      "abv": "",
      "badge": "",
      "desc": "Rẻ đến không ngờ — chai 330ml.",
      "status": "available",
      "visible": true,
      "featured": false,
      "image": {
        "thumb": "/assets/img/sp/asahi-chai.webp",
        "large": "/assets/img/sp/asahi-chai-lg.webp"
      },
      "variants": [
        {
          "label": "Chai 330ml",
          "pack": "Thùng 24 chai",
          "price": 320000,
          "oldPrice": null
        }
      ],
      "createdAt": "2026-11-14T14:54:31.333Z",
      "updatedAt": "2026-11-14T14:54:31.333Z"
    },
    {
      "id": "tsingtao",
      "name": "Bia Tsingtao",
      "cat": "chau-a",
      "origin": "Trung Quốc",
      "abv": "",
      "badge": "",
      "desc": "Thanh mát sảng khoái, chuẩn chất Trung Hoa.",
      "status": "available",
      "visible": true,
      "featured": false,
      "image": {
        "thumb": "/assets/img/sp/tsingtao.webp",
        "large": "/assets/img/sp/tsingtao-lg.webp"
      },
      "variants": [
        {
          "label": "Chai 640ml",
          "pack": "Thùng 12 chai",
          "price": 520000,
          "oldPrice": null
        },
        {
          "label": "Chai 330ml",
          "pack": "Thùng 24 chai",
          "price": 570000,
          "oldPrice": null
        },
        {
          "label": "Lon 330ml",
          "pack": "Thùng 24 lon",
          "price": 480000,
          "oldPrice": null
        }
      ],
      "createdAt": "2026-11-14T14:54:31.333Z",
      "updatedAt": "2026-11-14T14:54:31.333Z"
    },
    {
      "id": "chaliman-1583",
      "name": "Bia Chaliman 1583",
      "cat": "chau-a",
      "origin": "Trung Quốc",
      "abv": "",
      "badge": "",
      "desc": "Lon 1 lít — đậm đà, dễ uống, hậu vị êm.",
      "status": "available",
      "visible": true,
      "featured": false,
      "image": {
        "thumb": "/assets/img/sp/chaliman-1583.webp",
        "large": "/assets/img/sp/chaliman-1583-lg.webp"
      },
      "variants": [
        {
          "label": "Lon 1 lít",
          "pack": "Thùng 6 lon",
          "price": 360000,
          "oldPrice": null
        }
      ],
      "createdAt": "2026-11-14T14:54:31.333Z",
      "updatedAt": "2026-11-14T14:54:31.333Z"
    },
    {
      "id": "angkor-lon",
      "name": "Angkor Premium Lager (lon)",
      "cat": "angkor",
      "origin": "Campuchia",
      "abv": "5%",
      "badge": "",
      "desc": "Niềm tự hào của bia Campuchia.",
      "status": "available",
      "visible": true,
      "featured": false,
      "image": {
        "thumb": "/assets/img/sp/angkor-lon.webp",
        "large": "/assets/img/sp/angkor-lon-lg.webp"
      },
      "variants": [
        {
          "label": "Lon 330ml",
          "pack": "Thùng 24 lon",
          "price": 345000,
          "oldPrice": null
        }
      ],
      "createdAt": "2026-11-14T14:54:31.333Z",
      "updatedAt": "2026-11-14T14:54:31.333Z"
    },
    {
      "id": "angkor-sky-lon",
      "name": "Angkor Sky (lon)",
      "cat": "angkor",
      "origin": "Campuchia",
      "abv": "4%",
      "badge": "",
      "desc": "Light & smooth — nhẹ nhàng mà đậm chất.",
      "status": "available",
      "visible": true,
      "featured": false,
      "image": {
        "thumb": "/assets/img/sp/angkor-sky-lon.webp",
        "large": "/assets/img/sp/angkor-sky-lon-lg.webp"
      },
      "variants": [
        {
          "label": "Lon 330ml",
          "pack": "Thùng 24 lon",
          "price": 390000,
          "oldPrice": null
        }
      ],
      "createdAt": "2026-11-14T14:54:31.333Z",
      "updatedAt": "2026-11-14T14:54:31.333Z"
    },
    {
      "id": "angkor-nap-giat",
      "name": "Angkor chai nắp giật",
      "cat": "angkor",
      "origin": "Campuchia",
      "abv": "5%",
      "badge": "",
      "desc": "Giựt một cái — “bụp” đã tai! Thơm & ngon hơn bản lon.",
      "status": "available",
      "visible": true,
      "featured": false,
      "image": {
        "thumb": "/assets/img/sp/angkor-nap-giat.webp",
        "large": "/assets/img/sp/angkor-nap-giat-lg.webp"
      },
      "variants": [
        {
          "label": "Chai 330ml",
          "pack": "Thùng 24 chai",
          "price": 550000,
          "oldPrice": null
        }
      ],
      "createdAt": "2026-11-14T14:54:31.333Z",
      "updatedAt": "2026-11-14T14:54:31.333Z"
    },
    {
      "id": "angkor-sky-chai",
      "name": "Angkor Sky (chai nắp giật)",
      "cat": "angkor",
      "origin": "Campuchia",
      "abv": "4%",
      "badge": "",
      "desc": "Nhẹ êm, mát lạnh, dễ uống.",
      "status": "available",
      "visible": true,
      "featured": false,
      "image": {
        "thumb": "/assets/img/sp/angkor-sky-chai.webp",
        "large": "/assets/img/sp/angkor-sky-chai-lg.webp"
      },
      "variants": [
        {
          "label": "Chai 330ml",
          "pack": "Thùng 24 chai",
          "price": 570000,
          "oldPrice": null
        }
      ],
      "createdAt": "2026-11-14T14:54:31.333Z",
      "updatedAt": "2026-11-14T14:54:31.333Z"
    },
    {
      "id": "angkor-extra-stout",
      "name": "Angkor Extra Stout",
      "cat": "angkor",
      "origin": "Campuchia",
      "abv": "8%",
      "badge": "",
      "desc": "Bia đen 8% — đậm vị, có lực, hương malt rang, caramel, cà phê.",
      "status": "available",
      "visible": true,
      "featured": false,
      "image": {
        "thumb": "/assets/img/sp/angkor-extra-stout.webp",
        "large": "/assets/img/sp/angkor-extra-stout-lg.webp"
      },
      "variants": [
        {
          "label": "Chai 330ml",
          "pack": "Thùng 24 chai",
          "price": 720000,
          "oldPrice": null
        }
      ],
      "createdAt": "2026-11-14T14:54:31.333Z",
      "updatedAt": "2026-11-14T14:54:31.333Z"
    },
    {
      "id": "angkor-combo-mix",
      "name": "Siêu combo mix Angkor",
      "cat": "angkor",
      "origin": "Campuchia",
      "abv": "",
      "badge": "Combo",
      "desc": "Thùng 24 chai, 3 loại: 8 Angkor nắp giật, 8 Angkor Sky, 8 Angkor Extra Stout.",
      "status": "available",
      "visible": true,
      "featured": false,
      "image": {
        "thumb": "/assets/img/sp/angkor-combo-mix.webp",
        "large": "/assets/img/sp/angkor-combo-mix-lg.webp"
      },
      "variants": [
        {
          "label": "Mix 3 loại × 8 chai",
          "pack": "Thùng 24 chai",
          "price": 650000,
          "oldPrice": null
        }
      ],
      "createdAt": "2026-11-14T14:54:31.333Z",
      "updatedAt": "2026-11-14T14:54:31.333Z"
    },
    {
      "id": "jack-daniels",
      "name": "Jack Daniel's Old No.7",
      "cat": "ruou",
      "origin": "Mỹ",
      "abv": "40%",
      "badge": "",
      "desc": "Tennessee Whiskey — huyền thoại whiskey Mỹ.",
      "status": "available",
      "visible": true,
      "featured": false,
      "image": {
        "thumb": "/assets/img/sp/jack-daniels.webp",
        "large": "/assets/img/sp/jack-daniels-lg.webp"
      },
      "variants": [
        {
          "label": "Chai 1 lít",
          "pack": "Chai 1 lít",
          "price": 670000,
          "oldPrice": null
        }
      ],
      "createdAt": "2026-11-14T14:54:31.333Z",
      "updatedAt": "2026-11-14T14:54:31.333Z"
    },
    {
      "id": "jagermeister",
      "name": "Jägermeister",
      "cat": "ruou",
      "origin": "Đức",
      "abv": "35%",
      "badge": "",
      "desc": "Thức uống huyền thoại từ nước Đức, 56 loại thảo mộc.",
      "status": "available",
      "visible": true,
      "featured": false,
      "image": {
        "thumb": "/assets/img/sp/jagermeister.webp",
        "large": "/assets/img/sp/jagermeister-lg.webp"
      },
      "variants": [
        {
          "label": "Chai 1 lít",
          "pack": "Chai 1 lít",
          "price": 480000,
          "oldPrice": null
        }
      ],
      "createdAt": "2026-11-14T14:54:31.333Z",
      "updatedAt": "2026-11-14T14:54:31.333Z"
    },
    {
      "id": "soju-6-vi",
      "name": "Soju Hàn Quốc 6 vị",
      "cat": "ruou",
      "origin": "Hàn Quốc",
      "abv": "",
      "badge": "",
      "desc": "Đào, táo, dâu, nho, việt quất, truyền thống — mix vị thoải mái.",
      "status": "available",
      "visible": true,
      "featured": false,
      "image": {
        "thumb": "/assets/img/sp/soju-6-vi.webp",
        "large": "/assets/img/sp/soju-6-vi-lg.webp"
      },
      "variants": [
        {
          "label": "Chai lẻ 360ml",
          "pack": "Chai 360ml",
          "price": 60000,
          "oldPrice": null
        },
        {
          "label": "Nguyên thùng",
          "pack": "Thùng 20 chai × 360ml",
          "price": 1100000,
          "oldPrice": null
        }
      ],
      "createdAt": "2026-11-14T14:54:31.333Z",
      "updatedAt": "2026-11-14T14:54:31.333Z"
    },
    {
      "id": "heineken-5l",
      "name": "Heineken Original — Bình 5 lít",
      "cat": "bom-5l",
      "origin": "Hà Lan",
      "abv": "",
      "badge": "",
      "desc": "Nhập khẩu 100% từ Hà Lan. Mua cặp tiết kiệm hơn.",
      "status": "available",
      "visible": true,
      "featured": false,
      "image": {
        "thumb": "/assets/img/sp/heineken-5l.webp",
        "large": "/assets/img/sp/heineken-5l-lg.webp"
      },
      "variants": [
        {
          "label": "1 bình",
          "pack": "Bình 5 lít",
          "price": 888000,
          "oldPrice": null
        },
        {
          "label": "1 cặp",
          "pack": "Cặp 2 bình 5 lít",
          "price": 1668000,
          "oldPrice": null
        }
      ],
      "createdAt": "2026-11-14T14:54:31.333Z",
      "updatedAt": "2026-11-14T14:54:31.333Z"
    },
    {
      "id": "feldschlosschen-schwarzbier",
      "name": "Feldschlösschen Schwarzbier",
      "cat": "bom-5l",
      "origin": "Đức",
      "abv": "5%",
      "badge": "Mới",
      "desc": "Bia đen lager Đức, mạch nha rang, caramel & chocolate.",
      "status": "available",
      "visible": true,
      "featured": false,
      "image": {
        "thumb": "/assets/img/sp/feldschlosschen-schwarzbier.webp",
        "large": "/assets/img/sp/feldschlosschen-schwarzbier-lg.webp"
      },
      "variants": [
        {
          "label": "Bình 5 lít",
          "pack": "Bình 5 lít",
          "price": 690000,
          "oldPrice": null
        }
      ],
      "createdAt": "2026-11-14T14:54:31.333Z",
      "updatedAt": "2026-11-14T14:54:31.333Z"
    },
    {
      "id": "feldschlosschen-hefeweizen",
      "name": "Feldschlösschen Hefeweizen",
      "cat": "bom-5l",
      "origin": "Đức",
      "abv": "5%",
      "badge": "Mới",
      "desc": "Bia lúa mì Đức, hương chuối chín & đinh hương.",
      "status": "available",
      "visible": true,
      "featured": false,
      "image": {
        "thumb": "/assets/img/sp/feldschlosschen-hefeweizen.webp",
        "large": "/assets/img/sp/feldschlosschen-hefeweizen-lg.webp"
      },
      "variants": [
        {
          "label": "Bình 5 lít",
          "pack": "Bình 5 lít",
          "price": 690000,
          "oldPrice": null
        }
      ],
      "createdAt": "2026-11-14T14:54:31.333Z",
      "updatedAt": "2026-11-14T14:54:31.333Z"
    }
  ],
  "settings": {
    "announcement": {
      "enabled": false,
      "text": ""
    }
  }
};
