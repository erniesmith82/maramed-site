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

  let dict = catalog.families ?? null;
  if (!dict) {
    dict = {};
    for (const s of catalog.series ?? []) {
      for (const f of s.families ?? []) {
        if (f?.key) dict[f.key] = f;
      }
    }
  }

  // Index sizeGroups by key → { familyKey, groupKey, title, image }
  const groupIndex = {};
  for (const [famKey, famVal] of Object.entries(dict)) {
    const groups = famVal?.details?.sizeGroups ?? [];
    for (const g of groups) {
      const gkey = g?.key;
      if (!gkey) continue;
      groupIndex[gkey] = {
        familyKey: famKey,
        groupKey: gkey,
        title: g.title || famVal.title || famKey,
        image: g.image || famVal.image || ''
      };
    }
  }

  const resolveKey = (kRaw = '') => {
    const k = String(kRaw || '').trim();
    if (!k) return null;

    // Case 1: anchored family "FAM#group"
    if (k.includes('#')) {
      const [famKey, anchor] = k.split('#');
      const fam = dict[famKey];
      if (!fam) return null;
      const gInfo = (fam?.details?.sizeGroups ?? []).find((g) => g.key === anchor);
      const title = gInfo?.title || fam.title || famKey;
      const image = gInfo?.image || fam.image || '';
      return { family: `${famKey}#${anchor}`, title, image };
    }

    // Case 2: exact family key
    if (dict[k]) {
      const fam = dict[k];
      return { family: fam.key, title: fam.title || fam.key, image: fam.image || '' };
    }

    // Case 3: group key (redirect to its family with anchor)
    if (groupIndex[k]) {
      const { familyKey, groupKey, title, image } = groupIndex[k];
      return { family: `${familyKey}#${groupKey}`, title, image };
    }

    return null;
  };

  const toCardResolved = (keyOrFam) => {
    if (!keyOrFam) return null;
    const res = resolveKey(keyOrFam);
    if (res) return { family: res.family, title: res.title, image: res.image };
    // Fallback: unknown key still produces a card (so you can see it)
    return toCard({ key: keyOrFam });
  };

  const byKeys = (keys = []) =>
    keys
      .map((k) => toCardResolved(k))
      .filter((c) => c && c.family);

  let families = [];
  let familyGroups = null;

  if (Array.isArray(series.familyGroups) && series.familyGroups.length) {
    familyGroups = series.familyGroups.map((g) => ({
      title: g?.title || '',
      description: g?.description || '',
      families: byKeys(g?.familyKeys || [])
    }));

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

  return {
    seriesLabel: series.label ?? slug,
    seriesDescription: series.description ?? '',
    features: series.features ?? [],
    families,
    familyGroups
  };
}
