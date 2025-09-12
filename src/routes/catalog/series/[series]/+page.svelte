<script>
  export let data;
  const { seriesLabel, seriesDescription = "", families = [] } = data;

  const imgSrc = (p) => (!p ? "" : (p.startsWith("/") ? p : `/images/${p}`));
</script>

<section class="w-full mx-auto">
  <!-- Gradient header band -->
  <div class="w-[75%] mx-auto border-b border-emerald-800
              bg-gradient-to-b from-emerald-700/95 to-emerald-600/90
              dark:from-emerald-900/95 dark:to-emerald-800/90 text-white">
    <div class="max-w-5xl mx-auto px-4 py-8 justify-items-center">
      <h1 class="text-5xl font-bold mb-15">{seriesLabel}</h1>
      {#if seriesDescription}
        <p class="mt-3 max-w-3xl text-emerald-50/90 ml-25">{seriesDescription}</p>
      {/if}
    </div>
  </div>

  <!-- Content -->
  <div class="w-[75%] mx-auto px-4 py-8 justify-items-center">
    {#if families.length}
     <div class="w-[75%] mx-auto grid grid-cols-1 sm:grid-cols-2  gap-6 place-items-center">
        {#each families as fam}
          <a
            href={`/catalog/${encodeURIComponent(fam.family)}`}
            class="block rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-lg transition"
          >
            {#if fam.image}
              <img
                src={imgSrc(fam.image)}
                alt={fam.title}
                class="h-40 w-full object-contain mb-3 rounded bg-slate-50"
                loading="lazy"
              />
            {/if}
            <h2 class="text-lg font-semibold">{fam.title}</h2>
            <span class="mt-2 inline-block rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
              {fam.count} {fam.count === 1 ? 'item' : 'items'}
            </span>
          </a>
        {/each}
      </div>
    {:else}
      <div class="rounded-lg border border-slate-200 bg-white p-6 text-slate-600">
        No families found in <span class="font-semibold">{seriesLabel}</span>.
      </div>
    {/if}
  </div>
</section>
