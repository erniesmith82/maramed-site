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

/* ---------- measurement cards helpers ---------- */
function slugify(s = "") {
  return s.toString().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function findImageByKeyword(gallery = [], keywords = []) {
  const lower = gallery.map((p) => ({ p, k: (p || "").toLowerCase() }));
  for (const kw of keywords) {
    const hit = lower.find(({ k }) => k.includes(kw));
    if (hit) return hit.p;
  }
  return "";
}

function coerceMeasurementCards(d = {}) {
  // 1) explicit cards from products.json
  if (Array.isArray(d.measurementCards) && d.measurementCards.length) {
    return d.measurementCards.map((m, i) => ({
      key: m.key || slugify(m.title || `card-${i + 1}`),
      title: m.title || "",
      note: m.note || m.description || "",
      image: m.image || "",
      href: m.href || `#${m.key || slugify(m.title || `card-${i + 1}`)}`
    }));
  }

  // 2) build from sections (like MP “sections” schema)
  if (Array.isArray(d.sections) && d.sections.length) {
    return d.sections.map((s, i) => ({
      key: s.id || slugify(s.title || `section-${i + 1}`),
      title: s.title || "",
      note: s.body || (Array.isArray(s.steps) ? s.steps[0] : ""),
      image: s.image || "",
      href: `#${s.id || slugify(s.title || `section-${i + 1}`)}`
    }));
  }

  // 3) fallback: match notes to gallery images by keyword
  const notes = Array.isArray(d.notes) ? d.notes : [];
  const gallery = Array.isArray(d.gallery) ? d.gallery : [];
  const map = [
    { test: /m-?\s?p\s*diam/i, key: "mp-diameter",    title: "M-P Diameter",           kws: ["mp", "m-p", "m_p", "diameter"] },
    { test: /calf/i,           key: "calf-circumf",   title: "Calf Circumference",     kws: ["calf"] },
    { test: /forearm/i,        key: "forearm",        title: "Forearm",                kws: ["forearm"] },
    { test: /wrist/i,          key: "wrist",          title: "Wrist",                  kws: ["wrist"] },
    { test: /bicep/i,          key: "bicep-circumf",  title: "Bicep Circumference",    kws: ["bicep"] }
  ];

  const cards = [];
  for (const rule of map) {
    const note = notes.find((n) => rule.test(n));
    if (note) {
      cards.push({
        key: rule.key,
        title: rule.title,
        note,
        image: findImageByKeyword(gallery, rule.kws),
        href: `#${rule.key}`
      });
    }
  }
  return cards;
}

/* ---------- sections normalization (steps & suggested tools) ---------- */
function normalizeStringArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  const s = String(value).trim();
  return s ? [s] : [];
}

function normalizeListsObject(lists) {
  // Convert { "Group Title": [items] } to an array of { title, items }
  if (!lists || typeof lists !== "object") return [];
  const groups = [];
  for (const [title, arr] of Object.entries(lists)) {
    // If items look like tools (objects with itemNumber/sku), link them; otherwise keep as strings
    const hasObjects = Array.isArray(arr) && arr.some((x) => x && typeof x === "object");
    const items = hasObjects ? normalizeAdditionalItems(arr) : normalizeStringArray(arr);
    groups.push({ title, items });
  }
  return groups;
}

function normalizeSuggestedTools(tools) {
  // Accept strings or objects; create linkable items where possible
  if (!tools) return [];
  if (!Array.isArray(tools)) tools = [tools];
  return normalizeAdditionalItems(
    tools.map((t) => (typeof t === "string" ? { description: t } : t))
  );
}

function normalizeSections(sections = []) {
  if (!Array.isArray(sections)) return [];
  return sections.map((s, i) => {
    const id = s?.id || slugify(s?.title || `section-${i + 1}`);
    return {
      id,
      title: s?.title || "",
      body: s?.body || "",
      // Canonical fields
      steps: normalizeStringArray(s?.steps),
      requiredMaterials: normalizeStringArray(s?.requiredMaterials),
      procedure: normalizeStringArray(s?.procedure),
      // Tools (linkable)
      suggestedTools: normalizeSuggestedTools(s?.suggestedTools),
      // Structured lists (each group can be strings or linkable items)
      lists: normalizeListsObject(s?.lists),
      // Pass through anything else in case the page uses it
      ...("image" in (s || {}) ? { image: s.image } : {})
    };
  });
}

/* ---------- SvelteKit load ---------- */
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

  // mpNote as ARRAY
  const mpNotes = normalizeMpNoteArray(d.mpNote);

  // Sections (with steps, requiredMaterials, procedure, suggestedTools, lists)
  const sections = normalizeSections(d.sections);

  // NEW: measurement cards (explicit → sections → notes/gallery)
  const measurementCards = coerceMeasurementCards({ ...d, sections });

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
      mpNote: mpNotes,
      additionalItems: normalizeAdditionalItems(d.additionalItems),
      sizes,
      sizeGroups,
      measurementCards,
      // expose normalized sections to the page
      sections
    }
  };
}
