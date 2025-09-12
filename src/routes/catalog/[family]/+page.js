// src/routes/catalog/[family]/+page.js
import catalog from "$lib/data/products.json";
import { error } from "@sveltejs/kit";

const norm = (s = "") => decodeURIComponent(s).toUpperCase();

function findFamilyInCatalog(familyKey) {
  for (const s of catalog.series ?? []) {
    const fam = (s.families ?? []).find(f => (f.key || "").toUpperCase() === familyKey);
    if (fam) return { series: s, family: fam };
  }
  return null;
}

export function load({ params }) {
  const key = norm(params.family);
  const hit = findFamilyInCatalog(key);
  if (!hit) throw error(404, `No product found for family "${params.family}"`);

  const f = hit.family;
  const d = f.details ?? {};
  const sizes = (f.items ?? []).map(it => ({
    itemNumber: it.sku,
    size: it.size ?? "",
    side: it.side ?? "",
    mpDiameter: it.mpDiameter ?? ""
  }));

  return {
    family: f.key,
    details: {
      title: f.title ?? f.key,
      heroImage: f.image ?? d.heroImage ?? "",
      gallery: d.gallery ?? [],
      description: d.description ?? "",
      indications: d.indications ?? [],
      lcode: d.lcode ?? "",
      mpNote: d.mpNote ?? "M-P Diameter is width of hand",
      sizes
    }
  };
}
