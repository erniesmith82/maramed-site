<script>
  // demo data
  const featured = [
    {
      name: "Thermoform Sheet 4mm (PETG)",
      desc: "Impact-resistant PETG sheets designed for repeatable thermoforming.",
      sku: "PETG-4MM-001",
      img: "/images/petg.jpg",
      href: "/catalog/thermoform-sheet-4mm-petg",
      tag: "Orthotics"
    },
    {
      name: "Lamination Resin LR200",
      desc: "Medical-grade epoxy resin optimized for lightweight laminations.",
      sku: "RES-LR200",
      img: "/images/resin.jpg",
      href: "/catalog/lamination-resin-lr200",
      tag: "Prosthetics"
    },
    {
      name: "Vacuum Adapter Valve VX10",
      desc: "High-flow vacuum valve engineered for shop reliability.",
      sku: "VX10",
      img: "/images/valve.jpg",
      href: "/catalog/vacuum-adapter-valve-vx10",
      tag: "Fabrication"
    }
  ];

  // show/hide images when they fail to load
  let showBrandLogo = true;
  let showHero = true;
</script>

<svelte:head>
  <title>Maramed — Orthopedic Systems</title>
  <meta name="description" content="Modern orthopedic & prosthetic components and supplies. Explore the Maramed catalog." />
</svelte:head>

<!-- HERO -->
<section class="relative">
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
    <div class="grid lg:grid-cols-2 gap-10 items-center">
      <div>
        {#if showBrandLogo}
          <img
            src="/brand/maramed-logo-modern-sans.svg"
            alt="Maramed"
            class="h-10 w-auto mb-6 hidden sm:block"
            on:error={() => (showBrandLogo = false)}
          />
        {/if}

        <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight">
          Orthopedic <span class="text-slate-600">&amp; prosthetic</span> systems built for reliability.
        </h1>
        <p class="mt-4 text-lg text-slate-600 max-w-prose">
          Explore a modern, mobile-first catalog of materials, components, and shop essentials—
          with fast search and clear product detail pages.
        </p>

        <div class="mt-8 flex flex-wrap gap-3">
          <a href="/catalog" class="inline-flex items-center rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-black">
            Browse Catalog
          </a>
          <a href="/contact" class="inline-flex items-center rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-800 hover:bg-slate-50">
            Get a Quote
          </a>
        </div>

        <p class="mt-4 text-sm text-slate-500">
          Serving clinics, labs, and fabrication shops nationwide.
        </p>
      </div>

      <div class="relative">
        <div class="aspect-[16/10] w-full rounded-3xl border border-slate-200 overflow-hidden">
          {#if showHero}
            <img
              src="/images/hero-catalog.jpg"
              alt="Catalog preview"
              class="h-full w-full object-cover"
              on:error={() => (showHero = false)}
            />
          {:else}
            <div class="h-full w-full grid place-items-center bg-slate-50 text-slate-400">
              Add a hero image at <code>/static/images/hero-catalog.jpg</code>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
</section>

<!-- CATEGORIES -->
<section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-8">
  <h2 class="text-xl font-semibold">Shop by category</h2>
  <div class="mt-6 grid sm:grid-cols-3 gap-6">
    <a href="/catalog?cat=orthotics" class="rounded-2xl border border-slate-200 p-6 hover:shadow-md transition">
      <p class="font-semibold">Orthotics</p>
      <p class="text-sm text-slate-600 mt-1">Thermoform plastics, components, supplies.</p>
    </a>
    <a href="/catalog?cat=prosthetics" class="rounded-2xl border border-slate-200 p-6 hover:shadow-md transition">
      <p class="font-semibold">Prosthetics</p>
      <p class="text-sm text-slate-600 mt-1">Laminations, adapters, liners, accessories.</p>
    </a>
    <a href="/catalog?cat=fabrication" class="rounded-2xl border border-slate-200 p-6 hover:shadow-md transition">
      <p class="font-semibold">Fabrication</p>
      <p class="text-sm text-slate-600 mt-1">Valves, vacuum, shop tools and hardware.</p>
    </a>
  </div>
</section>

<!-- FEATURED PRODUCTS -->
<section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
  <div class="flex items-end justify-between gap-6">
    <h2 class="text-xl font-semibold">Featured products</h2>
    <a href="/catalog" class="text-sm font-medium text-slate-700 hover:text-slate-900">View all →</a>
  </div>

  <div class="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {#each featured as p}
      <a href={p.href} class="group rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition">
        <div class="aspect-[4/3] bg-slate-100 overflow-hidden">
          {#if p.img}
            <img src={p.img} alt={p.name} class="h-full w-full object-cover group-hover:scale-[1.03] transition" />
          {:else}
            <div class="h-full w-full grid place-items-center text-slate-400 text-sm">No image</div>
          {/if}
        </div>
        <div class="p-4">
          <div class="flex items-center justify-between">
            <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">{p.tag}</span>
            <span class="text-xs text-slate-400">SKU: {p.sku}</span>
          </div>
          <h3 class="mt-2 font-semibold text-slate-900">{p.name}</h3>
          <!-- 2-line clamp without plugin -->
          <p class="mt-1 text-sm text-slate-600 overflow-hidden text-ellipsis [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical]">
            {p.desc}
          </p>
        </div>
      </a>
    {/each}
  </div>
</section>

<!-- VALUE PROPS -->
<section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
  <div class="rounded-3xl border border-slate-200 p-6 sm:p-10">
    <h2 class="text-xl font-semibold">Why choose Maramed</h2>
    <div class="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <div class="rounded-2xl border border-slate-200 p-5">
        <p class="font-semibold">Consistent quality</p>
        <p class="mt-2 text-sm text-slate-600">Products tested and standardized for repeatable shop results.</p>
      </div>
      <div class="rounded-2xl border border-slate-200 p-5">
        <p class="font-semibold">Fast, clear catalog</p>
        <p class="mt-2 text-sm text-slate-600">Find SKUs and specs quickly with mobile-first design.</p>
      </div>
      <div class="rounded-2xl border border-slate-200 p-5">
        <p class="font-semibold">Helpful support</p>
        <p class="mt-2 text-sm text-slate-600">Questions on materials or fit-for-purpose? We’re here to help.</p>
      </div>
    </div>
  </div>
</section>

<!-- CTA -->
<section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20">
  <div class="rounded-3xl border border-slate-200 p-6 sm:p-10 bg-slate-50">
    <div class="grid lg:grid-cols-2 gap-6 items-center">
      <div>
        <h3 class="text-2xl font-bold">Ready to place an order?</h3>
        <p class="mt-2 text-slate-600">Send us your part list or ask about product specs. We’ll get back fast.</p>
      </div>
      <div class="flex gap-3 lg:justify-end">
        <a href="/contact" class="inline-flex items-center rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-black">
          Contact Sales
        </a>
        <a href="/catalog" class="inline-flex items-center rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-800 hover:bg-white">
          Browse Catalog
        </a>
      </div>
    </div>
  </div>
</section>
