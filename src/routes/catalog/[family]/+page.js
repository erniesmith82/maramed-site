// src/routes/catalog/[family]/+page.js
import catalog from "$lib/data/products.json";
import { error } from "@sveltejs/kit";

const norm = (s = "") => decodeURIComponent(s).toUpperCase();

function findFamilyInCatalog(familyKeyRaw) {
  const key = norm(familyKeyRaw);
  const dict = catalog.families;

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

  for (const s of catalog.series ?? []) {
    const fam = (s.families ?? []).find(
      (f) =>
        (f?.key || "").toUpperCase() === key ||
        (f?.slug || "").toUpperCase() === key
    );
    if (fam) return { series: s, family: fam };
  }

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

function normalizeMpNoteArray(mpNote) {
  if (!mpNote) return [];
  if (Array.isArray(mpNote)) {
    return mpNote.map((n) => String(n).trim()).filter(Boolean);
  }
  const s = String(mpNote).trim();
  return s ? [s] : [];
}

function buildItemIndex() {
  const idx = new Map();
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
      ...(typeof ai === "object" ? ai : {}),
      itemNumber,
      description,
      familyKey,
      familyTitle,
      href
    };
  });
}

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

// Hardened version to avoid `.test` errors on malformed notes
function coerceMeasurementCards(d = {}) {
  const rawNotes = d?.notes;
  const notes = Array.isArray(rawNotes)
    ? rawNotes.map((n) => (n == null ? "" : String(n))).filter(Boolean)
    : (rawNotes != null ? [String(rawNotes)] : []);

  const gallery = Array.isArray(d?.gallery) ? d.gallery : [];

  const rules = [
    { re: /m-?\s?p\s*diam/i, key: "mp-diameter",   title: "M-P Diameter",        kws: ["mp", "m-p", "m_p", "diameter"] },
    { re: /calf/i,           key: "calf-circumf",  title: "Calf Circumference",  kws: ["calf"] },
    { re: /forearm/i,        key: "forearm",       title: "Forearm",             kws: ["forearm"] },
    { re: /wrist/i,          key: "wrist",         title: "Wrist",               kws: ["wrist"] },
    { re: /bicep/i,          key: "bicep-circumf", title: "Bicep Circumference", kws: ["bicep"] }
  ];

  const lower = gallery.map((p) => ({ p, k: (p || "").toLowerCase() }));
  const findImage = (keywords = []) => {
    for (const kw of keywords) {
      const hit = lower.find(({ k }) => k.includes(kw));
      if (hit) return hit.p;
    }
    return "";
  };

  if (Array.isArray(d?.measurementCards) && d.measurementCards.length) {
    return d.measurementCards.map((m, i) => {
      const key = m?.key || (m?.title ? slugify(m.title) : `card-${i + 1}`);
      return {
        key,
        title: m?.title || "",
        note: m?.note || m?.description || "",
        image: m?.image || "",
        href: m?.href || `#${key}`
      };
    });
  }

  if (Array.isArray(d?.sections) && d.sections.length) {
    return d.sections.map((s, i) => {
      const key = s?.id || (s?.title ? slugify(s.title) : `section-${i + 1}`);
      return {
        key,
        title: s?.title || "",
        note: s?.body || (Array.isArray(s?.steps) ? s.steps[0] : ""),
        image: s?.image || "",
        href: `#${key}`
      };
    });
  }

  const cards = [];
  for (const r of rules) {
    const regex = r.re instanceof RegExp ? r.re : new RegExp(String(r.re || ""), "i");
    const note = notes.find((n) => typeof n === "string" && regex.test(n));
    if (note) {
      cards.push({
        key: r.key,
        title: r.title,
        note,
        image: findImage(r.kws),
        href: `#${r.key}`
      });
    }
  }
  return cards;
}

function normalizeStringArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  const s = String(value).trim();
  return s ? [s] : [];
}

function normalizeListsObject(lists) {
  if (!lists || typeof lists !== "object") return [];
  const groups = [];
  for (const [title, arr] of Object.entries(lists)) {
    const hasObjects = Array.isArray(arr) && arr.some((x) => x && typeof x === "object");
    const items = hasObjects ? normalizeAdditionalItems(arr) : normalizeStringArray(arr);
    groups.push({ title, items });
  }
  return groups;
}

function normalizeSuggestedTools(tools) {
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
      steps: normalizeStringArray(s?.steps),
      requiredMaterials: normalizeStringArray(s?.requiredMaterials),
      procedure: normalizeStringArray(s?.procedure),
      suggestedTools: normalizeSuggestedTools(s?.suggestedTools),
      lists: normalizeListsObject(s?.lists),
      ...("image" in (s || {}) ? { image: s.image } : {})
    };
  });
}

export function load({ params }) {
  // IMPORTANT: strip any encoded or literal fragment that accidentally ended up in the path
  const raw = params.family || "";
  const keyRaw = raw.split("%23")[0].split("#")[0];

  const hit = findFamilyInCatalog(keyRaw);
  if (!hit) throw error(404, `No product found for family "${keyRaw}"`);

  const f = hit.family;
  const d = f.details ?? {};
  const items = Array.isArray(f.items) ? f.items : [];

  const sizes = normalizeRows(items, items);

  let sizeGroups = null;
  if (Array.isArray(d.sizeGroups) && d.sizeGroups.length) {
    sizeGroups = d.sizeGroups
      .map((g, i) => ({
        key: g?.key || `group-${i + 1}`,
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
      sizeGroups = Array.from(map, ([title, rows], i) => ({
        key: `group-${i + 1}`,
        title,
        image: "",
        notes: [],
        rows
      }));
    }
  }

  const mpNotes = normalizeMpNoteArray(d.mpNote);
  const sections = normalizeSections(d.sections);
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
      sections
    }
  };
}
