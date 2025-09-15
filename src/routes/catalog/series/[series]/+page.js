import catalog from "$lib/data/products.json"; // keep .json since you're using JSON
import { error } from "@sveltejs/kit";

export function load({ params }) {
  const seriesSlug = params.series;
  const series = catalog.series.find((s) => s.slug === seriesSlug);
  if (!series) throw error(404, `Series not found: ${seriesSlug}`);

  // Normalize families for the UI
  const families = (series.families ?? []).map((f) => ({
    family: f.key,                              // used in the link /catalog/[family]
    title: f.title,
    image: f.image || f.details?.heroImage || "",
    count: (f.items?.length ?? 0)
  }));

  return {
    seriesLabel: series.label,
    seriesDescription: series.description ?? "",
    features: series.features ?? [],            // 👈 forward features
    families
  };
}
