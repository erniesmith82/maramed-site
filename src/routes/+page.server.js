// src/routes/+page.server.js
import catalog from "$lib/data/products.json";

/* === Week seed (America/New_York) === */
function nowInET() {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
  const parts = Object.fromEntries(fmt.formatToParts(new Date()).map(p => [p.type, p.value]));
  return new Date(`${parts.year}-${parts.month}-${parts.day}T00:00:00-05:00`);
}
function weekKeyET() {
  const d = nowInET();
  const day = (d.getDay() + 6) % 7;   // Mon=0 … Sun=6
  d.setDate(d.getDate() - day + 3);   // ISO week Thursday
  const firstThu = new Date(d.getFullYear(), 0, 4);
  const adj = (firstThu.getDay() + 6) % 7;
  const week = 1 + Math.round(((d - firstThu) / 86400000 - 3 + adj) / 7);
  return `${d.getFullYear()}-W${week}`;
}

/* === Seeded PRNG + Fisher–Yates === */
function xmur3(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return h >>> 0;
  };
}
function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffleDeterministic(arr, rnd) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* === Catalog helpers === */
const pick = (...vals) => vals.find(v => typeof v === "string" && v.trim().length) || null;

function normalizeImagePath(p) {
  if (!p) return null;
  return p.replace(/\s+(?=\.[a-zA-Z0-9]+$)/, ""); // trim space before extension
}
function imageForFamily(fam) {
  return normalizeImagePath(pick(fam?.image, fam?.details?.heroImage, fam?.details?.gallery?.[0]));
}

/* === Build featured pool (series → familyKeys) === */
function buildPool(cat) {
  const famMap = cat.families || {};
  const out = [];

  for (const series of cat.series || []) {
    const keys = series.familyKeys || [];
    for (const key of keys) {
      const fam = famMap[key];
      if (!fam) continue;

      const img = imageForFamily(fam);
      if (!img) continue;

      out.push({
        name: fam.title || fam.key,
        desc: pick(fam.details?.description, series.description) || "",
        sku: "",
        img,
        href: `/catalog/${encodeURIComponent(fam.key)}`,
        tag: series.label || ""
      });
    }
  }
  return out;
}

/* === Load === */
export function load() {
  const pool = buildPool(catalog);

  // rotate weekly (deterministic)
  const seed = xmur3(weekKeyET())();
  const rnd = mulberry32(seed);
  const featured = shuffleDeterministic(pool, rnd).slice(0, 3);

  const debugInfo = {
    week: weekKeyET(),
    poolCount: pool.length,
    featuredCount: featured.length,
    first: featured[0]?.name
  };
  console.log("[landing] featured debug:", debugInfo);

  return { featured, debugInfo };
}
