(function () {
  "use strict";

  /* =========================================================
   * Tiện ích
   * ========================================================= */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  var num = function (n) { return Number(n || 0).toLocaleString("vi-VN"); };
  var money = function (n) { return num(n) + "đ"; };
  var icon = function (id) { return '<svg class="ic"><use href="#i-' + id + '"/></svg>'; };
  var STATUS = { available: "Còn hàng", out: "Tạm hết", discontinued: "Ngừng bán" };
  var norm = function (s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d"); };
  var slug = function (s) { return norm(s).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "anh"; };
  function fmtTime(iso) {
    var d = new Date(iso);
    return d.toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Asia/Ho_Chi_Minh" });
  }
  function fmtDay(key, withWeekday) {
    var p = key.split("-");
    var d = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2], 12));
    var s = p[2] + "/" + p[1];
    if (withWeekday) s = d.toLocaleDateString("vi-VN", { weekday: "short", timeZone: "UTC" }) + ", " + s;
    return s;
  }

  function toast(msg, type) {
    var el = document.createElement("div");
    el.className = "toast " + (type || "ok");
    el.setAttribute("role", type === "err" ? "alert" : "status");
    el.textContent = msg;
    $("#toasts").appendChild(el);
    setTimeout(function () { el.remove(); }, type === "err" ? 5000 : 2800);
  }

  /** Gọi API: tự gắn header chống CSRF, tự về màn đăng nhập khi hết phiên. */
  function api(path, opts) {
    opts = opts || {};
    var headers = { "X-Requested-With": "heo-admin" };
    var body = opts.body;
    if (body && !(body instanceof Blob)) { headers["Content-Type"] = "application/json"; body = JSON.stringify(body); }
    if (body instanceof Blob) headers["Content-Type"] = "application/octet-stream";
    return fetch(path, { method: opts.method || "GET", headers: headers, body: body, credentials: "same-origin" })
      .then(function (res) {
        return res.text().then(function (t) {
          var data = null;
          try { data = t ? JSON.parse(t) : null; } catch (e) { data = null; }
          if (res.status === 401 && !opts.allow401) { showLogin(data && data.error); throw Object.assign(new Error(data && data.error || "Hết phiên"), { silent: true }); }
          if (!res.ok) throw Object.assign(new Error((data && data.error) || "Lỗi " + res.status), { status: res.status, data: data });
          return data;
        });
      });
  }
  function fail(e) { if (!e.silent) toast(e.message || "Có lỗi xảy ra", "err"); }

  var cfDlg = $("#confirm");
  function confirmBox(title, text, yesLabel) {
    return new Promise(function (resolve) {
      $("#cf-title").textContent = title;
      $("#cf-text").textContent = text || "";
      $("#cf-yes").textContent = yesLabel || "Xác nhận";
      var done = function (v) { cfDlg.close(); resolve(v); cleanup(); };
      var yes = function () { done(true); }, no = function () { done(false); };
      var onClose = function () { resolve(false); cleanup(); };
      function cleanup() { $("#cf-yes").removeEventListener("click", yes); $("#cf-no").removeEventListener("click", no); cfDlg.removeEventListener("close", onClose); }
      $("#cf-yes").addEventListener("click", yes);
      $("#cf-no").addEventListener("click", no);
      cfDlg.addEventListener("close", onClose);
      cfDlg.showModal();
      $("#cf-no").focus();
    });
  }

  function busy(btn, on, label) {
    if (on) { btn.dataset.label = btn.innerHTML; btn.disabled = true; btn.innerHTML = '<span class="spin"></span> ' + (label || "Đang lưu…"); }
    else { btn.disabled = false; if (btn.dataset.label) btn.innerHTML = btn.dataset.label; }
  }

  $$(".pw-toggle").forEach(function (b) {
    b.addEventListener("click", function () {
      var inp = document.getElementById(b.dataset.for);
      var show = inp.type === "password";
      inp.type = show ? "text" : "password";
      b.setAttribute("aria-label", show ? "Ẩn mật khẩu" : "Hiện mật khẩu");
      b.innerHTML = icon(show ? "eye-off" : "eye");
    });
  });

  /* =========================================================
   * Đăng nhập
   * ========================================================= */
  var me = null, lockTimer = null;

  function showLogin(msg) {
    me = null;
    $("#app").hidden = true;
    $("#login-view").hidden = false;
    $$("dialog[open]").forEach(function (d) { d.close(); });
    var err = $("#login-error");
    if (msg && msg.indexOf("hết hạn") === -1) { err.textContent = msg; err.hidden = false; } else err.hidden = true;
    setTimeout(function () { ($("#lg-user").value ? $("#lg-pass") : $("#lg-user")).focus(); }, 30);
  }

  function startLockCountdown(seconds) {
    var btn = $("#login-btn"), err = $("#login-error");
    var end = Date.now() + seconds * 1000;
    clearInterval(lockTimer);
    btn.disabled = true;
    function tick() {
      var left = Math.max(0, Math.round((end - Date.now()) / 1000));
      var m = Math.floor(left / 60), s = left % 60;
      err.textContent = "Đăng nhập sai quá 5 lần. Vui lòng thử lại sau " + m + ":" + (s < 10 ? "0" : "") + s + ".";
      err.hidden = false;
      if (!left) { clearInterval(lockTimer); btn.disabled = false; err.hidden = true; }
    }
    tick();
    lockTimer = setInterval(tick, 1000);
  }

  $("#login-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var u = $("#lg-user"), p = $("#lg-pass"), err = $("#login-error"), btn = $("#login-btn");
    if (!u.value.trim() || !p.value) {
      err.textContent = "Vui lòng nhập tài khoản và mật khẩu."; err.hidden = false;
      (u.value.trim() ? p : u).focus(); return;
    }
    busy(btn, true, "Đang đăng nhập…");
    api("/api/auth/login", { method: "POST", body: { username: u.value.trim(), password: p.value }, allow401: true })
      .then(function (d) {
        p.value = ""; err.hidden = true;
        busy(btn, false);
        enterApp(d.username);
      })
      .catch(function (ex) {
        busy(btn, false);
        p.value = "";
        if (ex.status === 429 && ex.data && ex.data.retryAfter) { startLockCountdown(ex.data.retryAfter); return; }
        err.textContent = ex.message; err.hidden = false;
        p.focus();
      });
  });

  $("#logout-btn").addEventListener("click", function () {
    api("/api/auth/logout", { method: "POST" }).catch(function () {}).then(function () {
      location.hash = "";
      showLogin();
    });
  });

  function enterApp(username) {
    me = { username: username };
    $("#login-view").hidden = true;
    $("#app").hidden = false;
    $("#who").innerHTML = icon("user") + esc(username);
    route();
  }

  /* =========================================================
   * Điều hướng
   * ========================================================= */
  var VIEWS = {
    "tong-quan": { title: "Tổng quan", render: viewDashboard },
    "san-pham": { title: "Sản phẩm", render: viewProducts },
    "danh-muc": { title: "Danh mục", render: viewCategories },
    "cai-dat": { title: "Thông báo đầu trang", render: viewSettings },
    "nhat-ky": { title: "Nhật ký hoạt động", render: viewLogs },
    "tai-khoan": { title: "Tài khoản & sao lưu", render: viewAccount }
  };
  var content = $("#content");

  function route() {
    if (!me) return;
    var h = location.hash.replace(/^#\/?/, "");
    var name = h.split("?")[0];
    var params = new URLSearchParams(h.split("?")[1] || "");
    if (!VIEWS[name]) { name = "tong-quan"; history.replaceState(null, "", "#/tong-quan"); }
    $$(".side-nav a").forEach(function (a) { a.toggleAttribute("aria-current", a.dataset.view === name); if (a.dataset.view === name) a.setAttribute("aria-current", "page"); });
    $("#view-title").textContent = VIEWS[name].title;
    document.title = VIEWS[name].title + " — Quản trị Heo Corner";
    content.innerHTML = '<div class="loading"><span class="spin"></span> Đang tải…</div>';
    VIEWS[name].render(params);
  }
  window.addEventListener("hashchange", route);

  /* =========================================================
   * Tổng quan
   * ========================================================= */
  function viewDashboard() {
    api("/api/admin/stats").then(function (s) {
      var d = s.today.visitors - s.today.prevVisitors;
      var delta = s.today.prevVisitors || s.today.visitors
        ? '<span class="delta ' + (d >= 0 ? "up" : "down") + '">' + (d >= 0 ? "▲ " : "▼ ") + num(Math.abs(d)) + " so với hôm qua</span>" : "";
      function kpi(label, block, extra) {
        return '<div class="kpi"><div class="kpi-label">' + label + '</div>' +
          '<div class="kpi-value">' + num(block.visitors) + '</div><div class="kpi-unit">khách truy cập' + (extra || "") + "</div>" +
          '<div class="kpi-sub"><span><b>' + num(block.pageviews) + "</b> lượt xem trang</span><span><b>" + num(block.zalo) + "</b> lượt bấm Zalo</span></div></div>";
      }
      var c = s.products;
      var pill = function (cls, label, n, q) { return '<a class="status-pill" href="#/san-pham' + (q ? "?" + q : "") + '"><span class="dot ' + cls + '"></span>' + label + " <b>" + n + "</b></a>"; };
      var maxTop = s.topProducts.length ? s.topProducts[0].views : 1;

      content.innerHTML =
        '<div class="kpis">' + kpi("Hôm nay", s.today, " " + delta) + kpi("7 ngày qua", s.week) + kpi("30 ngày qua", s.month) + "</div>" +
        '<div class="status-row">' +
          pill("", "Tổng sản phẩm", c.total) + pill("available", "Còn hàng", c.available, "st=available") +
          pill("out", "Tạm hết", c.out, "st=out") + pill("discontinued", "Ngừng bán", c.discontinued, "st=discontinued") +
          pill("hidden", "Đang ẩn", c.hidden, "st=hidden") +
        "</div>" +
        '<div class="dash-grid">' +
          '<section class="panel"><div class="panel-head"><div><h2>Khách truy cập mỗi ngày</h2><p>30 ngày gần nhất · không tính bot và lượt của admin</p></div>' +
            '<button class="btn btn-ghost btn-sm" id="refresh">' + icon("refresh") + " Làm mới</button></div>" +
            '<div class="chart-wrap" id="chart"></div>' +
            '<details class="chart-table"><summary>Xem dạng bảng</summary>' + seriesTable(s.series) + "</details>" +
          "</section>" +
          '<section class="panel"><div class="panel-head"><div><h2>Sản phẩm được xem nhiều</h2><p>Lượt mở chi tiết · 30 ngày</p></div></div>' +
            (s.topProducts.length ? '<ol class="top-list">' + s.topProducts.map(function (t) {
              return "<li>" + (t.thumb ? '<img src="' + esc(t.thumb) + '" alt="" loading="lazy">' : "<span></span>") +
                '<div class="top-name"><span title="' + esc(t.name) + '">' + esc(t.name) + '</span><div class="top-bar"><i style="width:' + Math.max(4, t.views / maxTop * 100) + '%"></i></div></div>' +
                '<div class="top-views">' + num(t.views) + "<small>7 ngày: " + num(t.views7) + "</small></div></li>";
            }).join("") + "</ol>" : '<p class="empty-note">Chưa có lượt xem sản phẩm nào.</p>') +
          "</section>" +
        "</div>";
      drawChart($("#chart"), s.series);
      $("#refresh").addEventListener("click", viewDashboard);
    }).catch(function (e) { fail(e); if (!e.silent) content.innerHTML = '<p class="empty-note">Không tải được thống kê.</p>'; });
  }

  function seriesTable(series) {
    return '<table class="tbl" style="margin-top:8px"><thead><tr><th>Ngày</th><th class="num">Khách</th><th class="num">Lượt xem</th><th class="num">Bấm Zalo</th></tr></thead><tbody>' +
      series.slice().reverse().map(function (r) {
        return "<tr><td>" + fmtDay(r.date, true) + '</td><td class="num">' + num(r.visitors) + '</td><td class="num">' + num(r.pageviews) + '</td><td class="num">' + num(r.zalo) + "</td></tr>";
      }).join("") + "</tbody></table>";
  }

  /** Biểu đồ cột 1 chuỗi (khách/ngày), SVG thuần, có tooltip khi rê chuột / chạm. */
  function drawChart(host, series) {
    function render() {
      var W = Math.max(280, host.clientWidth), H = 240;
      var m = { t: 12, r: 8, b: 26, l: 34 };
      var iw = W - m.l - m.r, ih = H - m.t - m.b;
      var max = Math.max.apply(null, series.map(function (s) { return s.visitors; }));
      var step = niceStep(Math.max(max, 4) / 4);
      var top = Math.max(step * 4, step * Math.ceil(max / step));
      var n = series.length, slot = iw / n, gap = 2, bw = Math.max(2, slot - gap);
      var y = function (v) { return m.t + ih - (v / top) * ih; };
      var svg = '<svg class="chart" viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Biểu đồ khách truy cập 30 ngày, cao nhất ' + max + ' khách/ngày">';
      svg += '<g class="grid">';
      for (var v = 0; v <= top; v += step) svg += '<line x1="' + m.l + '" x2="' + (W - m.r) + '" y1="' + y(v) + '" y2="' + y(v) + '"/>';
      svg += '</g><g class="axis">';
      for (v = 0; v <= top; v += step) svg += '<text x="' + (m.l - 8) + '" y="' + (y(v) + 4) + '" text-anchor="end">' + num(v) + "</text>";
      series.forEach(function (s, i) {
        if (i % 5 === (n - 1) % 5) svg += '<text x="' + (m.l + slot * i + slot / 2) + '" y="' + (H - 6) + '" text-anchor="middle">' + fmtDay(s.date) + "</text>";
      });
      svg += "</g>";
      series.forEach(function (s, i) {
        var x = m.l + slot * i + gap / 2, h = (s.visitors / top) * ih, yy = m.t + ih - h, r = Math.min(4, bw / 2, h);
        var path = h > 0
          ? "M" + x + "," + (m.t + ih) + "V" + (yy + r) + "Q" + x + "," + yy + " " + (x + r) + "," + yy + "H" + (x + bw - r) + "Q" + (x + bw) + "," + yy + " " + (x + bw) + "," + (yy + r) + "V" + (m.t + ih) + "Z"
          : "";
        svg += '<rect class="hit" data-i="' + i + '" x="' + (m.l + slot * i) + '" y="' + m.t + '" width="' + slot + '" height="' + ih + '"/>';
        svg += '<path class="bar' + (i === n - 1 ? " today" : "") + '" d="' + path + '"/>';
      });
      svg += "</svg>";
      host.innerHTML = svg + '<div class="tip" hidden></div>';
      var tip = $(".tip", host), bars = $$(".bar", host);
      function show(i) {
        var s = series[i];
        bars.forEach(function (b, k) { b.classList.toggle("active", k === i); });
        tip.innerHTML = "<div>" + fmtDay(s.date, true) + (i === n - 1 ? " (hôm nay)" : "") + "</div><div><b>" + num(s.visitors) + "</b> khách · <b>" + num(s.pageviews) + "</b> lượt xem</div><div><b>" + num(s.zalo) + "</b> lượt bấm Zalo</div>";
        tip.hidden = false;
        var cx = (m.l + slot * i + slot / 2) / W * host.clientWidth;
        var half = tip.offsetWidth / 2;
        tip.style.left = Math.min(Math.max(cx, half), host.clientWidth - half) + "px";
        tip.style.top = (y(s.visitors) / H * host.clientHeight) + "px";
      }
      $$(".hit", host).forEach(function (h) {
        h.addEventListener("mouseenter", function () { show(+h.dataset.i); });
        h.addEventListener("click", function () { show(+h.dataset.i); });
      });
      host.onmouseleave = function () { tip.hidden = true; bars.forEach(function (b) { b.classList.remove("active"); }); };
    }
    function niceStep(raw) {
      var p = Math.pow(10, Math.floor(Math.log10(raw)));
      var f = raw / p;
      return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p;
    }
    render();
    var ro = new ResizeObserver(function () { if (document.body.contains(host)) render(); else ro.disconnect(); });
    ro.observe(host);
  }

  /* =========================================================
   * Sản phẩm
   * ========================================================= */
  var P = { list: [], cats: [], filter: { q: "", cat: "", st: "" } };
  var catName = function (id) { var c = P.cats.filter(function (x) { return x.id === id; })[0]; return c ? c.name : id; };

  function loadProducts() {
    return api("/api/admin/products").then(function (d) { P.list = d.products; P.cats = d.categories; });
  }

  function viewProducts(params) {
    P.filter.st = params.get("st") || "";
    loadProducts().then(function () {
      content.innerHTML =
        '<div class="toolbar">' +
          '<label class="search"><span class="sr-only">Tìm sản phẩm</span>' + icon("search") + '<input type="search" id="f-q" placeholder="Tìm theo tên, xuất xứ…" value="' + esc(P.filter.q) + '"></label>' +
          '<select id="f-cat" aria-label="Lọc theo danh mục"><option value="">Tất cả danh mục</option>' +
            P.cats.map(function (c) { return '<option value="' + esc(c.id) + '"' + (P.filter.cat === c.id ? " selected" : "") + ">" + esc(c.name) + "</option>"; }).join("") + "</select>" +
          '<select id="f-st" aria-label="Lọc theo tình trạng"><option value="">Mọi tình trạng</option>' +
            Object.keys(STATUS).map(function (k) { return '<option value="' + k + '"' + (P.filter.st === k ? " selected" : "") + ">" + STATUS[k] + "</option>"; }).join("") +
            '<option value="hidden"' + (P.filter.st === "hidden" ? " selected" : "") + ">Đang ẩn</option></select>" +
          '<span class="spacer"></span>' +
          '<button class="btn btn-primary" id="add-product">' + icon("plus") + " Thêm sản phẩm</button>" +
        "</div>" +
        '<div class="table-wrap" id="ptable"></div>';
      renderProductTable();
      var t;
      $("#f-q").addEventListener("input", function (e) { clearTimeout(t); t = setTimeout(function () { P.filter.q = e.target.value; renderProductTable(); }, 120); });
      $("#f-cat").addEventListener("change", function (e) { P.filter.cat = e.target.value; renderProductTable(); });
      $("#f-st").addEventListener("change", function (e) { P.filter.st = e.target.value; renderProductTable(); });
      $("#add-product").addEventListener("click", function () { openEditor(null); });
    }).catch(fail);
  }

  function filteredProducts() {
    var q = norm(P.filter.q).trim();
    return P.list.filter(function (p) {
      if (P.filter.cat && p.cat !== P.filter.cat) return false;
      if (P.filter.st === "hidden") { if (p.visible !== false) return false; }
      else if (P.filter.st && p.status !== P.filter.st) return false;
      if (q && norm(p.name + " " + p.origin + " " + p.badge).indexOf(q) === -1) return false;
      return true;
    });
  }

  function priceCell(p) {
    var prices = p.variants.map(function (v) { return v.price; });
    var min = Math.min.apply(null, prices), max = Math.max.apply(null, prices);
    var old = p.variants.filter(function (v) { return v.oldPrice; })[0];
    return (min === max ? money(min) : money(min) + " – " + money(max)) + (old ? '<span class="price-old">' + money(old.oldPrice) + "</span>" : "");
  }

  function renderProductTable() {
    var list = filteredProducts();
    var canOrder = !P.filter.q && !P.filter.cat && !P.filter.st;
    var wrap = $("#ptable");
    if (!list.length) {
      wrap.innerHTML = '<p class="empty-note">' + (P.list.length ? "Không có sản phẩm khớp bộ lọc." : "Chưa có sản phẩm nào. Bấm “Thêm sản phẩm” để bắt đầu.") + "</p>";
      return;
    }
    wrap.innerHTML = '<table class="tbl"><thead><tr>' +
      (canOrder ? '<th class="c-order"><span class="sr-only">Thứ tự</span></th>' : "") +
      '<th>Sản phẩm</th><th>Danh mục</th><th class="num">Giá</th><th>Tình trạng</th><th>Hiển thị</th><th class="c-actions"><span class="sr-only">Thao tác</span></th></tr></thead><tbody>' +
      list.map(function (p, i) {
        var thumb = p.image && p.image.thumb ? p.image.thumb : "/assets/img/logo.webp";
        return '<tr data-id="' + esc(p.id) + '"' + (p.visible === false ? ' class="is-hidden"' : "") + ">" +
          (canOrder ? '<td class="c-order"><div class="order-btns">' +
            '<button class="icon-btn" data-act="up" aria-label="Đưa ' + esc(p.name) + ' lên"' + (i === 0 ? " disabled" : "") + ">" + icon("up") + "</button>" +
            '<button class="icon-btn" data-act="down" aria-label="Đưa ' + esc(p.name) + ' xuống"' + (i === list.length - 1 ? " disabled" : "") + ">" + icon("down") + "</button></div></td>" : "") +
          '<td><div class="p-cell"><img src="' + esc(thumb) + '" alt="" loading="lazy"><div><div class="p-name">' + esc(p.name) + "</div>" +
            '<div class="p-meta">' + (p.featured ? '<span class="chip-s pin">' + icon("pin") + "Ghim</span>" : "") +
            (p.badge ? '<span class="chip-s">' + esc(p.badge) + "</span>" : "") + esc([p.origin, p.abv].filter(Boolean).join(" · ")) + "</div></div></div></td>" +
          '<td class="c-cat">' + esc(catName(p.cat)) + "</td>" +
          '<td class="num c-price">' + priceCell(p) + "</td>" +
          '<td class="c-status"><select class="st-select ' + p.status + '" data-act="status" aria-label="Tình trạng ' + esc(p.name) + '">' +
            Object.keys(STATUS).map(function (k) { return '<option value="' + k + '"' + (p.status === k ? " selected" : "") + ">" + STATUS[k] + "</option>"; }).join("") + "</select></td>" +
          '<td class="c-vis"><label class="switch"><input type="checkbox" data-act="visible"' + (p.visible !== false ? " checked" : "") + ' aria-label="Hiển thị ' + esc(p.name) + ' trên web"><span class="track"></span></label></td>' +
          '<td class="c-actions">' +
            '<button class="icon-btn' + (p.featured ? " on" : "") + '" data-act="pin" aria-label="' + (p.featured ? "Bỏ ghim " : "Ghim ") + esc(p.name) + '" title="' + (p.featured ? "Bỏ ghim" : "Ghim lên đầu") + '">' + icon("pin") + "</button>" +
            '<button class="icon-btn" data-act="edit" aria-label="Sửa ' + esc(p.name) + '" title="Sửa">' + icon("edit") + "</button>" +
            '<button class="icon-btn danger" data-act="delete" aria-label="Xóa ' + esc(p.name) + '" title="Xóa">' + icon("trash") + "</button>" +
          "</td></tr>";
      }).join("") + "</tbody></table>" +
      '<div class="tbl-foot">' + list.length + " / " + P.list.length + " sản phẩm" +
        (canOrder ? " · Dùng mũi tên để sắp xếp thứ tự hiển thị trên web" : " · Bỏ lọc để sắp xếp thứ tự") + "</div>";
  }

  function patchProduct(p, patch, okMsg) {
    return api("/api/admin/products/" + encodeURIComponent(p.id), { method: "PUT", body: patch }).then(function (d) {
      var i = P.list.findIndex(function (x) { return x.id === p.id; });
      if (i >= 0) P.list[i] = d.product;
      renderProductTable();
      if (okMsg) toast(okMsg);
      return d.product;
    });
  }

  content.addEventListener("click", function (e) {
    var btn = e.target.closest("#ptable [data-act]");
    if (!btn || btn.tagName === "SELECT" || btn.type === "checkbox") return;
    var id = btn.closest("tr").dataset.id;
    var p = P.list.filter(function (x) { return x.id === id; })[0];
    if (!p) return;
    var act = btn.dataset.act;
    if (act === "edit") openEditor(p);
    else if (act === "pin") patchProduct(p, { featured: !p.featured }, p.featured ? "Đã bỏ ghim" : "Đã ghim lên đầu").catch(fail);
    else if (act === "delete") {
      confirmBox("Xóa “" + p.name + "”?", "Sản phẩm và ảnh tải lên sẽ bị xóa vĩnh viễn, không thể hoàn tác. Nếu chỉ tạm ngưng, hãy chọn “Ngừng bán” hoặc tắt hiển thị.", "Xóa vĩnh viễn")
        .then(function (ok) {
          if (!ok) return;
          return api("/api/admin/products/" + encodeURIComponent(p.id), { method: "DELETE" }).then(function () {
            P.list = P.list.filter(function (x) { return x.id !== p.id; });
            renderProductTable();
            toast("Đã xóa “" + p.name + "”");
          });
        }).catch(fail);
    } else if (act === "up" || act === "down") {
      var i = P.list.indexOf(p), j = act === "up" ? i - 1 : i + 1;
      if (j < 0 || j >= P.list.length) return;
      var prev = P.list.slice();
      P.list[i] = P.list[j]; P.list[j] = p;
      renderProductTable();
      var sel = $('#ptable tr[data-id="' + CSS.escape(p.id) + '"] [data-act="' + act + '"]');
      if (sel && !sel.disabled) sel.focus();
      clearTimeout(viewProducts._t);
      viewProducts._t = setTimeout(function () {
        api("/api/admin/products-order", { method: "PUT", body: { ids: P.list.map(function (x) { return x.id; }) } })
          .then(function () { toast("Đã lưu thứ tự"); })
          .catch(function (ex) { P.list = prev; renderProductTable(); fail(ex); });
      }, 600);
    }
  });

  content.addEventListener("change", function (e) {
    var el = e.target.closest("#ptable [data-act]");
    if (!el) return;
    var id = el.closest("tr").dataset.id;
    var p = P.list.filter(function (x) { return x.id === id; })[0];
    if (!p) return;
    if (el.dataset.act === "status") {
      el.className = "st-select " + el.value;
      patchProduct(p, { status: el.value }, "“" + p.name + "”: " + STATUS[el.value]).catch(function (ex) { el.value = p.status; el.className = "st-select " + p.status; fail(ex); });
    } else if (el.dataset.act === "visible") {
      patchProduct(p, { visible: el.checked }, el.checked ? "Đã hiện trên web" : "Đã ẩn khỏi web").catch(function (ex) { el.checked = !el.checked; fail(ex); });
    }
  });

  /* ---------- Trình sửa sản phẩm ---------- */
  var pd = $("#pd"), pdForm = $("#pd-form");
  var ED = { product: null, file: null, previewUrl: null, snapshot: "" };

  function variantRow(v) {
    v = v || {};
    var div = document.createElement("div");
    div.className = "variant";
    div.innerHTML =
      '<label>Quy cách<input data-f="label" maxlength="60" placeholder="VD: 330ml" value="' + esc(v.label || "") + '"></label>' +
      '<label>Đóng gói<input data-f="pack" maxlength="60" placeholder="VD: Thùng 24 lon" value="' + esc(v.pack || "") + '" list="pack-list"></label>' +
      '<label>Giá bán (đ)<input data-f="price" class="money" inputmode="numeric" placeholder="0" value="' + (v.price != null ? num(v.price) : "") + '"></label>' +
      '<label>Giá cũ (đ)<input data-f="oldPrice" class="money" inputmode="numeric" placeholder="Không bắt buộc" value="' + (v.oldPrice ? num(v.oldPrice) : "") + '"></label>' +
      '<button type="button" class="icon-btn danger rm" aria-label="Xóa quy cách này">' + icon("trash") + "</button>";
    return div;
  }
  if (!$("#pack-list")) {
    var dl = document.createElement("datalist");
    dl.id = "pack-list";
    dl.innerHTML = ["Thùng 24 lon", "Thùng 24 chai", "Thùng 20 lon", "Thùng 12 chai", "Thùng 6 lon", "Chai 1 lít", "Bình 5 lít"].map(function (x) { return '<option value="' + x + '">'; }).join("");
    document.body.appendChild(dl);
  }

  $("#pd-variants").addEventListener("input", function (e) {
    if (!e.target.classList.contains("money")) return;
    var digits = e.target.value.replace(/[^\d]/g, "").slice(0, 10);
    e.target.value = digits ? num(Number(digits)) : "";
  });
  $("#pd-variants").addEventListener("click", function (e) {
    var rm = e.target.closest(".rm");
    if (!rm) return;
    if ($$("#pd-variants .variant").length === 1) { toast("Cần ít nhất 1 quy cách", "err"); return; }
    rm.closest(".variant").remove();
  });
  $("#pd-add-variant").addEventListener("click", function () {
    var row = variantRow();
    $("#pd-variants").appendChild(row);
    $("input", row).focus();
  });
  $("#pd-desc").addEventListener("input", function (e) { $("#pd-desc-count").textContent = e.target.value.length + "/500"; });
  pdForm.addEventListener("input", function (e) {
    if (e.target.hasAttribute("aria-invalid")) { e.target.removeAttribute("aria-invalid"); $("#pd-error").hidden = true; }
  });

  function setPreview(src) {
    var img = $("#pd-img");
    if (src) { img.src = src; img.hidden = false; $("#pd-img-empty").hidden = true; $("#pd-img-label").textContent = "Đổi ảnh"; }
    else { img.hidden = true; img.removeAttribute("src"); $("#pd-img-empty").hidden = false; $("#pd-img-label").textContent = "Chọn ảnh"; }
  }

  function pickFile(file) {
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) { toast("Chỉ hỗ trợ ảnh JPG, PNG hoặc WebP", "err"); return; }
    if (file.size > 25 * 1024 * 1024) { toast("Ảnh quá lớn (tối đa 25MB)", "err"); return; }
    ED.file = file;
    if (ED.previewUrl) URL.revokeObjectURL(ED.previewUrl);
    ED.previewUrl = URL.createObjectURL(file);
    setPreview(ED.previewUrl);
    $("#pd-img-info").textContent = file.name + " · " + (file.size / 1024 / 1024).toFixed(1) + "MB — sẽ tự nén sang WebP khi lưu";
  }
  $("#pd-file").addEventListener("change", function (e) { pickFile(e.target.files[0]); e.target.value = ""; });
  var drop = $("#pd-drop");
  ["dragenter", "dragover"].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add("drag"); }); });
  ["dragleave", "drop"].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove("drag"); }); });
  drop.addEventListener("drop", function (e) { pickFile(e.dataTransfer.files[0]); });

  function formSnapshot() {
    return JSON.stringify([$("#pd-name").value, $("#pd-cat").value, $("#pd-origin").value, $("#pd-abv").value, $("#pd-badge").value,
      $("#pd-desc").value, (pdForm.querySelector("[name=pd-status]:checked") || {}).value, $("#pd-visible").checked, $("#pd-featured").checked,
      $$("#pd-variants input").map(function (i) { return i.value; }), !!ED.file]);
  }

  function openEditor(p) {
    ED.product = p; ED.file = null;
    $("#pd-title").textContent = p ? "Sửa sản phẩm" : "Thêm sản phẩm";
    $("#pd-save").textContent = p ? "Lưu thay đổi" : "Thêm sản phẩm";
    $("#pd-error").hidden = true;
    $$("[aria-invalid]", pdForm).forEach(function (el) { el.removeAttribute("aria-invalid"); });
    $("#pd-cat").innerHTML = '<option value="">— Chọn danh mục —</option>' + P.cats.map(function (c) { return '<option value="' + esc(c.id) + '">' + esc(c.name) + "</option>"; }).join("");
    $("#pd-name").value = p ? p.name : "";
    $("#pd-cat").value = p ? p.cat : (P.filter.cat || "");
    $("#pd-origin").value = p ? p.origin : "";
    $("#pd-abv").value = p ? p.abv : "";
    $("#pd-badge").value = p ? p.badge : "";
    $("#pd-desc").value = p ? p.desc : "";
    $("#pd-desc-count").textContent = $("#pd-desc").value.length + "/500";
    (pdForm.querySelector('[name=pd-status][value="' + (p ? p.status : "available") + '"]')).checked = true;
    $("#pd-visible").checked = p ? p.visible !== false : true;
    $("#pd-featured").checked = p ? !!p.featured : false;
    var vs = $("#pd-variants");
    vs.innerHTML = "";
    (p ? p.variants : [{}]).forEach(function (v) { vs.appendChild(variantRow(v)); });
    setPreview(p && p.image ? p.image.large || p.image.thumb : "");
    $("#pd-img-info").textContent = p ? "" : "Nên dùng ảnh dọc (tỉ lệ 4:5 hoặc 9:16).";
    ED.snapshot = formSnapshot();
    pd.showModal();
    $("#pd-name").focus();
  }

  function closeEditor(force) {
    if (!force && formSnapshot() !== ED.snapshot) {
      return confirmBox("Bỏ thay đổi?", "Các thay đổi chưa lưu sẽ bị mất.", "Bỏ thay đổi").then(function (ok) { if (ok) closeEditor(true); });
    }
    pd.close();
    if (ED.previewUrl) { URL.revokeObjectURL(ED.previewUrl); ED.previewUrl = null; }
  }
  $$("[data-close]", pd).forEach(function (b) { b.addEventListener("click", function () { closeEditor(false); }); });
  pd.addEventListener("cancel", function (e) { e.preventDefault(); closeEditor(false); });

  /** Nén ảnh trong trình duyệt: giới hạn chiều rộng, xuất WebP (hoặc JPEG nếu trình duyệt không hỗ trợ). */
  function compress(file, maxW, quality) {
    return createImageBitmap(file).then(function (bmp) {
      var scale = Math.min(1, maxW / bmp.width);
      var c = document.createElement("canvas");
      c.width = Math.round(bmp.width * scale); c.height = Math.round(bmp.height * scale);
      var ctx = c.getContext("2d");
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(bmp, 0, 0, c.width, c.height);
      return new Promise(function (res) { c.toBlob(res, "image/webp", quality); }).then(function (b) {
        if (b && b.type === "image/webp") return b;
        return new Promise(function (res) { c.toBlob(res, "image/jpeg", quality); });
      });
    });
  }
  function upload(blob, name) {
    return api("/api/admin/upload?name=" + encodeURIComponent(name), { method: "POST", body: blob }).then(function (d) { return d.url; });
  }

  pdForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var err = $("#pd-error");
    err.hidden = true;
    $$("[aria-invalid]", pdForm).forEach(function (el) { el.removeAttribute("aria-invalid"); });
    function invalid(el, msg) { el.setAttribute("aria-invalid", "true"); el.focus(); err.textContent = msg; err.hidden = false; }

    var name = $("#pd-name").value.trim();
    if (!name) return invalid($("#pd-name"), "Vui lòng nhập tên sản phẩm.");
    if (!$("#pd-cat").value) return invalid($("#pd-cat"), "Vui lòng chọn danh mục.");
    var variants = [], bad = null;
    $$("#pd-variants .variant").forEach(function (row, i) {
      if (bad) return;
      var get = function (f) { return $('[data-f="' + f + '"]', row); };
      var v = { label: get("label").value.trim(), pack: get("pack").value.trim(),
        price: get("price").value.replace(/[^\d]/g, ""), oldPrice: get("oldPrice").value.replace(/[^\d]/g, "") };
      if (!v.label) bad = [get("label"), "Nhập tên quy cách #" + (i + 1) + " (VD: 330ml)."];
      else if (!v.pack) bad = [get("pack"), "Nhập cách đóng gói cho quy cách #" + (i + 1) + "."];
      else if (v.price === "") bad = [get("price"), "Nhập giá bán cho quy cách #" + (i + 1) + "."];
      else if (v.oldPrice && Number(v.oldPrice) <= Number(v.price)) bad = [get("oldPrice"), "Giá cũ của quy cách #" + (i + 1) + " phải cao hơn giá bán."];
      variants.push({ label: v.label, pack: v.pack, price: Number(v.price), oldPrice: v.oldPrice ? Number(v.oldPrice) : null });
    });
    if (bad) return invalid(bad[0], bad[1]);

    var body = {
      name: name, cat: $("#pd-cat").value, origin: $("#pd-origin").value, abv: $("#pd-abv").value,
      badge: $("#pd-badge").value, desc: $("#pd-desc").value,
      status: pdForm.querySelector("[name=pd-status]:checked").value,
      visible: $("#pd-visible").checked, featured: $("#pd-featured").checked, variants: variants
    };
    var btn = $("#pd-save");
    busy(btn, true, ED.file ? "Đang nén & tải ảnh…" : "Đang lưu…");
    var imgStep = Promise.resolve(ED.product ? ED.product.image : { thumb: "", large: "" });
    if (ED.file) {
      var base = slug(name);
      imgStep = Promise.all([compress(ED.file, 560, 0.78), compress(ED.file, 1200, 0.82)])
        .then(function (b) { return Promise.all([upload(b[0], base), upload(b[1], base + "-lg")]); })
        .then(function (urls) { return { thumb: urls[0], large: urls[1] }; });
    }
    imgStep.then(function (image) {
      body.image = image;
      return ED.product
        ? api("/api/admin/products/" + encodeURIComponent(ED.product.id), { method: "PUT", body: body })
        : api("/api/admin/products", { method: "POST", body: body });
    }).then(function (d) {
      busy(btn, false);
      var isNew = !ED.product;
      if (isNew) P.list.unshift(d.product);
      else { var i = P.list.findIndex(function (x) { return x.id === ED.product.id; }); if (i >= 0) P.list[i] = d.product; }
      closeEditor(true);
      if ($("#ptable")) renderProductTable();
      toast(isNew ? "Đã thêm “" + d.product.name + "”" : "Đã lưu “" + d.product.name + "”");
    }).catch(function (ex) {
      busy(btn, false);
      if (ex.silent) return;
      err.textContent = ex.message || "Không lưu được, vui lòng thử lại."; err.hidden = false;
    });
  });

  /* =========================================================
   * Danh mục
   * ========================================================= */
  function viewCategories() {
    api("/api/admin/categories").then(function (d) {
      var cats = d.categories.map(function (c) { return Object.assign({}, c); });
      var counts = d.counts;
      content.innerHTML = '<section class="panel" style="max-width:820px"><div class="panel-head"><div><h2>Danh mục sản phẩm</h2>' +
        "<p>Tên ngắn dùng cho nút lọc trên web (để trống sẽ dùng tên đầy đủ). Chỉ xóa được danh mục không còn sản phẩm.</p></div></div>" +
        '<div class="cat-list" id="cat-list"></div>' +
        '<div style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn btn-ghost" id="cat-add">' + icon("plus") + " Thêm danh mục</button>" +
        '<span style="flex:1"></span><button class="btn btn-primary" id="cat-save">Lưu danh mục</button></div></section>';
      function draw() {
        $("#cat-list").innerHTML = cats.map(function (c, i) {
          var n = counts[c.id] || 0;
          return '<div class="cat-row" data-i="' + i + '">' +
            '<div class="order-btns"><button class="icon-btn" data-a="up" aria-label="Lên"' + (i ? "" : " disabled") + ">" + icon("up") + "</button>" +
            '<button class="icon-btn" data-a="down" aria-label="Xuống"' + (i < cats.length - 1 ? "" : " disabled") + ">" + icon("down") + "</button></div>" +
            '<input data-f="name" value="' + esc(c.name) + '" placeholder="Tên danh mục" aria-label="Tên danh mục" maxlength="60">' +
            '<input data-f="short" value="' + esc(c.short || "") + '" placeholder="Tên ngắn (tuỳ chọn)" aria-label="Tên ngắn" maxlength="30">' +
            '<span class="count">' + n + " sản phẩm</span>" +
            '<button class="icon-btn danger" data-a="del" aria-label="Xóa danh mục"' + (n ? ' disabled title="Còn sản phẩm trong danh mục"' : "") + ">" + icon("trash") + "</button></div>";
        }).join("");
      }
      draw();
      $("#cat-list").addEventListener("input", function (e) {
        var row = e.target.closest(".cat-row"); if (!row) return;
        cats[+row.dataset.i][e.target.dataset.f] = e.target.value;
      });
      $("#cat-list").addEventListener("click", function (e) {
        var b = e.target.closest("[data-a]"); if (!b) return;
        var i = +b.closest(".cat-row").dataset.i;
        if (b.dataset.a === "del") cats.splice(i, 1);
        else { var j = b.dataset.a === "up" ? i - 1 : i + 1; var t = cats[i]; cats[i] = cats[j]; cats[j] = t; }
        draw();
      });
      $("#cat-add").addEventListener("click", function () {
        cats.push({ name: "", short: "" }); draw();
        $("#cat-list .cat-row:last-child input").focus();
      });
      $("#cat-save").addEventListener("click", function () {
        var btn = this;
        if (cats.some(function (c) { return !String(c.name).trim(); })) { toast("Vui lòng nhập tên cho mọi danh mục", "err"); return; }
        busy(btn, true);
        api("/api/admin/categories", { method: "PUT", body: { categories: cats } }).then(function (r) {
          busy(btn, false);
          cats = r.categories.map(function (c) { return Object.assign({}, c); }); draw();
          toast("Đã lưu danh mục");
        }).catch(function (ex) { busy(btn, false); fail(ex); });
      });
    }).catch(fail);
  }

  /* =========================================================
   * Thông báo đầu trang
   * ========================================================= */
  function viewSettings() {
    api("/api/admin/settings").then(function (s) {
      var a = s.announcement || {};
      content.innerHTML = '<section class="panel" style="max-width:720px"><div class="panel-head"><div><h2>Thanh thông báo trên đầu trang web</h2>' +
        "<p>Dùng cho khuyến mãi, lịch nghỉ lễ, sản phẩm mới về…</p></div></div>" +
        '<label class="switch" style="margin-bottom:14px"><input type="checkbox" id="an-on"' + (a.enabled ? " checked" : "") + '><span class="track"></span><span>Hiện thông báo</span></label>' +
        '<div class="field"><label for="an-text">Nội dung <small class="counter" id="an-count"></small></label><input id="an-text" maxlength="200" value="' + esc(a.text) + '" placeholder="VD: Giảm 5% cho đơn từ 3 thùng — đến hết 30/11"></div>' +
        '<div class="field"><label for="an-link">Liên kết khi bấm (tuỳ chọn)</label><input id="an-link" maxlength="300" value="' + esc(a.link) + '" placeholder="VD: #san-pham hoặc https://zalo.me/84929777784"></div>' +
        '<div class="field"><label>Xem trước</label><div class="preview-bar" id="an-preview"></div></div>' +
        '<button class="btn btn-primary" id="an-save">Lưu thông báo</button></section>';
      function preview() {
        var t = $("#an-text").value.trim();
        $("#an-count").textContent = $("#an-text").value.length + "/200";
        $("#an-preview").innerHTML = t ? ($("#an-link").value.trim() ? "<a>" + esc(t) + "</a>" : esc(t)) : '<span style="opacity:.6">(chưa có nội dung)</span>';
        $("#an-preview").style.opacity = $("#an-on").checked ? 1 : .45;
      }
      ["an-text", "an-link", "an-on"].forEach(function (id) { $("#" + id).addEventListener("input", preview); });
      preview();
      $("#an-save").addEventListener("click", function () {
        var btn = this; busy(btn, true);
        api("/api/admin/settings", { method: "PUT", body: { announcement: { enabled: $("#an-on").checked, text: $("#an-text").value, link: $("#an-link").value } } })
          .then(function () { busy(btn, false); toast("Đã lưu thông báo"); })
          .catch(function (ex) { busy(btn, false); fail(ex); });
      });
    }).catch(fail);
  }

  /* =========================================================
   * Nhật ký
   * ========================================================= */
  var LOG_TAG = {
    login: ["Đăng nhập", "ok"], login_fail: ["Sai mật khẩu", "warn"], lock: ["Khóa", "warn"], create: ["Thêm", ""], update: ["Sửa", ""],
    delete: ["Xóa", "warn"], reorder: ["Sắp xếp", ""], categories: ["Danh mục", ""], settings: ["Thông báo", ""],
    password: ["Mật khẩu", "ok"], export: ["Sao lưu", ""], import: ["Khôi phục", "warn"]
  };
  function viewLogs() {
    api("/api/admin/logs").then(function (d) {
      content.innerHTML = '<section class="panel"><div class="panel-head"><div><h2>200 hoạt động gần nhất</h2><p>Đăng nhập, thay đổi sản phẩm, cài đặt…</p></div></div>' +
        (d.logs.length ? '<ul class="log-list">' + d.logs.map(function (l) {
          var tag = LOG_TAG[l.action] || [l.action, ""];
          return '<li><span class="log-time">' + fmtTime(l.t) + '</span><div class="log-detail"><span class="log-tag ' + tag[1] + '">' + esc(tag[0]) + "</span>" + esc(l.detail) +
            '<div class="log-ip">' + esc([l.user, l.ip].filter(Boolean).join(" · ")) + "</div></div></li>";
        }).join("") + "</ul>" : '<p class="empty-note">Chưa có hoạt động nào.</p>') + "</section>";
    }).catch(fail);
  }

  /* =========================================================
   * Tài khoản & sao lưu
   * ========================================================= */
  function viewAccount() {
    api("/api/auth/me").then(function (info) {
      content.innerHTML = '<div class="grid-2">' +
        '<section class="panel"><div class="panel-head"><div><h2>Đổi mật khẩu</h2><p>Sau khi đổi, các thiết bị khác đang đăng nhập sẽ bị đăng xuất.</p></div></div>' +
          '<form id="pw-form" novalidate>' +
          '<input type="text" name="username" autocomplete="username" value="' + esc(info.username) + '" hidden>' +
          '<div class="field"><label for="pw-cur">Mật khẩu hiện tại</label><div class="pw-wrap"><input id="pw-cur" type="password" autocomplete="current-password" required></div></div>' +
          '<div class="field"><label for="pw-new">Mật khẩu mới</label><div class="pw-wrap"><input id="pw-new" type="password" autocomplete="new-password" required minlength="8"></div><p class="hint">Ít nhất 8 ký tự, có cả chữ và số.</p></div>' +
          '<div class="field"><label for="pw-new2">Nhập lại mật khẩu mới</label><div class="pw-wrap"><input id="pw-new2" type="password" autocomplete="new-password" required></div></div>' +
          '<p class="form-error" id="pw-error" role="alert" hidden></p>' +
          '<button class="btn btn-primary" type="submit" id="pw-save">Đổi mật khẩu</button></form></section>' +
        '<section class="panel"><div class="panel-head"><div><h2>Sao lưu dữ liệu</h2><p>Tải file chứa toàn bộ sản phẩm, danh mục và thông báo. Nên sao lưu định kỳ.</p></div></div>' +
          '<div class="info-line">' + icon("lock") + "Tài khoản: <b>" + esc(info.username) + "</b> · Lưu trữ: <b>" + (info.storage === "upstash" ? "Upstash Redis (online)" : "File local (chạy thử)") + "</b></div>" +
          '<div style="display:flex;gap:10px;flex-wrap:wrap">' +
            '<button class="btn btn-outline" id="bk-export">' + icon("download") + " Tải file sao lưu</button>" +
            '<label class="btn btn-ghost file-btn">' + icon("upload") + ' Khôi phục từ file<input type="file" id="bk-import" accept="application/json,.json" hidden></label>' +
          "</div><p class=\"hint\" style=\"margin-top:10px\">Khôi phục sẽ <b>thay thế</b> toàn bộ sản phẩm & danh mục hiện tại. Ảnh không nằm trong file sao lưu (chỉ lưu đường dẫn).</p></section>" +
        "</div>";

      $("#pw-form").addEventListener("submit", function (e) {
        e.preventDefault();
        var err = $("#pw-error"), cur = $("#pw-cur").value, n1 = $("#pw-new").value, n2 = $("#pw-new2").value;
        err.hidden = true;
        var msg = !cur ? "Nhập mật khẩu hiện tại." : n1.length < 8 ? "Mật khẩu mới cần ít nhất 8 ký tự." :
          !(/[A-Za-z]/.test(n1) && /\d/.test(n1)) ? "Mật khẩu mới cần có cả chữ và số." : n1 !== n2 ? "Hai lần nhập mật khẩu mới không khớp." : n1 === cur ? "Mật khẩu mới phải khác mật khẩu hiện tại." : "";
        if (msg) { err.textContent = msg; err.hidden = false; return; }
        var btn = $("#pw-save"); busy(btn, true);
        api("/api/auth/password", { method: "POST", body: { current: cur, next: n1 }, allow401: true }).then(function () {
          busy(btn, false); e.target.reset(); toast("Đã đổi mật khẩu");
        }).catch(function (ex) { busy(btn, false); if (!ex.silent) { err.textContent = ex.message; err.hidden = false; } });
      });

      $("#bk-export").addEventListener("click", function () {
        api("/api/admin/export").then(function (d) {
          var blob = new Blob([JSON.stringify(d, null, 2)], { type: "application/json" });
          var a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = "heo-corner-backup-" + d.exportedAt.slice(0, 10) + ".json";
          document.body.appendChild(a); a.click(); a.remove();
          setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
          toast("Đã tải file sao lưu (" + d.products.length + " sản phẩm)");
        }).catch(fail);
      });

      $("#bk-import").addEventListener("change", function (e) {
        var f = e.target.files[0]; e.target.value = "";
        if (!f) return;
        f.text().then(function (t) {
          var data;
          try { data = JSON.parse(t); } catch (x) { throw new Error("File không phải JSON hợp lệ"); }
          if (!data || data.app !== "heo-corner") throw new Error("File không phải bản sao lưu Heo Corner");
          return confirmBox("Khôi phục dữ liệu?", "Thay thế toàn bộ bằng " + (data.products || []).length + " sản phẩm và " + (data.categories || []).length +
            " danh mục từ bản sao lưu ngày " + String(data.exportedAt || "").slice(0, 10) + ". Dữ liệu hiện tại sẽ bị ghi đè.", "Khôi phục")
            .then(function (ok) {
              if (!ok) return;
              return api("/api/admin/import", { method: "POST", body: data }).then(function (r) { toast("Đã khôi phục " + r.products + " sản phẩm"); });
            });
        }).catch(fail);
      });
    }).catch(fail);
  }

  /* =========================================================
   * Khởi động
   * ========================================================= */
  api("/api/auth/me", { allow401: true })
    .then(function (d) { enterApp(d.username); })
    .catch(function (e) { showLogin(e.status && e.status !== 401 ? e.message : ""); });
})();
