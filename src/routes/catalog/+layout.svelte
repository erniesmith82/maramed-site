<!-- src/routes/catalog/+layout.svelte -->
<script>
  import { page } from "$app/stores";
  import catalog from "$lib/data/products.json";

  const TABS = (catalog.series ?? []).map((s) => ({ label: s.label, slug: s.slug }));
  const countsBySeries = new Map(
    (catalog.series ?? []).map((s) => [s.slug, (s.families ?? []).length])
  );

  $: currentSeriesSlug = $page.url.pathname.split("/")[3] || "";
  let sidebarOpen = false;
</script>

<!-- Tune these to your actual navbar/footer heights -->
<section
  class="min-h-screen flex -mt-4 md:-mt-7"
  style="--nav-h-mobile:64px; --nav-h-desktop:64px; --footer-h:80px;"
>
  {#if sidebarOpen}
    <!-- Mobile backdrop (below navbar) -->
    <div
      class="md:hidden fixed left-0 right-0 z-40 bg-black/40"
      style="top: var(--nav-h-mobile); bottom: 0;"
      on:click={() => (sidebarOpen = false)}
      aria-hidden="true"
    />
  {/if}

  <!-- Mobile drawer (below navbar) -->
  <aside
    class="md:hidden fixed left-0 z-50 w-60 p-4 border-r
           bg-gradient-to-b from-emerald-700 to-emerald-600
           dark:from-emerald-900 dark:to-emerald-800
           border-emerald-800 dark:border-emerald-900 text-white
           transition-transform duration-200 ease-out"
    style="top: var(--nav-h-mobile); height: calc(100vh - var(--nav-h-mobile));
           transform: translateX({sidebarOpen ? '0' : '-100%'});"
    aria-label="Catalog menu"
  >
    <div class="flex items-center justify-between mb-2">
      <h2 class="text-base font-semibold">Catalog</h2>
      <button
        class="rounded px-2 py-1 bg-white/10 hover:bg-white/20"
        on:click={() => (sidebarOpen = false)}
        aria-label="Close menu"
      >
        ✕
      </button>
    </div>

    <nav class="flex flex-col gap-2">
      {#each TABS as tab}
        <a
          href={`/catalog/series/${tab.slug}`}
          class={`flex items-center gap-2 w-full border-l-4 px-3 py-2 text-sm rounded transition
            ${
              currentSeriesSlug === tab.slug
                ? "border-white text-white bg-white/10 font-semibold"
                : "border-transparent text-emerald-50/90 hover:text-white hover:bg-white/10 hover:border-white/40"
            }`}
          on:click={() => (sidebarOpen = false)}
        >
          <span class="flex-1 break-words">{tab.label}</span>
          <span class="shrink-0 rounded bg-white/20 px-1.5 py-0.5 text-[11px] tabular-nums">
            {countsBySeries.get(tab.slug) ?? 0}
          </span>
        </a>
      {/each}
    </nav>
  </aside>

  <!-- DESKTOP SIDEBAR: fixed + spacer keeps it truly stationary -->
  <!-- Spacer (keeps layout flow so main doesn't shift) -->
  <div class="hidden md:block w-60 lg:w-72 flex-none"></div>

  <!-- Fixed sidebar (under navbar, above footer) -->
  <aside
    class="hidden md:block fixed left-0 z-30
           w-60 lg:w-72 lg:mt-6 p-4 border-r
           bg-gradient-to-b from-emerald-700 to-emerald-600
           dark:from-emerald-900 dark:to-emerald-800
           border-emerald-800 dark:border-emerald-900 text-white
           overflow-y-auto"
    style="top: var(--nav-h-desktop); bottom: var(--footer-h);"
  >
    <nav class="flex flex-col gap-2" aria-label="Catalog series tabs">
      {#each TABS as tab}
        <a
          href={`/catalog/series/${tab.slug}`}
          class={`flex items-center gap-2 min-w-0 w-full border-l-4 px-3 py-2 text-sm rounded transition
                  ${
                    currentSeriesSlug === tab.slug
                      ? "border-white text-white bg-white/10 font-semibold"
                      : "border-transparent text-emerald-50/90 hover:text-white hover:bg-white/10 hover:border-white/40"
                  }`}
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

  <!-- MAIN -->
  <main class="flex-1 p-6 overflow-y-auto md:pt-6">
    <!-- Mobile trigger button -->
    <div class="md:hidden mb-4">
      <button
        class="inline-flex items-center gap-2 rounded-lg border border-emerald-600
               bg-emerald-700 text-white px-3 py-2 text-sm
               hover:bg-emerald-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        on:click={() => (sidebarOpen = true)}
        aria-controls="mobile-catalog-drawer"
        aria-expanded={sidebarOpen}
        aria-label="Open catalog menu"
      >
        <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2"
             viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
        Catalog Menu
      </button>
    </div>

    <slot />
  </main>
</section>

<style>
  .hyphens-auto { hyphens: auto; }
</style>
