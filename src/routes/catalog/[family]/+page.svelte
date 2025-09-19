<script>
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import catalog from "$lib/data/products.json";

  /* --- animations --- */
  import { fade, fly, scale } from "svelte/transition";
  import { onMount } from "svelte";

  export let data;

  /* ----- REACTIVE values from loader ----- */
  $: details         = data?.details ?? {};
  $: title           = details.title || "";
  $: description     = details.description || "";
  $: lcode           = details.lcode || "";
  $: indications     = details.indications || [];
  $: heroImage       = details.heroImage || "";
  $: sizes           = details.sizes || [];
  $: sizeGroups      = details.sizeGroups || null; // can include { title, image, rows, notes? }

  // 🔁 mpNote: always coerce to an array for consistent rendering
  $: mpNotes = Array.isArray(details?.mpNote)
    ? details.mpNote.filter(Boolean)
    : (details?.mpNote ? [String(details.mpNote)] : []);

  $: additionalItems = details.additionalItems || [];

  // Helpers
  const imgSrc = (p) => (!p ? "" : (p.startsWith("/") ? p : `/images/${p}`));
  $: currentKey = $page.params?.family;

  /* ================= Dynamic Sizes Table ================= */
  const COLUMN_LABELS = {
    itemNumber: "Item Number",
    sku: "SKU",
    size: "Size",
    side: "Side",

    // Sky Medical measurements
    bicepCircumference: "Bicep Circum.",
    forearmCircumference: "Forearm Circum.",
    wristCircumference: "Wrist Circum.",
    medialLength: "Medial Length",
    lateralLength: "Lateral Length",
    anteriorLength: "Anterior Length",
    posteriorLength: "Posterior Length",
    mensShoeSize: "Men’s Shoe Size",
    womensShoeSize: "Women’s Shoe Size",

    // Existing fields
    mpDiameter: "M-P Diameter*",
    fingerExtension: "Finger Extension",
    circumference: "Circumference",
    // NEW: split lengths
    insideLength: "Inside Length",
    outsideLength: "Outside Length",
    length: "Length",
    width: "Width",
    height: "Height",
    insideDiameter: "Inside Diameter",

    // descriptions
    Description: "Description",
    description: "Description"
  };

  // Order: put inside/outside length before generic length
  const COLUMN_ORDER = [
    "itemNumber","sku","size","side",
    "circumference",
    "medialLength","lateralLength","anteriorLength","posteriorLength",
    "bicepCircumference","wristCircumference","forearmCircumference",
    "mensShoeSize","womensShoeSize",
    "mpDiameter","fingerExtension",
    "insideLength","outsideLength","length",
    "width","height","insideDiameter",
    "Description","description"
  ];

  function byPrefOrder(a, b) {
    const ia = COLUMN_ORDER.indexOf(a), ib = COLUMN_ORDER.indexOf(b);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return (COLUMN_LABELS[a] || a).localeCompare(COLUMN_LABELS[b] || b);
  }

  function getOrderedColumns(rows = []) {
    const present = Array.from(
      new Set(
        rows.flatMap((row) =>
          Object.keys(row || {}).filter(
            (k) => COLUMN_LABELS[k] && row[k] != null && String(row[k]).trim() !== ""
          )
        )
      )
    );
    return present.sort(byPrefOrder);
  }

  $: orderedColumns = getOrderedColumns(sizes);

  // 👇 show the mpNote section only if any table shows M-P Diameter and we actually have notes
  $: showMpNote =
    (orderedColumns.includes("mpDiameter") ||
      (Array.isArray(sizeGroups) &&
        sizeGroups.some((g) => getOrderedColumns(g.rows || []).includes("mpDiameter")))) &&
    mpNotes.length > 0;

  /* ================= Additional Items → family links ================= */

  // Normalize Additional Item fields
  function itemNum(item) {
    if (typeof item === "string") return item.split(/—|-|:/)[0]?.trim();
    return (
      item?.itemNumber ?? item?.["item number"] ?? item?.sku ??
      item?.title ?? item?.name ?? item?.label ?? ""
    );
  }
  function itemDesc(item) {
    if (typeof item === "string") {
      const parts = item.split(/—|-|:/);
      return parts.length > 1 ? parts.slice(1).join("—").trim() : "";
    }
    return item?.Description ?? item?.description ?? item?.desc ?? item?.label ?? "";
  }

  // ✅ Families now live at the top level (catalog.families), not series[].families
  const ALL_FAMILY_KEYS = new Set(
    Object.keys(catalog.families ?? {}).map((k) => k.toUpperCase())
  );

  // Optional aliases for odd item numbers -> family keys
  const FAMILY_ALIAS = {
    "STOCKINETTE-WH": "STOCKINETTE",
    "STOCKINETTE": "STOCKINETTE"
  };

  function canonicalFamilyKey(input = "") {
    const up = (input || "").trim().toUpperCase();
    if (!up) return null;
    if (ALL_FAMILY_KEYS.has(up)) return up;
    const aliased = FAMILY_ALIAS[up];
    return aliased && ALL_FAMILY_KEYS.has(aliased) ? aliased : null;
  }

  // ⚡ Build a quick SKU → family index from the top-level families map
  const SKU_INDEX = (() => {
    const idx = new Map();
    const fams = catalog.families ?? {};
    for (const [fKey, fVal] of Object.entries(fams)) {
      for (const it of fVal.items ?? []) {
        const k = (it?.sku ?? it?.itemNumber ?? "").toString().trim();
        if (k) idx.set(k, fKey);
      }
    }
    return idx;
  })();

  function findFamilyKeyBySku(skuRaw = "") {
    const sku = (skuRaw || "").trim();
    if (!sku) return null;
    return SKU_INDEX.get(sku) ?? null;
  }

  // Keyword fallbacks when an additional item has no SKU that we can index
  const KEYWORD_FAMILY_MAP = [
    { re: /stockinette-wh/i, key: "STOCKINETTE" },
    { re: /wrist hand thumb extended/i, key: "WHT" }, // map to WHT (no separate WHTE family)
    { re: /wrist hand thumb finger/i,   key: "WHT"  },
    { re: /wrist hand thumb/i,          key: "WHT"  },
    { re: /wrist hand extended/i,       key: "WH"   },
    { re: /wrist hand holder/i,         key: "WH"   },
    { re: /wrist hand/i,                key: "WH"   },
    { re: /sports thumb spica/i,        key: "TS-SPORTS" },
    { re: /thumb guard spica/i,         key: "TGS" },
    { re: /colles/i,                    key: "UFB" },
    { re: /humer(us|al).*(shoulder guard|sg)/i, key: "HFB-SG" },
    { re: /humer(us|al)/i,              key: "HFB-SG" },
    { re: /ulna fracture/i,             key: "UFB" },
    { re: /tibial fb proximal support|ptb|proximal support/i, key: "TFB" },
    { re: /tibial fracture brace/i,     key: "TFB" },
    { re: /ankle foot|afo/i,            key: "PLS-FF" }
  ];
  function findFamilyByKeywords(text = "") {
    if (!text) return null;
    for (const { re, key } of KEYWORD_FAMILY_MAP) if (re.test(text)) return key;
    return null;
  }

  function linkForAdditional(item) {
    // if loader provided a direct href, use it
    if (item?.href) return item.href;

    // otherwise fall back to page-side inference (unchanged)
    const sku = itemNum(item);
    const viaSku = findFamilyKeyBySku(sku);
    let famKey = canonicalFamilyKey(viaSku);
    if (!famKey) {
      const desc = itemDesc(item);
      const viaKw = findFamilyByKeywords(desc) || findFamilyByKeywords(sku);
      famKey = canonicalFamilyKey(viaKw);
    }
    if (!famKey) return null;
    return `/catalog/${encodeURIComponent(famKey)}`;
  }

  function nav(href) {
    if (!href) return;
    goto(href, { invalidateAll: true, noScroll: false });
  }

  /* ------------ Page-wide animation gate ------------ */
  let mounted = false;
  onMount(() => requestAnimationFrame(() => (mounted = true)));

  const isReduced =
    typeof matchMedia !== "undefined" &&
    matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Same global knobs as landing page (bigger = slower)
  const DUR_MULT = 1;
  const DELAY_MULT = 0.5;
  const T = (ms) => (isReduced ? 0 : Math.round(ms * DUR_MULT));
  const D = (ms) => (isReduced ? 0 : Math.round(ms * DELAY_MULT));

  // Scatter helpers (alternate directions/offsets)
  const sx = (i) => [ -18, 14, -10, 12, -8 ][i % 5];
  const sy = (i) => [ 12, 8, 14, 10, 11 ][i % 5];
