<script>
  export let p; // { name, sku, category, subcat?, image?, slug }
</script>

<a href={`/catalog/${p.slug}`} class="group rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md transition">
  <div class="aspect-[4/3] bg-slate-100 overflow-hidden">
    {#if p.image}
      <img src={p.image} alt={p.name} class="h-full w-full object-cover group-hover:scale-[1.02] transition" />
    {/if}
  </div>
  <div class="p-4">
    <div class="flex items-center justify-between">
      <span class="text-xs font-semibold uppercase tracking-wide text-slate-500">{p.category}</span>
      {#if p.sku}<span class="text-xs text-slate-400">SKU: {p.sku}</span>{/if}
    </div>
    <h3 class="mt-2 font-semibold text-slate-900">{p.name}</h3>
    {#if p.subcat}<p class="mt-1 text-xs text-slate-500">{p.subcat}</p>{/if}
  </div>
</a>
