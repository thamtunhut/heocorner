(function () {
  "use strict";

  var STATUS = { available: "Còn hàng", out: "Tạm hết", discontinued: "Ngừng bán" };
  var CATS = [], ITEMS = [];
  var state = { cat: "all", q: "", sort: "default", view: "grid" };

  var $ = function (s) { return document.querySelector(s); };
  var chipsEl = $("#chips"), gridEl = $("#grid"), tableWrap = $("#table-wrap"),
      emptyEl = $("#empty"), countEl = $("#count"), qEl = $("#q"), sortEl = $("#sort");

  function norm(s) {
    return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d");
  }
  function money(n) { return Number(n).toLocaleString("vi-VN") + "đ"; }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  var FALLBACK_IMG = "/assets/img/logo.webp";
  function thumb(p) { return (p.image && p.image.thumb) || FALLBACK_IMG; }
  function large(p) { return (p.image && (p.image.large || p.image.thumb)) || FALLBACK_IMG; }

  /* ---------- Thống kê (không gửi dữ liệu cá nhân) ---------- */
  function track(type, id) {
    try {
      fetch("/api/track", {
        method: "POST", keepalive: true, headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: type, id: id })
      }).catch(function () {});
    } catch (e) {}
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest('a[href*="zalo.me"]');
    if (a) track("zalo");
  });

  /* ---------- Chuẩn bị dữ liệu ---------- */
  function prepare(data) {
    CATS = [{ id: "all", name: "Tất cả" }].concat(data.categories || []);
    ITEMS = (data.products || []).map(function (p, i) {
      var prices = p.variants.map(function (v) { return v.price; });
      p._order = i;
      p._min = Math.min.apply(null, prices);
      p._max = Math.max.apply(null, prices);
      var minV = p.variants.filter(function (v) { return v.price === p._min; })[0];
      p._old = minV && minV.oldPrice ? minV.oldPrice : null;
      p._catName = (CATS.filter(function (c) { return c.id === p.cat; })[0] || {}).name || "";
      p._search = norm([p.name, p.origin, p._catName, p.desc, p.abv, p.badge,
        p.variants.map(function (v) { return v.label + " " + v.pack; }).join(" ")].join(" "));
      return p;
    });
    var a = (data.settings && data.settings.announcement) || {};
    var bar = $("#announce");
    if (a.enabled && a.text) {
      var inner = a.link
        ? '<a href="' + esc(a.link) + '"' + (/^https?:/i.test(a.link) ? ' target="_blank" rel="noopener"' : "") + ">" + esc(a.text) + "</a>"
        : esc(a.text);
      bar.innerHTML = '<div class="container">' + inner + "</div>";
      bar.hidden = false;
    }
  }

  /* ---------- Chips ---------- */
  function renderChips() {
    chipsEl.innerHTML = CATS.map(function (c) {
      var n = c.id === "all" ? ITEMS.length : ITEMS.filter(function (p) { return p.cat === c.id; }).length;
      if (!n && c.id !== "all") return "";
      return '<button type="button" class="chip" role="tab" data-cat="' + esc(c.id) + '" aria-selected="' + (state.cat === c.id) + '">' +
        esc(c.short || c.name) + ' <span class="n">' + n + "</span></button>";
    }).join("");
  }
  chipsEl.addEventListener("click", function (e) {
    var b = e.target.closest(".chip"); if (!b) return;
    state.cat = b.dataset.cat;
    chipsEl.querySelectorAll(".chip").forEach(function (x) { x.setAttribute("aria-selected", x === b); });
    b.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
    render();
  });

  /* ---------- Lọc ---------- */
  function filtered() {
    var q = norm(state.q).trim();
    var terms = q ? q.split(/\s+/) : [];
    var list = ITEMS.filter(function (p) {
      if (state.cat !== "all" && p.cat !== state.cat) return false;
      return terms.every(function (t) { return p._search.indexOf(t) !== -1; });
    });
    var s = state.sort;
    var gone = function (p) { return p.status === "discontinued" ? 1 : 0; };
    list.sort(function (a, b) {
      if (s !== "default" && gone(a) !== gone(b)) return gone(a) - gone(b);
      if (s === "asc") return a._min - b._min;
      if (s === "desc") return b._max - a._max;
      if (s === "name") return a.name.localeCompare(b.name, "vi");
      return a._order - b._order;
    });
    return list;
  }

  /* ---------- Render ---------- */
  function statusTag(p) {
    if (!p.status || p.status === "available") return "";
    return '<span class="stock stock-' + p.status + '">' + STATUS[p.status] + "</span>";
  }

  function cardHTML(p, i) {
    var multi = p.variants.length > 1;
    var unit = multi ? "" : "<small>/ " + esc(p.variants[0].pack.toLowerCase()) + "</small>";
    var meta = [p.origin, p.abv].filter(Boolean).join(" · ");
    var st = p.status && p.status !== "available" ? " is-" + p.status : "";
    return '<button type="button" class="card' + st + '" data-id="' + esc(p.id) + '" style="--i:' + Math.min(i, 12) + '" aria-label="' +
      esc(p.name + ", " + (multi ? "từ " : "") + money(p._min) + (st ? ", " + STATUS[p.status] : "")) + '">' +
      '<div class="card-media">' +
        (p.badge ? '<span class="badge">' + esc(p.badge) + "</span>" : "") +
        '<img src="' + esc(thumb(p)) + '" alt="Poster ' + esc(p.name) + '" width="560" height="700" loading="lazy" decoding="async">' +
        (st ? '<span class="stock-strip strip-' + p.status + '">' + (p.status === "out" ? "Tạm hết hàng" : "Ngừng bán") + "</span>" : "") +
        '<span class="card-zoom" aria-hidden="true"><svg class="ic"><use href="#i-zoom"/></svg></span>' +
      "</div>" +
      '<div class="card-body">' +
        '<span class="card-origin">' + esc(meta) + "</span>" +
        '<h3 class="card-title">' + esc(p.name) + "</h3>" +
        '<div class="card-variants">' + p.variants.map(function (v) { return "<span>" + esc(v.label) + "</span>"; }).join("") + "</div>" +
        '<div class="card-price">' + (multi ? '<span class="from">từ</span>' : "") + "<b>" + money(p._min) + "</b>" +
          (p._old ? "<s>" + money(p._old) + "</s>" : unit) + "</div>" +
      "</div></button>";
  }

  function tableHTML(list) {
    var rows = "", lastCat = null, grouped = state.sort === "default";
    list.forEach(function (p) {
      if (grouped && p.cat !== lastCat) {
        rows += '<tr class="cat-row"><td colspan="5">' + esc(p._catName) + "</td></tr>";
        lastCat = p.cat;
      }
      p.variants.forEach(function (v, k) {
        rows += '<tr data-id="' + esc(p.id) + '"' + (p.status && p.status !== "available" ? ' class="row-' + p.status + '"' : "") + ">" +
          '<td class="col-thumb">' + (k === 0 ? '<img class="thumb" src="' + esc(thumb(p)) + '" alt="" loading="lazy" width="44" height="55">' : "") + "</td>" +
          '<td class="pname"><button type="button" class="linklike" data-id="' + esc(p.id) + '">' + esc(p.name) + "</button>" +
            (k === 0 ? statusTag(p) : "") +
            '<span class="sub">' + esc(v.label) + (p.abv ? " · " + esc(p.abv) : "") +
            '<span class="sub-pack"> · ' + esc(v.pack) + "</span></span></td>" +
          '<td class="col-origin">' + esc(p.origin) + "</td>" +
          '<td class="col-pack">' + esc(v.pack) + "</td>" +
          '<td class="num">' + (v.oldPrice ? "<s>" + money(v.oldPrice) + "</s>" : "") + money(v.price) + "</td></tr>";
      });
    });
    return '<table class="ptable"><thead><tr><th class="col-thumb" scope="col"><span class="sr-only">Ảnh</span></th>' +
      '<th scope="col">Sản phẩm</th><th class="col-origin" scope="col">Xuất xứ</th><th class="col-pack" scope="col">Quy cách</th>' +
      '<th scope="col" class="num">Giá bán</th></tr></thead><tbody>' + rows + "</tbody></table>";
  }

  function render() {
    var list = filtered();
    countEl.textContent = list.length
      ? "Đang hiển thị " + list.length + " sản phẩm" + (state.q ? " cho “" + state.q + "”" : "")
      : "";
    emptyEl.hidden = list.length > 0;
    var isGrid = state.view === "grid";
    gridEl.hidden = !isGrid || !list.length;
    tableWrap.hidden = isGrid || !list.length;
    if (isGrid) gridEl.innerHTML = list.map(cardHTML).join("");
    else tableWrap.innerHTML = tableHTML(list);
  }

  var t;
  qEl.addEventListener("input", function () {
    clearTimeout(t);
    t = setTimeout(function () { state.q = qEl.value.trim(); render(); }, 150);
  });
  sortEl.addEventListener("change", function () { state.sort = sortEl.value; render(); });
  document.querySelectorAll(".view-toggle button").forEach(function (b) {
    b.addEventListener("click", function () {
      state.view = b.dataset.view;
      document.querySelectorAll(".view-toggle button").forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
      try { localStorage.setItem("hc-view", state.view); } catch (e) {}
      render();
    });
  });

  gridEl.addEventListener("click", function (e) {
    var c = e.target.closest(".card"); if (c) openProduct(c.dataset.id);
  });
  tableWrap.addEventListener("click", function (e) {
    var r = e.target.closest("[data-id]"); if (r) openProduct(r.dataset.id);
  });

  /* ---------- Popup chi tiết ---------- */
  var dlg = $("#dlg"), dImg = $("#dlg-img"), lastFocus = null;

  function openProduct(id) {
    var p = ITEMS.filter(function (x) { return x.id === id; })[0]; if (!p) return;
    lastFocus = document.activeElement;
    $("#dlg-cat").textContent = p._catName;
    $("#dlg-title").textContent = p.name;
    $("#dlg-meta").textContent = [p.origin, p.abv ? "Độ cồn " + p.abv : ""].filter(Boolean).join(" · ");
    var st = p.status || "available";
    var stEl = $("#dlg-status");
    stEl.textContent = STATUS[st];
    stEl.className = "dlg-status st-" + st;
    $("#dlg-desc").textContent = p.desc || "";
    $("#dlg-variants tbody").innerHTML = p.variants.map(function (v) {
      return "<tr><td>" + esc(v.label) + "</td><td>" + esc(v.pack) + '</td><td class="num">' +
        (v.oldPrice ? "<s>" + money(v.oldPrice) + "</s>" : "") + money(v.price) + "</td></tr>";
    }).join("");
    dImg.src = thumb(p);
    dImg.alt = "Poster " + p.name;
    var big = new Image();
    big.onload = function () { if (dlg.dataset.id === p.id) dImg.src = big.src; };
    big.src = large(p);
    $("#dlg-media").href = large(p);
    var zaloBtn = $("#dlg-zalo");
    zaloBtn.lastChild.textContent = st === "available" ? " Đặt qua Zalo" : " Hỏi hàng qua Zalo";
    zaloBtn.dataset.msg = "Chào Heo Corner, mình muốn " + (st === "available" ? "đặt" : "hỏi về") + ": " + p.name + " (" +
      p.variants.map(function (v) { return v.label + " – " + money(v.price); }).join("; ") + ")";
    dlg.dataset.id = p.id;
    if (!dlg.open) dlg.showModal();
    $(".dlg-body").scrollTop = 0;
    $("#dlg-media").scrollTop = 0;
    if (location.hash !== "#sp/" + p.id) history.replaceState(null, "", "#sp/" + p.id);
    track("product", p.id);
  }
  function closeDlg() { dlg.close(); }
  dlg.addEventListener("close", function () {
    dlg.dataset.id = "";
    if (location.hash.indexOf("#sp/") === 0) history.replaceState(null, "", location.pathname + location.search);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  });
  $(".dlg-close").addEventListener("click", closeDlg);
  dlg.addEventListener("click", function (e) { if (e.target === dlg) closeDlg(); });

  // Bấm "Đặt qua Zalo" → copy sẵn nội dung tin nhắn để dán vào Zalo
  $("#dlg-zalo").addEventListener("click", function () {
    var msg = this.dataset.msg;
    if (msg && navigator.clipboard) {
      navigator.clipboard.writeText(msg).then(function () {
        toast("Đã copy tên sản phẩm — dán vào khung chat Zalo nhé!");
      }).catch(function () {});
    }
  });

  var toastEl;
  function toast(text) {
    if (!toastEl) { toastEl = document.createElement("div"); toastEl.className = "toast"; toastEl.setAttribute("role", "status"); document.body.appendChild(toastEl); }
    toastEl.textContent = text;
    toastEl.classList.add("show");
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(function () { toastEl.classList.remove("show"); }, 3200);
  }

  /* ---------- Header / nút Zalo khi cuộn ---------- */
  var header = $(".site-header"), fab = $(".zalo-fab");
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle("scrolled", y > 8);
    fab.classList.toggle("compact", y > 600);
  }
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Khởi động ---------- */
  try { var v = localStorage.getItem("hc-view"); if (v === "grid" || v === "table") state.view = v; } catch (e) {}
  document.querySelectorAll(".view-toggle button").forEach(function (x) { x.setAttribute("aria-pressed", x.dataset.view === state.view); });
  onScroll();

  // Khung xương trong lúc tải
  gridEl.innerHTML = Array.apply(null, Array(12)).map(function () {
    return '<div class="card skeleton" aria-hidden="true"><div class="card-media"></div><div class="card-body"><span></span><span></span><span></span></div></div>';
  }).join("");
  countEl.textContent = "Đang tải sản phẩm…";

  function load(attempt) {
    return fetch("/api/products", { cache: "no-store", headers: { Accept: "application/json" } })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (data) {
        prepare(data);
        renderChips();
        render();
        var m = location.hash.match(/^#sp\/(.+)$/);
        if (m) openProduct(decodeURIComponent(m[1]));
      })
      .catch(function () {
        if (attempt < 2) return new Promise(function (r) { setTimeout(r, 800); }).then(function () { return load(attempt + 1); });
        gridEl.innerHTML = "";
        gridEl.hidden = true;
        countEl.textContent = "";
        emptyEl.querySelector("p").textContent = "Chưa tải được danh sách sản phẩm. Vui lòng tải lại trang hoặc nhắn Zalo để xem bảng giá.";
        emptyEl.hidden = false;
      });
  }
  load(0);
  track("pageview");
})();
