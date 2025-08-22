<script>
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import products from "$lib/data/products.json";
  import CatalogGrid from "$lib/components/CatalogGrid.svelte";

  // Filter categories (keys must match product.category)
  const CATEGORIES = [
    { key: "orthotics", label: "Orthotics" },
    { key: "pediatric", label: "Pediatric" },
    { key: "footwear", label: "AFO & Cast Boot" },
    { key: "accessories", label: "Accessories" }
  ];

  // --- URL state (reactive via $page) ---
  $: q = $page.url.searchParams.get("q") ?? "";
  $: sort = $page.url.searchParams.get("sort") ?? "name-asc";
  $: catParam = $page.url.searchParams.get("cat") ?? "";
  $: selectedCats = new Set(catParam ? catParam.split(",").filter(Boolean) : []);

  // Local input state for the search box; initialize from q (no continuous resync)
  let searchTerm = q;

  // Update query params and trigger SvelteKit navigation so $page updates
  function updateParams(updates) {
    const url = new URL($page.url);
    for (const [k, v] of Object.entries(updates)) {
      if (!v || (Array.isArray(v) && v.length === 0)) url.searchParams.delete(k);
      else url.searchParams.set(k, Array.isArray(v) ? v.join(",") : v);
    }
    goto(`${url.pathname}${url.search}`, {
      replaceState: true,
      keepfocus: true,
      noscroll: true
    });
  }

  function toggleCategory(key) {
    const next = new Set(selectedCats);
    next.has(key) ? next.delete(key) : next.add(key);
    updateParams({ cat: [...next] });
  }

  function submitSearch() {
    updateParams({ q: (searchTerm ?? "").trim() });
  }

  function onSortChange(e) {
    updateParams({ sort: e.currentTarget.value });
  }

  // --- Filtering / Sorting ---
  function matchesQuery(p, query) {
    if (!query) return true;
    const t = query.toLowerCase();
    return (
      p.name?.toLowerCase().includes(t) ||
      p.sku?.toLowerCase().includes(t) ||
      p.category?.toLowerCase().includes(t) ||
      p.subcat?.toLowerCase().includes(t) ||
      p.brand?.toLowerCase().includes(t)
    );
  }

  function inSelectedCats(p) {
    return selectedCats.size === 0 || selectedCats.has(p.category);
  }

  function sortFn(a, b) {
    switch (sort) {
      case "name-asc": return a.name.localeCompare(b.name);
      case "name-desc": return b.name.localeCompare(a.name);
      case "sku-asc": return a.sku.localeCompare(b.sku);
      case "sku-desc": return b.sku.localeCompare(a.sku);
      default: return a.name.localeCompare(b.name);
    }
  }

  // Only filtered items are passed to the grid, so only those images/cards render
  $: filtered = products
    .filter((p) => matchesQuery(p, q))
    .filter((p) => inSelectedCats(p))
    .sort(sortFn);

  // If you want to hide items that don't have an image when a search is active, use this instead:
  // $: filtered = products
  //   .filter((p) => matchesQuery(p, q))
  //   .filter((p) => inSelectedCats(p))
  //   .filter((p) => (q ? !!p.image : true))
  //   .sort(sortFn);
</script>

<svelte:head>
  <title>Catalog — Maramed</title>
  <meta name="description" content="Browse the Maramed catalog. Filter and sort by category, name, brand, and SKU." />
</svelte:head>

<section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
  <!-- Controls -->
  <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
      <div class="w-full sm:w-96">
        <label class="block text-xs font-semibold text-slate-600 mb-1">Search</label>
        <form class="flex" on:submit|preventDefault={submitSearch}>
          <input
            type="search"
            class="w-full rounded-l-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            placeholder="Search by name, SKU, brand, or subcategory…"
            bind:value={searchTerm}
            aria-label="Search products"
          />
          <button
            type="submit"
            class="rounded-r-lg border border-l-0 border-slate-300 bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-black"
            aria-label="Submit search"
          >
            Search
          </button>
        </form>
      </div>

      <div>
        <label class="block text-xs font-semibold text-slate-600 mb-1">Sort</label>
        <select
          class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          on:change={onSortChange}
          bind:value={sort}
        >
          <option value="name-asc">Name (A–Z)</option>
          <option value="name-desc">Name (Z–A)</option>
          <option value="sku-asc">SKU (A–Z)</option>
          <option value="sku-desc">SKU (Z–A)</option>
        </select>
      </div>
    </div>

    <!-- Category filters -->
    <div class="grid grid-cols-2 sm:flex sm:flex-wrap gap-x-6 gap-y-2">
      <p class="col-span-2 text-xs font-semibold text-slate-600">Categories</p>
      {#each CATEGORIES as c}
        <label class="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            class="rounded border-slate-300"
            checked={selectedCats.has(c.key)}
            on:change={() => toggleCategory(c.key)}
          />
          <span>{c.label}</span>
        </label>
      {/each}
      {#if selectedCats.size > 0}
        <button
          class="text-xs text-slate-500 underline hover:text-slate-700"
          on:click={() => updateParams({ cat: [] })}
        >
          Clear
        </button>
      {/if}
    </div>
  </div>

  <!-- Results -->
  <CatalogGrid items={filtered} />
</section>
