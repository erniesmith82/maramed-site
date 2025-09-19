// src/routes/catalog/[series]/+page.js
import catalog from '$lib/data/products.json';
import { error } from '@sveltejs/kit';

const toCard = (f = {}) => ({
  family: f.key ?? '',
  title: f.title ?? f.key ?? '',
  image: f.image ?? ''
});

export function load({ params }) {
  const slug = decodeURIComponent(params.series);
  const series = (catalog.series ?? []).find((s) => s.slug === slug);
  if (!series) throw error(404, `Series not found: "${slug}"`);

  // Build a dictionary of all families (prefer top-level dict if present)
  let dict = catalog.families ?? null;
  if (!dict) {
    dict = {};
    for (const s of catalog.series ?? []) {
      for (const f of s.families ?? []) {
        if (f?.key) dict[f.key] = f;
      }
    }
  }

  const byKeys = (keys = []) =>
    keys
      .map((k) => (dict[k] ? toCard(dict[k]) : toCard({ key: k })))
      .filter((c) => c.family); // keep only valid cards

  let families = [];
  let familyGroups = null;

  if (Array.isArray(series.familyGroups) && series.familyGroups.length) {
    // Resolve grouped headings
    familyGroups = series.familyGroups.map((g) => ({
      title: g?.title || '',
      description: g?.description || '',
      families: byKeys(g?.familyKeys || [])
    }));

    // Flatten & de-duplicate for the existing grid
    const seen = new Set();
    const flat = [];
    for (const grp of familyGroups) {
      for (const card of grp.families) {
        if (!seen.has(card.family)) {
          seen.add(card.family);
          flat.push(card);
        }
      }
    }
    families = flat;
  } else if (Array.isArray(series.familyKeys) && series.familyKeys.length) {
    // Simple key list
    families = byKeys(series.familyKeys);
  } else if (Array.isArray(series.families) && series.families.length) {
    // Legacy inline families
    families = series.families.map(toCard);
  } else {
    families = [];
  }

  return {
    seriesLabel: series.label ?? slug,
    seriesDescription: series.description ?? '',
    features: series.features ?? [],
    families,        // flat list for current page (unchanged UI)
    familyGroups     // optional: render subgroup headings if you want
  };
}
