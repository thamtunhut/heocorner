// Thống kê truy cập: khách duy nhất (HyperLogLog), lượt xem trang, lượt bấm Zalo, lượt xem từng sản phẩm.
// Không lưu IP thô: chỉ lưu mã băm (IP + trình duyệt + SESSION_SECRET).
import crypto from "node:crypto";
import { store } from "./store.js";

const TZ = "Asia/Ho_Chi_Minh";
const KEEP_DAYS = 400; // giữ dữ liệu ~13 tháng
const TTL = KEEP_DAYS * 86400;
const BOT = /bot|crawl|spider|slurp|headless|lighthouse|preview|facebookexternalhit|zalo.*(link|preview)|curl|wget|python|node-fetch/i;

const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });
export const dayKey = (d = new Date()) => fmt.format(d); // YYYY-MM-DD theo giờ Việt Nam

export function lastDays(n, from = new Date()) {
  const out = [];
  for (let i = n - 1; i >= 0; i--) out.push(dayKey(new Date(from.getTime() - i * 86400000)));
  return out;
}

const k = {
  uv: (d) => `st:uv:${d}`,
  pv: (d) => `st:pv:${d}`,
  zalo: (d) => `st:zalo:${d}`,
  prod: (d) => `st:prod:${d}`
};

export const isBot = (ua) => !ua || BOT.test(ua);

function visitorId(ip, ua) {
  return crypto.createHmac("sha256", process.env.SESSION_SECRET || "heo")
    .update(ip + "|" + ua).digest("hex").slice(0, 20);
}

/** type: pageview | product | zalo */
export async function track(type, { ip, ua, productId }) {
  const d = dayKey();
  const cmds = [];
  if (type === "pageview") {
    cmds.push(["PFADD", k.uv(d), visitorId(ip, ua)], ["EXPIRE", k.uv(d), TTL],
      ["INCR", k.pv(d)], ["EXPIRE", k.pv(d), TTL]);
  } else if (type === "zalo") {
    cmds.push(["INCR", k.zalo(d)], ["EXPIRE", k.zalo(d), TTL]);
  } else if (type === "product" && productId) {
    cmds.push(["HINCRBY", k.prod(d), productId, 1], ["EXPIRE", k.prod(d), TTL]);
  } else return false;
  await store.pipeline(cmds);
  return true;
}

export async function getStats(products = []) {
  const days30 = lastDays(30);
  const days7 = days30.slice(-7);
  const today = days30[days30.length - 1];

  const cmds = [];
  for (const d of days30) cmds.push(["PFCOUNT", k.uv(d)], ["GET", k.pv(d)], ["GET", k.zalo(d)], ["HGETALL", k.prod(d)]);
  cmds.push(["PFCOUNT", ...days7.map(k.uv)], ["PFCOUNT", ...days30.map(k.uv)]);
  const r = await store.pipeline(cmds);

  const series = [];
  const prodTotals = {};
  const prod7 = {};
  days30.forEach((d, i) => {
    const [uv, pv, zalo, prod] = r.slice(i * 4, i * 4 + 4);
    series.push({ date: d, visitors: Number(uv) || 0, pageviews: Number(pv) || 0, zalo: Number(zalo) || 0 });
    const obj = store.toObj(prod);
    for (const [id, n] of Object.entries(obj)) {
      prodTotals[id] = (prodTotals[id] || 0) + Number(n);
      if (days7.includes(d)) prod7[id] = (prod7[id] || 0) + Number(n);
    }
  });
  const uniq7 = Number(r[r.length - 2]) || 0;
  const uniq30 = Number(r[r.length - 1]) || 0;
  const sum = (arr, f) => arr.reduce((s, x) => s + x[f], 0);
  const last7 = series.slice(-7);
  const todayRow = series[series.length - 1];
  const yesterday = series[series.length - 2];

  const names = Object.fromEntries(products.map((p) => [p.id, p]));
  const topProducts = Object.entries(prodTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([id, views]) => ({
      id, views, views7: prod7[id] || 0,
      name: names[id] ? names[id].name : id + " (đã xóa)",
      thumb: names[id] && names[id].image ? names[id].image.thumb : ""
    }));

  return {
    today: { date: today, visitors: todayRow.visitors, pageviews: todayRow.pageviews, zalo: todayRow.zalo,
      prevVisitors: yesterday ? yesterday.visitors : 0 },
    week: { visitors: uniq7, pageviews: sum(last7, "pageviews"), zalo: sum(last7, "zalo") },
    month: { visitors: uniq30, pageviews: sum(series, "pageviews"), zalo: sum(series, "zalo") },
    series,
    topProducts
  };
}
