<script>
  export let data;

  // ✅ Reactive destructuring: re-runs whenever `data` changes
  $: ({
    seriesLabel,
    seriesDescription = "",
    families = [],
    features = []
  } = data ?? {});

  const imgSrc = (p) => (!p ? "" : (p.startsWith("/") ? p : `/images/${p}`));

  /* ---------- animations (same pattern as landing page) ---------- */
  import { fade, fly, scale } from "svelte/transition";
  import { onMount } from "svelte";

  // run intros only on client (prevents SSR hydration warnings)
  let mounted = false;
  onMount(() => requestAnimationFrame(() => (mounted = true)));

  const isReduced =
    typeof matchMedia !== "undefined" &&
    matchMedia("(prefers-reduced-motion: reduce)").matches;

  // tune globally if you want everything slower/faster
  const DUR_MULT = 1;
  const DELAY_MULT = 1;
  const T = (ms) => (isReduced ? 0 : Math.round(ms * DUR_MULT));
  const D = (ms) => (isReduced ? 0 : Math.round(ms * DELAY_MULT));

  // tiny offsets to give a “scattered” feel
  const sx = (i) => ((i % 3) - 1) * 6; // -6 / 0 / 6
  const sy = (i) => (i % 2 ? 12 : 8);

  // 👇 Centering logic for a single card
  $: isSingle = Array.isArray(families) && families.length === 1;
</script>

<section class="w-full mx-auto">
  <!-- Gradient header band -->
  <div
    class="mx-auto w-full lg:w-[75%] border-b border-emerald-800
           bg-gradient-to-b from-emerald-700/95 to-emerald-600/90
           dark:from-emerald-900/95 dark:to-emerald-800/90 text-white"
  >
    {#if mounted}
      <div in:fade={{ duration: T(320) }}>
        <div class="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 text-center"
             in:scale={{ duration: T(360), start: 0.985 }}>
          <h1 class="font-bold tracking-tight text-3xl sm:text-4xl lg:text-5xl lg:mb-15 drop-shadow-sm"
              in:fly={{ y: 12, duration: T(420), delay: D(40) }}>
            {seriesLabel}
          </h1>

          {#if seriesDescription}
            <p class="mt-3 max-w-3xl mx-auto text-emerald-50/90 text-base sm:text-lg leading-relaxed"
               in:fade={{ duration: T(360), delay: D(120) }}>
              {seriesDescription}
            </p>
          {/if}

          {#if features.length}
            <ul class="mt-6 max-w-3xl mx-auto text-left list-disc pl-6 space-y-2 text-emerald-50/90 text-base sm:text-lg"
                in:fade={{ duration: T(320), delay: D(160) }}>
              {#each features as feature, i (i)}
                <li in:fly={{ y: 8, duration: T(300), delay: D(200 + i * 60) }}>
                  {feature}
                </li>
              {/each}
            </ul>
          {/if}
        </div>
      </div>
    {/if}
  </div>

  <!-- Content; key block forces remount on series change -->
  {#key seriesLabel}
    <div class="mx-auto w-full lg:w-[75%] px-4 py-6 sm:py-8 text-center">
      {#if families.length}
        {#if mounted}
          <!-- 👇 Grid becomes 1-column & centered when only one item -->
          <div
            class={`grid gap-6 lg:gap-8 ${isSingle
              ? "grid-cols-1 place-items-center max-w-md mx-auto"
              : "grid-cols-1 sm:grid-cols-2 place-items-center"}`}
            in:fade={{ duration: T(300), delay: D(60) }}
          >
            {#each families as fam, i (fam.family)}
              <a
                href={`/catalog/${encodeURIComponent(fam.family)}`}
                class={`group relative flex flex-col h-full rounded-xl border border-emerald-700/30
                        bg-gradient-to-b from-emerald-700/95 to-emerald-600/90
                        p-5 text-white shadow-sm transition will-change-transform
                        hover:shadow-xl hover:-translate-y-0.5
                        focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 text-center
                        overflow-hidden ${isSingle ? "w-full max-w-md" : ""}`}
                aria-label={`View ${fam.title}`}
                in:fly={{ x: sx(i), y: sy(i), duration: T(380), delay: D(80 + i * 70) }}
              >
                {#if fam.image}
                  <img
                    src={imgSrc(fam.image)}
                    alt={fam.title}
                    class="w-full h-40 sm:h-44 lg:h-48 object-contain mb-3 rounded bg-emerald-950/30
                           transition group-hover:scale-[1.02] motion-reduce:group-hover:scale-100"
                    loading="lazy"
                    decoding="async"
                  />
                {/if}

                <h2 class="text-lg sm:text-xl font-semibold tracking-tight">
                  {fam.title}
                </h2>

                <div class="mt-auto"></div>

                <span
                  class="pointer-events-none absolute left-0 right-0 bottom-0 h-0.5
                         bg-gradient-to-r from-transparent via-white/60 to-transparent
                         opacity-0 group-hover:opacity-100 transition"
                ></span>
              </a>
            {/each}
          </div>
        {/if}
      {:else}
        <div class="rounded-lg border border-slate-200 bg-white p-6 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          No families found in <span class="font-semibold">{seriesLabel}</span>.
        </div>
      {/if}
    </div>
  {/key}
</section>
