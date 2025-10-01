<script>
  import { page } from "$app/stores";
  import { afterNavigate } from "$app/navigation";
  import { onMount } from "svelte";
  import catalog from "$lib/data/products.json";

  // animations
  import { fade, fly, scale } from "svelte/transition";

  // state
  let mounted = false;
  onMount(() => requestAnimationFrame(() => (mounted = true)));

  // motion config
  const isReduced =
    typeof matchMedia !== "undefined" &&
    matchMedia("(prefers-reduced-motion: reduce)").matches;

  const DUR_MULT = 5;
  const DELAY_MULT = 3;
  const T = (ms) => (isReduced ? 0 : Math.round(ms * DUR_MULT));
  const D = (ms) => (isReduced ? 0 : Math.round(ms * DELAY_MULT));

  // motion helpers
  const sx = (i) => [-16, 12, -10, 14, -8][i % 5];
  const sy = (i) => [10, 8, 12, 9, 11][i % 5];

  // data: tabs and counts
  const TABS = (catalog.series ?? []).map((s) => ({ label: s.label, slug: s.slug }));
  const countsBySeries = new Map(
    (catalog.series ?? []).map((s) => [s.slug, (s.families ?? []).length])
  );

  // routing
  $: currentSeriesSlug = $page.params?.series ?? "";

  const deriveSlugFrom = (url) => {
    try {
      const parts = url.pathname.split("/");
      return parts[3] || "";
    } catch {
      return "";
    }
  };

  onMount(() => {
    if (!currentSeriesSlug) currentSeriesSlug = deriveSlugFrom(new URL(window.location.href));
  });

  afterNavigate(({ to }) => {
    const slug = deriveSlugFrom(to?.url ?? new URL(window.location.href));
    if (slug !== currentSeriesSlug) currentSeriesSlug = slug;
  });

  // ui
  let sidebarOpen = false;
</script>

<!-- layout -->
<section
  class="min-h-screen flex -mt-4 md:-mt-7"
  style="--nav-h-mobile:64px; --nav-h-desktop:64px; --footer-h:80px;"
>
  {#if sidebarOpen}
    <!-- overlay -->
     <div
    class="md:hidden fixed left-0 right-0 z-40 bg-black/40"
    style="top: var(--nav-h-mobile); bottom: 0;"
    on:click={() => (sidebarOpen = false)}
    aria-hidden="true"
    transition:fade={{ duration: T(120) }}
  ></div>
  {/if}

  {#if sidebarOpen}
    <!-- sidebar: mobile drawer -->
    <aside
      class="md:hidden fixed left-0 z-50 w-60 p-4 border-r
             bg-gradient-to-b from-emerald-700 to-emerald-600
             dark:from-emerald-900 dark:to-emerald-800
             border-emerald-800 dark:border-emerald-900 text-white
             shadow-lg"
      style="top: var(--nav-h-mobile); height: calc(100vh - var(--nav-h-mobile));"
      aria-label="Catalog menu"
      transition:fly={{ x: -280, duration: T(220) }}
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

      <!-- nav: series list (mobile) -->
      <nav class="flex flex-col gap-2">
        {#each TABS as tab, i}
          <a href={`/catalog/series/${tab.slug}`} data-sveltekit-preload-data 
            class={`flex items-center gap-2 w-full border-l-4 px-3 py-2 text-sm rounded transition
              ${
                currentSeriesSlug === tab.slug
                  ? "border-white text-white bg-white/10 font-semibold"
                  : "border-transparent text-emerald-50/90 hover:text-white hover:bg-white/10 hover:border-white/40"
              }`}
            aria-current={currentSeriesSlug === tab.slug ? "page" : undefined}
            on:click={() => (sidebarOpen = false)}
            in:fly={{ x: sx(i), y: sy(i), duration: T(260), delay: D(40 + i * 36) }}
          >
            <span class="flex-1 break-words">{tab.label}</span>
          </a>
        {/each}
      </nav>
    </aside>
  {/if}

  <!-- sidebar: desktop spacer -->
  <div class="hidden md:block w-60 lg:w-72 flex-none"></div>

  {#if mounted}
    <!-- sidebar: desktop fixed -->
    <div
      class="hidden md:block fixed left-0 z-30 mt-6 -mb-7"
      style="top: var(--nav-h-desktop); bottom: var(--footer-h);"
      in:fade={{ duration: T(240) }}
    >
      <aside
        class="h-full w-60 lg:w-72 p-4 border-r
               bg-gradient-to-b from-emerald-700 to-emerald-600
               dark:from-emerald-900 dark:to-emerald-800
               border-emerald-800 dark:border-emerald-900 text-white
               overflow-y-auto"
        in:scale={{ duration: T(320), start: 0.985 }}
        aria-label="Catalog series tabs"
      >
        <!-- nav: series list (desktop) -->
        <nav class="flex flex-col gap-2">
          {#each TABS as tab, i}
  <a
    href={`/catalog/series/${tab.slug}`}
    data-sveltekit-preload-data
    class={`flex items-center gap-2 min-w-0 w-full border-l-4 px-3 py-2 text-sm rounded transition
            ${
              currentSeriesSlug === tab.slug
                ? "border-white text-white bg-white/10 font-semibold"
                : "border-transparent text-emerald-50/90 hover:text-white hover:bg-white/10 hover:border-white/40"
            }`}
    aria-current={currentSeriesSlug === tab.slug ? "page" : undefined}
    aria-label={`Open ${tab.label}`}
    in:fly={{ x: sx(i), y: sy(i), duration: T(260), delay: D(60 + i * 34) }}
  >
    <span class="flex-1 break-words whitespace-normal leading-snug">{tab.label}</span>
  </a>
{/each}
        </nav>
      </aside>
    </div>
  {/if}

  <!-- main -->
  <main class="flex-1 p-6 overflow-y-auto md:pt-6">
    <!-- mobile trigger -->
    <div class="md:hidden mb-4" in:fade={{ duration: T(220), delay: D(60) }}>
      <button
        class="inline-flex items-center gap-2 rounded-lg border border-emerald-600
               bg-emerald-700 text-white px-3 py-2 text-sm
               hover:bg-emerald-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        on:click={() => (sidebarOpen = true)}
        aria-controls="mobile-catalog-drawer"
        aria-expanded={sidebarOpen}
        aria-label="Open catalog menu"
        in:fly={{ x: 8, y: 10, duration: T(260), delay: D(80) }}
      >
        <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
        Catalog Menu
      </button>
    </div>

    <!-- content -->
    {#if mounted}
      <div in:fade={{ duration: T(280), delay: D(80) }}>
        <div in:fly={{ x: 10, y: 12, duration: T(360), delay: D(120) }}>
          <div in:scale={{ duration: T(320), delay: D(140), start: 0.992 }}>
            <slot />
          </div>
        </div>
      </div>
    {/if}
  </main>
</section>
