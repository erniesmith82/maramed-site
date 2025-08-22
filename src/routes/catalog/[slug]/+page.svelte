<script>
  export let data;
  const p = data.product;

  // JSON-LD for SEO (safe default brand)
  $: jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p?.name,
    brand: p?.brand || "Maramed",
    sku: p?.sku,
    category: p?.category,
    description: p?.description || "",
    image: p?.images?.[0]
  };
</script>

<svelte:head>
  <title>{p?.name} — {p?.brand || "Maramed"}</title>
  <meta name="description" content={p?.description ?? `${p?.name} (SKU ${p?.sku})`} />
  <script type="application/ld+json">
    {JSON.stringify(jsonLd)}
  </script>
</svelte:head>

<section class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
  <a href="/catalog" class="text-sm text-slate-600 hover:text-slate-900">← Back to catalog</a>

  <div class="mt-4 grid gap-8 lg:grid-cols-2">
    <!-- Gallery -->
    <div class="rounded-2xl border border-slate-200 overflow-hidden bg-white">
      <div class="aspect-[4/3] bg-slate-100">
        {#if p?.images?.length}
          <img src={p.images[0]} alt={p.name} class="h-full w-full object-cover" />
        {/if}
      </div>
      {#if p?.images?.length > 1}
        <div class="flex gap-2 p-3 bg-slate-50">
          {#each p.images.slice(1) as img}
            <img src={img} alt={`Thumb: ${p.name}`} class="h-16 w-20 object-cover rounded border border-slate-200" />
          {/each}
        </div>
      {/if}
    </div>

    <!-- Details -->
    <div class="flex flex-col items-center justify-center text-center">
      <h1 class="text-2xl font-bold">{p?.name}</h1>
      <p class="mt-2 text-sm text-slate-600">Brand: {p?.brand || "Maramed"} • SKU: {p?.sku}</p>
      <p class="mt-1 text-sm text-slate-600">
        Category: {p?.category}{#if p?.subcat} • {p.subcat}{/if}
      </p>

      {#if p?.description}
        <div class="prose prose-slate mt-6 max-w-none">
          <p>{p.description}</p>
        </div>
      {/if}

      <div class="mt-6 grid gap-3">
        <a
          href={"/contact?subject=" + encodeURIComponent("Quote Request: " + p.name)}
          class="inline-flex items-center rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-black"
        >
          Request a Quote
        </a>
        <a
          href={"/contact?subject=" + encodeURIComponent("Question: " + p.name)}
          class="inline-flex items-center rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-800 hover:bg-slate-50"
        >
          Ask a Question
        </a>
      </div>
    </div>
  </div>
</section>