</script>


<section class="w-full">
  {#if mounted}
    <!-- page enter -->
    <div in:fade={{ duration: T(420) }}>
      <div in:scale={{ duration: T(520), start: 0.985 }}>
        <div class="max-w-6xl mx-auto px-4 py-8">
          {#if title}
            <div in:fade={{ duration: T(350), delay: D(40) }}>
              <h1
                class="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6 sm:mb-8
                       bg-gradient-to-r from-emerald-700 to-emerald-500 bg-clip-text text-transparent text-center"
                in:fly={{ x: -8, y: 10, duration: T(100), delay: D(60) }}
              >
                {title}
              </h1>
            </div>
          {/if}

          {#if description || lcode}
            {#if description}
              <p
                class="mt-2 text-slate-700 leading-relaxed text-base sm:text-lg mb-6 sm:mb-8 max-w-3xl mx-auto text-center"
                in:fly={{ x: 10, y: 8, duration: T(150), delay: D(60) }}
              >
                {description}
              </p>
            {/if}

            {#if lcode}
              <p class="mt-1 text-slate-700 text-center" in:fade={{ duration: T(100), delay: D(170) }}>
                <span class="inline-flex items-center gap-2 align-middle">
                  <span class="font-semibold">Suggested L-Code:</span>
                  <span class="inline-block rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-sm font-semibold tracking-wide">
                    {lcode}
                  </span>
                </span>
              </p>
            {/if}
          {/if}

          <!-- Indications + Hero -->
          <div class="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {#if indications.length}
              <div class="col-span-1 lg:col-span-8" in:fade={{ duration: T(460), delay: D(140) }}>
                <div class="h-full rounded-2xl border border-slate-200 bg-white p-8 shadow-md"
                     in:scale={{ duration: T(420), delay: D(140), start: 0.99 }}>
                  <h2 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-emerald-700 mb-4 text-center">
                    Indications
                  </h2>
                  <ul class="mt-4 list-disc pl-6 space-y-3 text-lg text-slate-800">
                    {#each indications as ind, i}
                      <li in:fly={{ x: sx(i), y: sy(i), duration: T(360), delay: D(160 + i*40) }}>
                        {ind}
                      </li>
                    {/each}
                  </ul>
                </div>
              </div>
            {/if}

            {#if heroImage}
              <div class="col-span-1 lg:col-span-4" in:fade={{ duration: T(460), delay: D(160) }}>
                <div in:scale={{ duration: T(460), delay: D(160), start: 0.985 }}>
                  <img
                    src={imgSrc(heroImage)}
                    alt={title || "Product hero image"}
                    class="w-full max-h-[12rem] object-contain rounded-xl
                           bg-slate-50 ring-1 ring-slate-200 shadow-sm"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </div>
            {/if}
          </div>
        </div>

        <!-- Sizes + Additional Items -->
        <div class="max-w-6xl mx-auto px-4 pb-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

          <!-- Sizes -->
          {#if (sizeGroups && sizeGroups.length) || sizes.length}
            <aside class="col-span-1 lg:col-span-12 lg:col-start-1 mx-auto w-full"
                   in:fade={{ duration: T(500), delay: D(80) }}>
              <div class="h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                   in:scale={{ duration: T(500), delay: D(80), start: 0.99 }}>
                <h2 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-emerald-700 mb-4 text-center">
                  Sizes
                </h2>

                <!-- Grouped sizes -->
                {#if sizeGroups && sizeGroups.length}
                  {#each sizeGroups as group, gi}
                    {#if group.rows && group.rows.length}
                      <div class={gi > 0 ? "mt-10" : ""} in:fly={{ x: sx(gi), y: sy(gi), duration: T(420), delay: D(120 + gi*140) }}>
                        <!-- Header -->
                        <div class="mb-3 flex items-center justify-between gap-3">
                          <h3 class="text-2xl sm:text-3xl font-bold text-slate-900 text-left">
                            {group.title}
                          </h3>

                          {#if group.image}
                            <img
                              src={imgSrc(group.image)}
                              alt=""
                              class="h-12 sm:h-14 lg:h-16 w-auto object-contain ml-2 shrink-0"
                              loading="lazy"
                              decoding="async"
                              in:fade={{ duration: T(240) }}
                            />
                          {/if}
                        </div>

                        {#key group.title}
                          {#await Promise.resolve(getOrderedColumns(group.rows)) then cols}
                            {#if cols.length}
                              <!-- container with full grid lines -->
                              <div class="-mx-4 sm:mx-0">
                                <div class="overflow-x-auto">
                                  <div class="min-w-[680px] sm:min-w-0 overflow-hidden rounded-xl border border-slate-200">
                                    <table class="w-full text-xs sm:text-sm table-fixed sm:table-auto border-collapse">
                                      <thead class="bg-slate-50">
                                        <tr class="text-left text-slate-600 border-b border-slate-200">
                                          {#each cols as col, ci}
                                            <th
                                              class="py-2 px-3 pr-4 last:pr-3 font-semibold leading-snug whitespace-nowrap sm:whitespace-normal break-words align-top border-r border-slate-200 last:border-r-0"
                                              in:fade={{ duration: T(280), delay: D(60 + ci*20) }}
                                            >
                                              {COLUMN_LABELS[col]}
                                            </th>
                                          {/each}
                                        </tr>
                                      </thead>
                                      <tbody class="align-top">
                                        {#each group.rows as row, ri}
                                          <!-- NEW: use itemNumber OR sku for the anchor id -->
                                          <tr id={(row.itemNumber || row.sku) ? String(row.itemNumber || row.sku) : undefined}
                                              class="border-b border-slate-200 hover:bg-slate-50 transition">
                                            {#each cols as col}
                                              <td class="py-2 px-3 pr-4 last:pr-3 align-top whitespace-nowrap sm:whitespace-normal break-words border-r border-slate-200 last:border-r-0">
                                                {#if row[col] != null && String(row[col]).trim() !== ""}
                                                  {row[col]}
                                                {:else}
                                                  <span class="text-slate-400">—</span>
                                                {/if}
                                              </td>
                                            {/each}
                                          </tr>
                                        {/each}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            {:else}
                              <p class="text-sm text-slate-600 text-center">No size attributes for this group.</p>
                            {/if}
                          {/await}
                        {/key}

                        {#if group.notes && group.notes.length}
                          <ul class="mt-3 text-[13px] text-slate-600 space-y-1">
                            {#each group.notes as note, ni}
                              <li in:fade={{ duration: T(240), delay: D(60 + ni*40) }}>• {note}</li>
                            {/each}
                          </ul>
                        {/if}
                      </div>
                    {/if}
                  {/each}
                {:else}
                  <!-- Single table (no groups) -->
                  {#if orderedColumns.length}
                    <div class="mt-4 -mx-4 sm:mx-0">
                      <div class="overflow-x-auto">
                        <div class="min-w-[680px] sm:min-w-0 overflow-hidden rounded-xl border border-slate-200"
                             in:fly={{ x: -10, y: 12, duration: T(420), delay: D(160) }}>
                          <table class="w-full text-xs sm:text-sm table-fixed sm:table-auto border-collapse">
                            <thead class="bg-slate-50">
                              <tr class="text-left text-slate-600 border-b border-slate-200">
                                {#each orderedColumns as col, ci}
                                  <th
                                    class="py-2 px-3 pr-4 last:pr-3 font-semibold leading-snug whitespace-nowrap sm:whitespace-normal break-words align-top border-r border-slate-200 last:border-r-0"
                                    in:fade={{ duration: T(280), delay: D(60 + ci*20) }}
                                  >
                                    {COLUMN_LABELS[col]}
                                  </th>
                                {/each}
                              </tr>
                            </thead>
                            <tbody class="align-top">
                              {#each sizes as row, i}
                                <!-- NEW: use itemNumber OR sku for the anchor id -->
                                <tr id={(row.itemNumber || row.sku) ? String(row.itemNumber || row.sku) : undefined}
                                    class="border-b border-slate-200 hover:bg-slate-50 transition"
                                    in:fly={{ x: sx(i), y: sy(i), duration: T(320), delay: D(80 + i*22) }}>
                                  {#each orderedColumns as col}
                                    <td class="py-2 px-3 pr-4 last:pr-3 align-top whitespace-nowrap sm:whitespace-normal break-words border-r border-slate-200 last:border-r-0">
                                      {#if row[col] != null && String(row[col]).trim() !== ""}
                                        {row[col]}
                                      {:else}
                                        <span class="text-slate-400">—</span>
                                      {/if}
                                    </td>
                                  {/each}
                                </tr>
                              {/each}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  {:else}
                    <p class="mt-4 text-sm text-slate-600 text-center"
                       in:fade={{ duration: T(320), delay: D(120) }}>
                      No size attributes available.
                    </p>
                  {/if}
                {/if}

                {#if showMpNote}
                  <ul class="mt-3 text-[13px] text-slate-500 italic space-y-1"
                      in:fly={{ x: 10, y: 8, duration: T(320), delay: D(140) }}>
                    {#each mpNotes as n}
                      <li>* {n}</li>
                    {/each}
                  </ul>
                {/if}

                {#if details.notes && details.notes.length}
                  <div class="mt-3 space-y-1 text-[13px] text-slate-500">
                    {#each details.notes as note, ni}
                      <p in:fly={{ x: sx(ni), y: sy(ni), duration: T(300), delay: D(80 + ni*30) }}>{note}</p>
                    {/each}
                  </div>
                {/if}
              </div>
            </aside>
          {/if}

          <!-- Additional Items -->
          {#if additionalItems.length}
            <div class="mx-auto w-full col-span-1 lg:col-span-12"
                 in:fly={{ x: -12, y: 10, duration: T(480), delay: D(120) }}>
              <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm mt-2"
                   in:scale={{ duration: T(460), delay: D(120), start: 0.99 }}>
                <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-700 mb-4 text-center">
                  Additional Items
                </h2>
                <div class="mt-4">
                  <table class="w-full text-sm table-fixed">
                    <thead>
                      <tr class="text-left text-slate-600 border-b border-slate-200">
                        <th class="w-1/3 py-2 pr-4 font-semibold">Item Number</th>
                        <th class="w-2/3 py-2 pr-0 font-semibold">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {#each additionalItems as it, ai}
                        <tr class="border-b border-slate-100 hover:bg-slate-50 transition"
                            in:fly={{ x: sx(ai), y: sy(ai), duration: T(300), delay: D(80 + ai*25) }}>
                          <td class="py-2 pr-4 font-mono text-slate-800 break-words">
                            {#if linkForAdditional(it)}
                              <a
                                href={linkForAdditional(it)}
                                class="text-emerald-700 hover:underline"
                                on:click|preventDefault={() => nav(linkForAdditional(it))}
                              >
                                {itemNum(it) || "—"}
                              </a>
                            {:else}
                              {itemNum(it) || "—"}
                            {/if}
                          </td>
                          <td class="py-2 pr-0 text-slate-800 break-words">
                            {itemDesc(it) || "—"}
                          </td>
                        </tr>
                      {/each}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          {/if}
        </div>
      </div>
    </div>
  {/if}
</section>

<style>
  ul { list-style-position: outside; }
  tr[id]:target {
    outline: 2px solid rgb(16 185 129 / 0.6);
    outline-offset: 2px;
    background: rgb(16 185 129 / 0.06);
    scroll-margin-top: 80px;
  }
  .no-hyphens { hyphens: none; }
</style>
