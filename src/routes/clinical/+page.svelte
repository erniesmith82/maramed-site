<script>
  
  import { fade, fly, scale } from "svelte/transition";
  import { onMount } from "svelte";
  import studiesData from "$lib/data/studies.json";

  // mount gate
  let mounted = false;
  onMount(() => requestAnimationFrame(() => (mounted = true)));

  // motion config
  const isReduced =
    typeof matchMedia !== "undefined" &&
    matchMedia("(prefers-reduced-motion: reduce)").matches;
  const DUR_MULT = 3;
  const DELAY_MULT = 1;
  const T = (ms) => (isReduced ? 0 : Math.round(ms * DUR_MULT));
  const D = (ms) => (isReduced ? 0 : Math.round(ms * DELAY_MULT));
  const sx = (i) => [-12, 10, -8, 8, -6][i % 5];
  const sy = (i) => [10, 8, 12, 9, 11][i % 5];

  // meta
  const canonical = "/clinical";
  const author = "Maramed Medical";
  const published = "Updated September 2025";

  // list
  const studies = (studiesData ?? []).map((s) => ({
    slug: s.slug,
    title: s.title || s?.name || "",
    source: s.subtitle || s.description || "",
    date: s.published || s.year || ""
  }));
</script>

<svelte:head>
  <title>Clinical Studies — Maramed</title>
  <meta name="description" content="Key literature supporting functional fracture bracing approaches." />
  <link rel="canonical" href={canonical} />
  <meta property="og:title" content="Clinical Studies — Maramed" />
  <meta property="og:description" content="Key literature supporting functional fracture bracing approaches." />
  <meta property="og:type" content="website" />
</svelte:head>

<section class="relative isolate">
  <div class="absolute inset-0 -z-10 bg-cover bg-center" aria-hidden="true"></div>
  <div class="absolute inset-0 -z-10 bg-gradient-to-b from-emerald-800/90 via-emerald-700/70 to-emerald-600/60 -mt-10" aria-hidden="true"></div>

  <div class="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 pt-16 pb-14 sm:pt-20 sm:pb-20">
    {#if mounted}
      <div in:fade={{ duration: T(320) }}>
        <div class="mx-auto max-w-3xl text-center text-white" in:scale={{ duration: T(360), start: 0.985 }}>
          <p class="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] sm:text-xs font-medium ring-1 ring-white/20 backdrop-blur" in:fly={{ y: 10, duration: T(340), delay: D(40) }}>
            <span class="h-1.5 w-1.5 rounded-full bg-emerald-300"></span>
            Clinical Studies
          </p>

          <h1 class="mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight" in:fly={{ y: 12, duration: T(400), delay: D(110) }}>
            Clinical Studies
          </h1>

          <p class="mt-4 text-sm sm:text-base lg:text-lg text-white/90" in:fly={{ y: 10, duration: T(360), delay: D(200) }}>
            Key literature supporting functional fracture bracing approaches.
          </p>

          <p class="mt-3 text-xs text-white/80" in:fade={{ duration: T(240), delay: D(300) }}>
            {published} · {author}
          </p>
        </div>
      </div>
    {/if}
  </div>
</section>

<section class="relative w-full">
  <div class="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
    {#if mounted}
      <div class="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 sm:p-8" in:scale={{ duration: T(360), delay: D(60), start: 0.99 }}>
        <h2 class="text-3xl font-bold text-slate-900" in:fly={{ x: sx(0), y: sy(0), duration: T(300), delay: D(80) }}>
          Selected references
        </h2>

        {#if studies.length === 0}
          <p class="mt-3 text-slate-600">No studies found.</p>
        {:else}
          <ul class="mt-4 space-y-4">
            {#each studies as s, i}
              <li class="rounded-xl border border-slate-200/70 bg-slate-50/50 p-4 sm:p-5 hover:bg-slate-50 transition" in:fly={{ x: sx(i + 1), y: sy(i + 1), duration: T(320), delay: D(100 + i * 40) }}>
                <a href={`/clinical/${s.slug}`} class="block">
                  <p class="text-slate-900 font-semibold text-xl">{s.title}</p>
                  {#if s.source || s.date}
                    <p class="mt-1 text-slate-700">
                      {s.source}{s.source && s.date ? " — " : ""}{s.date}
                    </p>
                  {/if}
                </a>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    {/if}
  </div>
</section>
