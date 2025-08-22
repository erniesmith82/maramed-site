<script>
  import ProductCard from "./ProductCard.svelte";
  export let items = [];
</script>

<div class="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
  {#if items.length === 0}
    <div class="col-span-full rounded-2xl border border-slate-200 p-8 text-center">
      <p class="font-semibold text-slate-800">No products to display yet</p>
      <p class="mt-1 text-sm text-slate-600">Adjust filters or add items.</p>
    </div>
    {#each Array(6) as _}
      <div class="rounded-2xl border border-slate-200 overflow-hidden">
        <div class="aspect-[4/3] bg-slate-100 animate-pulse"></div>
        <div class="p-4 space-y-2">
          <div class="h-4 w-1/2 bg-slate-100 animate-pulse rounded"></div>
          <div class="h-3 w-3/4 bg-slate-100 animate-pulse rounded"></div>
          <div class="h-3 w-2/3 bg-slate-100 animate-pulse rounded"></div>
        </div>
      </div>
    {/each}
  {:else}
    {#each items as p}
      <ProductCard {p} />
    {/each}
  {/if}
</div>
