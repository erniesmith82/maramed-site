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
      <h1 class="text-5xl font-bold tracking-tight mb-8">{title}</h1>
    {/if}

    {#if description || lcode}
      {#if description}<p class="mt-3 text-slate-700 mb-8">{description}</p>{/if}
      {#if lcode}
        <p class="mt-1 text-slate-600">
          <span class="font-semibold">Suggested L-Code:</span> {lcode}
        </p>
      {/if}
    {/if}

    {#if heroImage}
      <img
        src={heroImage}
        alt={title || "Product hero image"}
        class="mt-6 w-full max-h-[14rem] object-contain rounded-lg bg-slate-50"
        loading="lazy"
      />
    {/if}
  </div>

  <div class="max-w-6xl mx-auto px-4 pb-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
    <article class="lg:col-span-2">
      {#if indications.length}
        <div class="rounded-xl border w-[75%] border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="text-3xl font-semibold">Indications</h2>
          <ul class="mt-3 list-disc pl-5 space-y-1 text-slate-700">
            {#each indications as ind}<li>{ind}</li>{/each}
          </ul>
        </div>
      {/if}

      <!-- New: Additional Items -->
      <div class="rounded-xl border w-[75%] border-slate-200 bg-white p-6 shadow-sm mt-8">
        <h2 class="text-3xl font-semibold">Additional Items</h2>
        {#if additionalItems.length}
          <ul class="mt-3 list-disc pl-5 space-y-1 text-slate-700">
            {#each additionalItems as item}
              {#if typeof item === 'string'}
                <li>{item}</li>
              {:else}
                <li>
                  <span>{item.title || item.name || item.label || item.sku}</span>
                  {#if item.sku}
                    <span class="ml-2 text-slate-500 font-mono">{item.sku}</span>
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
        <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 class="text-xl font-semibold">Sizes</h2>
          <div class="mt-4 overflow-x-auto">
            <table class="min-w-full text-sm">
              <thead>
                <tr class="text-left text-slate-600">
                  <th class="py-2 pr-4 font-semibold">Item Number</th>
                  <th class="py-2 pr-4 font-semibold">Size</th>
                  <th class="py-2 pr-4 font-semibold">Side</th>
                  <th class="py-2 pr-0 font-semibold">M-P Diameter*</th>
                </tr>
              </thead>
              <tbody class="align-top">
                {#each sizes as row}
                  <tr class="border-t border-slate-200">
                    <td class="py-2 pr-4 font-mono">{row.itemNumber}</td>
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
