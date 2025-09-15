<script>
  export let data;
  const { seriesLabel, seriesDescription = "", families = [], features = [] } = data;

  const imgSrc = (p) => (!p ? "" : (p.startsWith("/") ? p : `/images/${p}`));
</script>

<section class="w-full mx-auto">
  <!-- Gradient header band -->
  <div
    class="mx-auto w-full lg:w-[75%] border-b border-emerald-800
           bg-gradient-to-b from-emerald-700/95 to-emerald-600/90
           dark:from-emerald-900/95 dark:to-emerald-800/90 text-white"
  >
    <div class="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 text-center">
      <h1 class="font-bold tracking-tight text-3xl sm:text-4xl lg:text-5xl lg:mb-15 drop-shadow-sm">
        {seriesLabel}
      </h1>

      {#if seriesDescription}
        <p
          class="mt-3 max-w-3xl mx-auto text-emerald-50/90 text-base sm:text-lg leading-relaxed"
        >
          {seriesDescription}
        </p>
      {/if}

      {#if features.length}
        <ul class="mt-6 max-w-3xl mx-auto text-left list-disc pl-6 space-y-2 text-emerald-50/90 text-base sm:text-lg">
          {#each features as feature}
            <li>{feature}</li>
          {/each}
        </ul>
      {/if}
    </div>
  </div>

  <!-- Content -->
  <div class="mx-auto w-full lg:w-[75%] px-4 py-6 sm:py-8 text-center">
    {#if families.length}
      <div
        class="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 place-items-center"
      >
        {#each families as fam}
          <a
            href={`/catalog/${encodeURIComponent(fam.family)}`}
            class="group relative flex flex-col h-full rounded-xl border border-emerald-700/30
                   bg-gradient-to-b from-emerald-700/95 to-emerald-600/90
                   p-5 text-white shadow-sm transition will-change-transform
                   hover:shadow-xl hover:-translate-y-0.5
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 text-center
                   overflow-hidden"
            aria-label={`View ${fam.title}`}
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

            <span
              class="mt-2 inline-block rounded-full bg-emerald-950/30 px-2.5 py-1 text-xs sm:text-sm text-emerald-100
                     ring-1 ring-emerald-500/40 group-hover:ring-emerald-300/70"
            >
              {fam.count} {fam.count === 1 ? 'item' : 'items'}
            </span>

            <div class="mt-auto"></div>

            <!-- subtle bottom accent line on hover -->
            <span
              class="pointer-events-none absolute left-0 right-0 bottom-0 h-0.5
                     bg-gradient-to-r from-transparent via-white/60 to-transparent
                     opacity-0 group-hover:opacity-100 transition"
            ></span>
          </a>
        {/each}
      </div>
    {:else}
      <div class="rounded-lg border border-slate-200 bg-white p-6 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
        No families found in <span class="font-semibold">{seriesLabel}</span>.
      </div>
    {/if}
  </div>
</section>
