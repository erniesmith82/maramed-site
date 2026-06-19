<!-- src/routes/news/sky-medical-now-available/+page.svelte -->
<script>
  import { fade, fly, scale } from "svelte/transition";
  import { onMount } from "svelte";

  let mounted = false;
  onMount(() => requestAnimationFrame(() => (mounted = true)));

  const isReduced =
    typeof matchMedia !== "undefined" &&
    matchMedia("(prefers-reduced-motion: reduce)").matches;

  const DUR_MULT = 3;
  const DELAY_MULT = 1;
  const T = (ms) => (isReduced ? 0 : Math.round(ms * DUR_MULT));
  const D = (ms) => (isReduced ? 0 : Math.round(ms * DELAY_MULT));

  const sx = (i) => [-12, 10, -8, 8, -6][i % 5];
  const sy = (i) => [10, 8, 12, 9, 11][i % 5];

  const published = "September 20, 2025";
  const author = "Maramed Medical";
  const canonical = "/news/sky-medical-now-available";
</script>

<svelte:head>
  <title>Maramed Acquires Sky Medical in 2025 — Maramed News</title>
  <meta
    name="description"
    content="Maramed acquired Sky Medical in 2025, expanding its orthopedic product offering and strengthening support for healthcare providers nationwide."
  />
  <link rel="canonical" href={canonical} />
  <meta property="og:title" content="Maramed Acquires Sky Medical in 2025" />
  <meta
    property="og:description"
    content="Maramed acquired Sky Medical in 2025, expanding its orthopedic product offering and customer support capabilities."
  />
  <meta property="og:type" content="article" />
  <meta property="article:published_time" content="2025-09-20" />
</svelte:head>

<!-- HERO -->
<section class="relative isolate">
  <div class="absolute inset-0 -z-10 bg-cover bg-center"></div>

  <div
    class="absolute inset-0 -z-10 bg-emerald-800/85 -mt-10"
    aria-hidden="true"
  ></div>

  <div
    class="absolute inset-0 -z-10 ring-1 ring-inset ring-black/10 -mt-10"
    aria-hidden="true"
  ></div>

  <div class="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 pt-16 pb-14 sm:pt-20 sm:pb-20">
    {#if mounted}
      <div in:fade={{ duration: T(320) }}>
        <div
          class="mx-auto max-w-3xl text-center text-white"
          in:scale={{ duration: T(360), start: 0.985 }}
        >
          <p
            class="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] sm:text-xs font-medium ring-1 ring-white/20 backdrop-blur"
            in:fly={{ y: 10, duration: T(340), delay: D(40) }}
          >
            <span class="h-1.5 w-1.5 rounded-full bg-emerald-300"></span>
            News &amp; Updates
          </p>

          <h1
            class="mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight"
            in:fly={{ y: 12, duration: T(400), delay: D(110) }}
          >
            Maramed Acquires Sky Medical in 2025
          </h1>

          <p
            class="mt-4 text-sm sm:text-base lg:text-lg text-white/90"
            in:fly={{ y: 10, duration: T(360), delay: D(200) }}
          >
            In 2025, Maramed proudly acquired Sky Medical as part of our continued commitment to providing high-quality orthopedic and rehabilitation solutions to practitioners nationwide. This acquisition expands Maramed’s product portfolio by incorporating Sky Medical’s trusted line of fracture orthoses, ankle-foot orthoses, and related orthopedic products. By bringing these product lines under the Maramed umbrella, customers benefit from a streamlined ordering process, enhanced inventory availability, responsive customer support, and the same reliable service that healthcare professionals have come to expect from Maramed. We are excited to continue supporting existing Sky Medical customers while introducing these products to new providers through our growing distribution network.
          </p>

          <div
            class="mt-6 flex items-center justify-center gap-3"
            in:fade={{ duration: T(260), delay: D(260) }}
          >
            <a
              href="/ordering"
              class="inline-flex items-center rounded-xl bg-white/95 text-slate-900 px-5 py-3 font-semibold hover:bg-white"
            >
              Order Now
            </a>
            <a
              href="/catalog/SM-GROUPED"
              class="inline-flex items-center rounded-xl border border-white/70 text-white px-5 py-3 font-semibold hover:bg-white/10"
            >
              Sky Medical Products
            </a>
          </div>

          <p class="mt-3 text-xs text-white/80" in:fade={{ duration: T(240), delay: D(300) }}>
            {published} · {author}
          </p>
        </div>
      </div>
    {/if}
  </div>
</section>

<!-- WHAT'S CHANGING -->
<section class="relative w-full">
  <div class="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
    {#if mounted}
      <div
        class="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 sm:p-8"
        in:scale={{ duration: T(360), delay: D(60), start: 0.99 }}
      >
        <h2
          class="text-2xl font-bold text-slate-900"
          in:fly={{ x: sx(0), y: sy(0), duration: T(300), delay: D(80) }}
        >
          What’s changing
        </h2>

        <p class="mt-2 text-slate-700" in:fade={{ duration: T(260), delay: D(110) }}>
          Following the acquisition of Sky Medical in 2025, Maramed has integrated select Sky Medical product families into its catalog and distribution network. Healthcare providers can now purchase these products directly through Maramed, benefiting from consolidated ordering, billing, fulfillment, and customer service. Existing Sky Medical customers will continue to have access to the products they know and trust, while gaining the advantages of Maramed’s expanded inventory, efficient logistics, and dedicated customer support team based in Miami, Florida. This transition reflects Maramed’s ongoing investment in delivering comprehensive orthopedic solutions and strengthening relationships with practitioners throughout the United States and international markets.
        </p>
      </div>
    {/if}
  </div>
</section>