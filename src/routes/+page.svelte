<script>
  
  export let data;
  const featured = data?.featured ?? [];

  // image visibility flags (hide on load error)
  let showBrandLogo = true;
  let showHero = true;

  // image path normalizer
  const imgSrc = (p) => (!p ? "" : (p.startsWith("/") ? p : `/images/${p}`));

  // animations
  import { fade, fly, scale } from "svelte/transition";
  import { onMount } from "svelte";

  // client-only mount gate (enables `in:` transitions)
  let mounted = false;
  onMount(() => {
    requestAnimationFrame(() => (mounted = true));
  });

  // motion helpers (respect reduced-motion)
  const isReduced =
    typeof matchMedia !== "undefined" &&
    matchMedia("(prefers-reduced-motion: reduce)").matches;

  // global timing knobs
  const DUR_MULT = 5;   // increase to slow durations
  const DELAY_MULT = 3; // increase to slow staggers

  const T = (ms) => (isReduced ? 0 : Math.round(ms * DUR_MULT));
  const D = (ms) => (isReduced ? 0 : Math.round(ms * DELAY_MULT));
</script>

<svelte:head>
  <!-- Primary Meta -->
  <title>Maramed | Orthotic Fabrication & CAD/CAM Experts in Miami</title>
  <meta
    name="description"
    content="Maramed provides high-quality orthotic fabrication, CAD/CAM milling, and vacuum forming services in Miami, Florida. Explore our full catalog of orthotic systems and materials."
  />
  <meta
    name="keywords"
    content="orthotics, central fabrication, CADCAM, vacuum forming, Miami, Maramed, orthotic fabrication, BioSculptor"
  />

  <!-- Open Graph / Social Media -->
  <meta property="og:title" content="Maramed | Orthotic Fabrication & CAD/CAM Experts in Miami" />
  <meta
    property="og:description"
    content="Explore Maramed’s full line of orthotic fabrication and CAD/CAM milling services, including precision vacuum forming and advanced orthopedic systems."
  />
  <meta property="og:image" content="/images/hero-maramed.jpg" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://www.maramed.com" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Maramed | Orthotic Fabrication & CAD/CAM Experts in Miami" />
  <meta
    name="twitter:description"
    content="High-quality orthotic fabrication and CAD/CAM services in Miami, Florida. Explore Maramed’s orthotic systems and materials."
  />
  <meta name="twitter:image" content="/images/hero-maramed.jpg" />

  <!-- Favicon / Identity -->
  <link rel="icon" type="image/png" href="/favicon.png" />
  <link rel="canonical" href="https://www.maramed.com" />
</svelte:head>

