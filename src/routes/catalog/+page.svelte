<script>
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";

  // 🔹 Empty product list on purpose — you’ll plug real data later.
  // Example shape (when ready): { slug, name, sku, category, image, updated }
  const products = [];

  // Available categories (adjust labels/keys to match your data later)
  const CATEGORIES = [
    { key: "orthotics", label: "Orthotics" },
    { key: "prosthetics", label: "Prosthetics" },
    { key: "fabrication", label: "Fabrication" }
  ];

  // --- URL State helpers ---
  $: q = $page.url.searchParams.get("q") ?? "";
  $: sort = $page.url.searchParams.get("sort") ?? "name-asc";
  $: catParam = $page.url.searchParams.get("cat") ?? ""; // comma-separated
  $: selectedCats = new Set(catParam ? catParam.split(",").filter(Boolean) : []);

  function updateParams(updates) {
    const url = new URL($page.url);
    Object.entries(updates).forEach(([k, v]) => {
      if (v === "" || v == null || (Array.isArray(v) && v.length === 0)) url.searchParams.delete(k);
      else url.searchParams.set(k, Array.isArray(v) ? v.join(",") : v);
    });
    goto(url, { replaceState: true, keepfocus: true, noscroll: true });
  }

  function toggleCategory(key) {
    const next = new Set(selectedCats);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    updateParams({ cat: [...next] });
  }

  function onSearch(e) {
    updateParams({ q: e.currentTarget.value.trim() });
  }

  function onSortChange(e) {
    updateParams({ sort: e.currentTarget.value });
  }

  // --- Filtering/Sorting logic (works once you add data) ---
  function matchesQuery(p, query) {
    if (!query) return true;
    const t = query.toLowerCase();
    return (
      p.name?.toLowerCase().includes(t) ||
      p.sku?.toLowerCase().includes(t) ||
      p.category?.toLowerCase().includes(t)
    );
  }

  function inSelectedCats(p) {
    return selectedCats.size === 0 || selectedCats.has(p.category);
  }

  function sortFn(a, b) {
    switch (sort) {
      case "name-asc": return a.name?.localeCompare(b.name);
      case "name-desc": return b.name?.localeCompare(a.name);
      case "sku-asc": return a.sku?.localeCompare(b.sku);
      case "sku-desc": return b.sku?.localeCompare(a.sku);
      case "updated-desc": return (b.updated ?? 0) - (a.updated ?? 0);
      case "updated-asc": return (a.updated ?? 0) - (b.updated ?? 0);
      default: return a.name?.localeCompare(b.name);
    }
  }

  $: filtered = products
    .filter((p) => matchesQuery(p, q))
    .filter((p) => inSelectedCats(p))
    .sort(sortFn);
</script>

<svelte:head>
  <title>Catalog — Maramed</title>
  <meta name="description" content="Browse the Maramed catalog. Filter and sort by category, name, and SKU." />
</svelte:head>

<section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
  <!-- Controls -->
  <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
    <!-- Search + Sort -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
      <div class="w-full sm:w-80">
        <label class="block text-xs font-semibold text-slate-600 mb-1">Search</label>
        <input
          type="search"
          class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10"
          placeholder="Search by name or SKU…"
          value={q}
          on:input={onSearch}
        />
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
          <option value="updated-desc">Newest updated</option>
          <option value="updated-asc">Oldest updated</option>
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
  <div class="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {#if filtered.length === 0}
      <!-- Empty state / placeholder cards -->
      <div class="col-span-full rounded-2xl border border-slate-200 p-8 text-center">
        <p class="font-semibold text-slate-800">No products to display yet</p>
        <p class="mt-1 text-sm text-slate-600">
          Add items to the catalog data, or adjust filters to see results.
        </p>
      </div>

      <!-- Optional skeletons to preview layout -->
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
      {#each filtered as p}
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
          </div>
        </a>
      {/each}
    {/if}
  </div>
</section>
