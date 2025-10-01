import { error } from "@sveltejs/kit";
import studies from "$lib/data/studies.json" assert { type: "json" };

export function load({ params }) {
  const list = Array.isArray(studies) ? studies : [];
  const idx = list.findIndex((s) => s.slug === params.slug);
  if (idx === -1) throw error(404, "Study not found");

  const study = list[idx];
  const prev =
    idx > 0 ? { slug: list[idx - 1].slug, title: list[idx - 1].title } : null;
  const next =
    idx < list.length - 1
      ? { slug: list[idx + 1].slug, title: list[idx + 1].title }
      : null;

  return { study, prev, next };
}
