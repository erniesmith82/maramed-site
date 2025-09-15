<script>
  export let data;

  // Trust the loader: shaped from products.json
  const details = data?.details ?? {};

  const title       = details.title || "";
  const description = details.description || "";
  const lcode       = details.lcode || "";
  const indications = details.indications || [];
  const heroImage   = details.heroImage || "";
  const sizes       = details.sizes || [];
  const mpNote      = details.mpNote || "M-P Diameter is width of hand";

  // Optional: array of strings or objects { title/name/label?, sku? }
  const additionalItems = details.additionalItems || [];
</script>

<section class="w-full">
  <div class="max-w-6xl mx-auto px-4 py-8">
    {#if title}
      <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6 sm:mb-8
                 bg-gradient-to-r from-emerald-700 to-emerald-500 bg-clip-text text-transparent">
        {title}
      </h1>
    {/if}

    {#if description || lcode}
      {#if description}
        <p class="mt-2 text-slate-700 leading-relaxed text-base sm:text-lg mb-6 sm:mb-8">
          {description}
        </p>
      {/if}

      {#if lcode}
        <p class="mt-1 text-slate-700">
          <span class="inline-flex items-center gap-2 align-middle">
            <span class="font-semibold">Suggested L-Code:</span>
            <span class="inline-block rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200
                           px-2.5 py-0.5 text-sm font-semibold tracking-wide">
              {lcode}
            </span>
          </span>
        </p>
      {/if}
    {/if}

    {#if heroImage}
      <img
        src={heroImage}
        alt={title || "Product hero image"}
        class="mt-6 w-full max-h-[16rem] sm:max-h-[18rem] object-contain rounded-xl
               bg-slate-50 ring-1 ring-slate-200 shadow-sm
               transition will-change-transform hover:scale-[1.01]"
        loading="lazy"
        decoding="async"
      />
    {/if}
  </div>

  <div class="max-w-6xl mx-auto px-4 pb-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
    <article class="lg:col-span-2">
      {#if indications.length}
        <div class="rounded-2xl border w-[75%] border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="text-2xl sm:text-3xl font-semibold tracking-tight
                     text-slate-900 mb-3">
            Indications
          </h2>
          <ul class="mt-3 list-disc pl-5 space-y-2 text-slate-700">
            {#each indications as ind}<li>{ind}</li>{/each}
          </ul>
        </div>
      {/if}

      <!-- New: Additional Items -->
      <div class="rounded-2xl border w-[75%] border-slate-200 bg-white p-6 shadow-sm mt-8">
        <h2 class="text-2xl sm:text-3xl font-semibold tracking-tight
                   text-slate-900 mb-3">
          Additional Items
        </h2>
        {#if additionalItems.length}
          <ul class="mt-3 list-disc pl-5 space-y-2 text-slate-700">
            {#each additionalItems as item}
              {#if typeof item === 'string'}
                <li>{item}</li>
              {:else}
                <li>
                  <span class="font-medium">{item.title || item.name || item.label || item.sku}</span>
                  {#if item.sku}
                    <span class="ml-2 text-slate-500 font-mono text-sm align-middle">{item.sku}</span>
                  {/if}
                </li>
              {/if}
            {/each}
          </ul>
        {/if}
      </div>
    </article>

    {#if sizes.length}
      <aside class="lg:col-span-1">
        <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm
                    lg:sticky lg:top-6">
          <h2 class="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">
            Sizes
          </h2>
          <div class="mt-4 overflow-x-auto">
            <table class="min-w-full text-sm">
              <thead>
                <tr class="text-left text-slate-600 border-b border-slate-200">
                  <th class="py-2 pr-4 font-semibold">Item Number</th>
                  <th class="py-2 pr-4 font-semibold">Size</th>
                  <th class="py-2 pr-4 font-semibold">Side</th>
                  <th class="py-2 pr-0 font-semibold">M-P Diameter*</th>
                </tr>
              </thead>
              <tbody class="align-top">
                {#each sizes as row}
                  <tr class="border-b border-slate-100 hover:bg-slate-50 transition">
                    <td class="py-2 pr-4 font-mono text-slate-800">{row.itemNumber}</td>
                    <td class="py-2 pr-4">{row.size}</td>
                    <td class="py-2 pr-4">{row.side}</td>
                    <td class="py-2 pr-0">{row.mpDiameter}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
          <p class="mt-3 text-[13px] text-slate-500">* {mpNote}</p>
        </div>
      </aside>
    {/if}
  </div>
</section>

<style>
  ul { list-style-position: outside; }
</style>
