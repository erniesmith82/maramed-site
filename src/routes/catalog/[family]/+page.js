// src/routes/catalog/[family]/+page.js
import catalog from "$lib/data/products.json";
import { error } from "@sveltejs/kit";

const norm = (s = "") => decodeURIComponent(s).toUpperCase();

/* ---------- LOOKUP (Option B + legacy fallback) ---------- */
function findFamilyInCatalog(familyKeyRaw) {
  const key = norm(familyKeyRaw);
  const dict = catalog.families;

  // Preferred: top-level dictionary { [key]: family }
  if (dict && !Array.isArray(dict)) {
    const matchKey = Object.keys(dict).find((k) => (k || "").toUpperCase() === key);
    if (matchKey) {
      const family = dict[matchKey];
      const series =
        (catalog.series ?? []).find((s) =>
          (s.familyKeys ?? []).some((fk) => (fk || "").toUpperCase() === key)
        ) ?? null;
      return { series, family };
    }
  }

  // Legacy: search series[].families (embedded)
  for (const s of catalog.series ?? []) {
    const fam = (s.families ?? []).find(
      (f) =>
        (f?.key || "").toUpperCase() === key ||
        (f?.slug || "").toUpperCase() === key
    );
    if (fam) return { series: s, family: fam };
  }

  // Legacy: top-level array
  if (Array.isArray(catalog.families)) {
    const fam = catalog.families.find(
      (f) =>
        (f?.key || "").toUpperCase() === key ||
        (f?.slug || "").toUpperCase() === key
    );
    if (fam) {
      const series =
        (catalog.series ?? []).find(
          (s) =>
            (s.familyKeys ?? []).some((fk) => (fk || "").toUpperCase() === key) ||
            (s.families ?? []).some(
              (ff) =>
                (ff?.key || "").toUpperCase() === key ||
                (ff?.slug || "").toUpperCase() === key
            )
        ) ?? null;
      return { series, family: fam };
    }
  }

  return null;
}

/* ---------- helpers ---------- */
// Keep BOTH itemNumber and sku so the table can show either column
function normalizeRow(row = {}) {
  const { sku, itemNumber, ...rest } = row || {};
  const num = itemNumber ?? sku ?? "";
  const idSku = sku ?? itemNumber ?? "";
  return { itemNumber: num, sku: idSku, ...rest };
}

function normalizeRows(rows = [], items = []) {
  const out = [];
  for (const r of rows ?? []) {
    if (typeof r === "string") {
      const sku = r.trim();
      const it = (items ?? []).find(
        (x) => x && (x.sku || x.itemNumber) && String(x.sku || x.itemNumber).trim() === sku
      );
      out.push(normalizeRow(it || { sku }));
    } else {
      out.push(normalizeRow(r));
    }
  }
  return out;
}

function normalizeNotes(notes) {
  if (!notes) return [];
  if (Array.isArray(notes)) {
    return notes.map((n) => (n == null ? "" : String(n).trim())).filter(Boolean);
  }
  const s = String(notes).trim();
  return s ? [s] : [];
}

// 🔁 mpNote as ARRAY (not string)
function normalizeMpNoteArray(mpNote) {
  if (!mpNote) return [];
  if (Array.isArray(mpNote)) {
    return mpNote.map((n) => String(n).trim()).filter(Boolean);
  }
  const s = String(mpNote).trim();
  return s ? [s] : [];
}

/* ---------- build SKU → family index ---------- */
function buildItemIndex() {
  const idx = new Map();

  // Preferred dict style
  const dict = catalog.families;
  if (dict && !Array.isArray(dict)) {
    for (const [fkey, fam] of Object.entries(dict)) {
      for (const it of fam.items ?? []) {
        const num = String(it?.sku ?? it?.itemNumber ?? "").trim();
        if (num) {
          idx.set(num.toUpperCase(), {
            familyKey: fam.key || fkey,
            familyTitle: fam.title || fam.key || fkey
          });
        }
      }
    }
  }

  // Legacy embedded
  for (const s of catalog.series ?? []) {
    for (const fam of s.families ?? []) {
      for (const it of fam.items ?? []) {
        const num = String(it?.sku ?? it?.itemNumber ?? "").trim();
        if (num) {
          idx.set(num.toUpperCase(), {
            familyKey: fam.key || fam.slug || fam.title || "",
            familyTitle: fam.title || fam.key || ""
          });
        }
      }
    }
  }

  return idx;
}

/* ---------- normalize & link additionalItems ---------- */
function normalizeAdditionalItems(additionalItems = []) {
  const idx = buildItemIndex();
  return (additionalItems ?? []).map((ai) => {
    const itemNumber =
      ai?.itemNumber ?? ai?.sku ?? ai?.["item number"] ?? "";
    const description =
      ai?.description ?? ai?.Description ?? itemNumber ?? "";
    const key = String(itemNumber || "").trim().toUpperCase();

    const match = key ? idx.get(key) : null;
    const familyKey = match?.familyKey ?? "";
    const familyTitle = match?.familyTitle ?? "";
    const href = match
      ? `/catalog/${encodeURIComponent(familyKey)}?sku=${encodeURIComponent(itemNumber)}`
      : "";

    return {
      ...ai,
      itemNumber,
      description,
      familyKey,
      familyTitle,
      href
    };
  });
}

export function load({ params }) {
  const keyRaw = params.family;
  const hit = findFamilyInCatalog(keyRaw);
  if (!hit) throw error(404, `No product found for family "${params.family}"`);

  const f = hit.family;
  const d = f.details ?? {};
  const items = Array.isArray(f.items) ? f.items : [];

  const sizes = normalizeRows(items, items);

  let sizeGroups = null;
  if (Array.isArray(d.sizeGroups) && d.sizeGroups.length) {
    sizeGroups = d.sizeGroups
      .map((g) => ({
        title: g?.title || "Group",
        image: g?.image || "",
        notes: normalizeNotes(g?.notes),
        rows: normalizeRows(Array.isArray(g?.rows) ? g.rows : [], items)
      }))
      .filter((g) => g.rows.length > 0);
  } else {
    const hasGroup = items.some((it) => it && it.group != null);
    if (hasGroup) {
      const map = new Map();
      for (const it of items) {
        const row = normalizeRow(it);
        const gkey = String(it?.group ?? "Other");
        if (!map.has(gkey)) map.set(gkey, []);
        map.get(gkey).push(row);
      }
      sizeGroups = Array.from(map, ([title, rows]) => ({
        title,
        image: "",
        notes: [],
        rows
      }));
    }
  }

  // ⬇️ mpNote now normalized as ARRAY
  const mpNotes = normalizeMpNoteArray(d.mpNote);

  return {
    family: f.key,
    details: {
      title: f.title ?? f.key,
      heroImage: d.heroImage || f.image || "",
      gallery: d.gallery ?? [],
      description: d.description ?? "",
      indications: d.indications ?? [],
      lcode: d.lcode ?? "",
      notes: normalizeNotes(d.notes),
      mpNote: mpNotes, // array for the Svelte page to render as a list
      additionalItems: normalizeAdditionalItems(d.additionalItems),
      sizes,
      sizeGroups
    }
  };
}
