// src/routes/catalog/[series]/+page.js

import catalog from '$lib/data/products.json';
import { error } from '@sveltejs/kit';

// helpers
const toCard = (f = {}) => ({
  family: f.key ?? '',
  title: f.title ?? f.key ?? '',
  image: f.image ?? ''
});

// load
export function load({ params }) {
  const slug = decodeURIComponent(params.series);
  const series = (catalog.series ?? []).find((s) => s.slug === slug);
  if (!series) throw error(404, `Series not found: "${slug}"`);

  // data: family dictionary
  let dict = catalog.families ?? null;
  if (!dict) {
    dict = {};
    for (const s of catalog.series ?? []) {
      for (const f of s.families ?? []) {
        if (f?.key) dict[f.key] = f;
      }
    }
  }

  // data: resolve by keys
  const byKeys = (keys = []) =>
    keys
      .map((k) => (dict[k] ? toCard(dict[k]) : toCard({ key: k })))
      .filter((c) => c.family);

  // result containers
  let families = [];
  let familyGroups = null;

  // resolve groups / lists
  if (Array.isArray(series.familyGroups) && series.familyGroups.length) {
    familyGroups = series.familyGroups.map((g) => ({
      title: g?.title || '',
      description: g?.description || '',
      families: byKeys(g?.familyKeys || [])
    }));

    // flatten (dedupe)
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
    families = byKeys(series.familyKeys);
  } else if (Array.isArray(series.families) && series.families.length) {
    families = series.families.map(toCard);
  } else {
    families = [];
  }

  // return
  return {
    seriesLabel: series.label ?? slug,
    seriesDescription: series.description ?? '',
    features: series.features ?? [],
    families,     // flat list
    familyGroups  // optional grouped data
  };
}
