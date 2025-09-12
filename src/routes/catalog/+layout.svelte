<!-- src/routes/catalog/+layout.svelte -->
<script>
  import { page } from "$app/stores";
  import catalog from "$lib/data/products.json";

  const TABS = (catalog.series ?? []).map(s => ({ label: s.label, slug: s.slug }));
  const countsBySeries = new Map(
    (catalog.series ?? []).map(s => [s.slug, (s.families ?? []).length])
  );
  $: currentSeriesSlug = $page.url.pathname.split("/")[3] || "";
</script>

<section class="min-h-screen flex -mt-4 md:-mt-11">
  <!-- Sidebar (green gradient, full-height) -->
  <aside
    class="w-60 md:w-72 p-4 border-r
           bg-gradient-to-b from-emerald-700 to-emerald-600
           dark:from-emerald-900 dark:to-emerald-800
           border-emerald-800 dark:border-emerald-900
           text-white sticky top-0 self-start h-screen"
  >
    <nav class="flex flex-col gap-2" aria-label="Catalog series tabs">
      {#each TABS as tab}
        <a
          href={`/catalog/series/${tab.slug}`}
          class={`flex items-center gap-2 min-w-0 w-full border-l-4 px-3 py-2 text-sm rounded transition
                  ${currentSeriesSlug === tab.slug
                    ? "border-white text-white bg-white/10 font-semibold"
                    : "border-transparent text-emerald-50/90 hover:text-white hover:bg-white/10 hover:border-white/40"}`}
          aria-label={`Open ${tab.label}`}
        >
          <span class="flex-1 break-words whitespace-normal leading-snug">{tab.label}</span>
          <span class="shrink-0 rounded bg-white/20 px-1.5 py-0.5 text-[11px] text-white tabular-nums">
            {countsBySeries.get(tab.slug) ?? 0}
          </span>
        </a>
      {/each}
    </nav>
  </aside>

  <!-- Main panel -->
  <main class="flex-1 p-6 overflow-y-auto">
    <slot />
  </main>
</section>

<style>
  .hyphens-auto { hyphens: auto; }
</style>