<!-- hero -->
<section class="relative bg-[url('/maramed_hero_bg.png')] bg-cover bg-top -mt-10">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
    <div class="grid lg:grid-cols-2 gap-10 items-center">
      {#if mounted}
        <div in:fade={{ duration: T(350) }}>
          <h1
            class="text-5xl sm:text-6xl font-extrabold tracking-tight text-white mb-4 text-center"
            in:fly={{ y: 12, duration: T(450), delay: D(40) }}
          >
            Prefabricated Orthoses <span class="text-slate-600">&amp; Fracture Braces</span> systems built for reliability.
          </h1>

          <p
            class="mt-4 text-lg text-slate-600 max-w-prose"
            in:fade={{ duration: T(400), delay: D(140) }}
          >
            Explore a modern, mobile-first catalog of materials, components, and shop essentials—
            with fast search and clear product detail pages.
          </p>

          <div
            class="mt-8 flex flex-wrap gap-3"
            in:fly={{ y: 10, duration: T(400), delay: D(220) }}
          >
            <a
              href="/catalog"
              class="inline-flex items-center rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-black"
            >
              Browse Catalog
            </a>
          </div>

          <p
            class="mt-4 text-sm text-slate-500"
            in:fade={{ duration: T(350), delay: D(320) }}
          >
            Serving clinics, labs, and fabrication shops nationwide.
          </p>
        </div>
      {/if}

      {#if mounted}
        <!-- media card -->
        <div class="relative" in:fade={{ duration: T(350), delay: D(120) }}>
          <div
            class="aspect-[16/10] w-full rounded-3xl border border-slate-200 overflow-hidden"
            in:scale={{ duration: T(450), delay: D(120), start: 0.96 }}
          >
            {#if showHero}
              <img
                src="/Maramed-catalog.jpg"
                alt="Catalog preview"
                class="h-full w-full object-cover will-change-transform"
                on:error={() => (showHero = false)}
              />
            {:else}
              <div class="h-full w-full grid place-items-center bg-slate-50 text-slate-400">
                Add a hero image at <code>/static/images/Maramed-catalog.jpg</code>
              </div>
            {/if}
          </div>
        </div>
      {/if}
    </div>
  </div>
</section>

<!-- featured products -->
<section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
  <div class="flex items-end justify-between gap-6"
       in:fade={{ duration: T(400), delay: D(40) }}>
    <h2 class="text-xl font-semibold">Featured products</h2>
    <a href="/catalog" class="text-sm font-medium text-slate-700 hover:text-slate-900">View all →</a>
  </div>

  <div class="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {#if featured.length}
      {#each featured as p, i (p.href)}
        {#if mounted}
          <!-- card -->
          <a
            href={p.href}
            class="group rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition will-change-transform"
            in:fly={{ y: 14, duration: T(420), delay: D(80 + i * 70) }}
          >
            <div class="aspect-[4/3] bg-slate-100 overflow-hidden">
              {#if p.img}
                <img
                  src={imgSrc(p.img)}
                  alt={p.name}
                  class="h-full w-full object-cover group-hover:scale-[1.03] transition"
                />
              {:else}
                <div class="h-full w-full grid place-items-center text-slate-400 text-sm">No image</div>
              {/if}
            </div>
            <div class="p-4">
              <div class="flex items-center justify-between">
                <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">{p.tag}</span>
                <span class="text-xs text-slate-400">{p.sku ? `SKU: ${p.sku}` : ""}</span>
              </div>
              <h3 class="mt-2 font-semibold text-slate-900">{p.name}</h3>
              <p class="mt-1 text-sm text-slate-600 overflow-hidden text-ellipsis [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical]">
                {p.desc}
              </p>
            </div>
          </a>
        {/if}
      {/each}
    {:else}
      <div class="rounded-xl border border-slate-200 p-6 text-slate-600"
           in:fade={{ duration: T(350), delay: D(80) }}>
        Featured items will appear here.
      </div>
    {/if}
  </div>
</section>

<!-- value props -->
<section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
  <div class="rounded-3xl border border-slate-200 p-6 sm:p-10"
       in:fade={{ duration: T(400), delay: D(40) }}>
    <h2 class="text-xl font-semibold">Why choose Maramed</h2>
    <div class="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {#each [
        {t:'Consistent quality', d:'Products tested and standardized for repeatable shop results.'},
        {t:'Fast, clear catalog', d:'Find SKUs and specs quickly with mobile-first design.'},
        {t:'Helpful support', d:'Questions on materials or fit-for-purpose? We’re here to help.'}
      ] as card, i}
        {#if mounted}
          <div class="rounded-2xl border border-slate-200 p-5"
               in:fly={{ y: 12, duration: T(380), delay: D(80 + i*90) }}>
            <p class="font-semibold">{card.t}</p>
            <p class="mt-2 text-sm text-slate-600">{card.d}</p>
          </div>
        {/if}
      {/each}
    </div>
  </div>
</section>

<!-- call to action -->
<section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
  {#if mounted}
    <div in:fade={{ duration: T(420), delay: D(60) }}>
      <div class="rounded-3xl border border-slate-200 p-6 sm:p-10 bg-slate-50"
           in:scale={{ duration: T(420), delay: D(60), start: 0.985 }}>
        <div class="grid lg:grid-cols-2 gap-6 items-center">
          <div in:fade={{ duration: T(380), delay: D(80) }}>
            <h3 class="text-2xl font-bold">Ready to place an order?</h3>
            <p class="mt-2 text-slate-600">Send us your part list or ask about product specs. We’ll get back fast.</p>
          </div>
          <div class="flex gap-3 lg:justify-end"
               in:fly={{ y: 10, duration: T(380), delay: D(150) }}>
            <a href="/contact" class="inline-flex items-center rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-black">
              Contact Sales
            </a>
            <a href="/catalog" class="inline-flex items-center rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-800 hover:bg-white">
              Browse Catalog
            </a>
          </div>
        </div>
      </div>
    </div>
  {/if}
</section>
