<script>
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import catalog from "$lib/data/products.json";
  import { fade, fly, scale } from "svelte/transition";
  import { onMount } from "svelte";

  export let data;

  $: details = data?.details ?? {};
  $: title = details.title || "";
  $: description = details.description || "";
  $: lcode = details.lcode || "";
  $: indications = Array.isArray(details.indications) ? details.indications : [];
  $: features = Array.isArray(details.features) ? details.features : [];
  $: heroImage = details.heroImage || "";
  $: sizes = Array.isArray(details.sizes) ? details.sizes : [];
  $: sizeGroups = details.sizeGroups || null;
  $: sections = Array.isArray(details.sections) ? details.sections : [];
  $: measurementCards = Array.isArray(details?.measurementCards) ? details.measurementCards : [];
  $: components = Array.isArray(details.components) ? details.components : [];
  $: mpNotes = Array.isArray(details?.mpNote)
    ? details.mpNote.filter(Boolean)
    : (details?.mpNote ? [String(details.mpNote)] : []);
  $: additionalItems = Array.isArray(details.additionalItems) ? details.additionalItems : [];
  $: currentKey = $page.params?.family;

  const imgSrc = (p) => (!p ? "" : (p.startsWith("/") ? p : `/images/${p}`));
  const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);

  function slugify(s = "") {
    return s.toString().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  function sectionImage(sec) {
    if (sec?.image) return sec.image;
    const gallery = Array.isArray(details?.gallery) ? details.gallery : [];
    if (!gallery.length) return "";
    const id = (sec?.id || "").toLowerCase();
    const title = (sec?.title || "").toLowerCase();
    const synonyms = [
      { re: /mp|m-?p|metacarpo/i, kw: "mp" },
      { re: /calf/i, kw: "calf" },
      { re: /forearm/i, kw: "forearm" },
      { re: /wrist/i, kw: "wrist" },
      { re: /bicep/i, kw: "bicep" }
    ];
    let hit = gallery.find((p) => p.toLowerCase().includes(id));
    if (hit) return hit;
    const first = title.split(/\s+/)[0] || "";
    hit = gallery.find((p) => first && p.toLowerCase().includes(first));
    if (hit) return hit;
    for (const { re, kw } of synonyms) {
      if (re.test(id) || re.test(title)) {
        hit = gallery.find((p) => p.toLowerCase().includes(kw));
        if (hit) return hit;
      }
    }
    return "";
  }

  // ✅ keep both keys, but we will NEVER render both columns at the same time
  const COLUMN_LABELS = {
    sku: "Item Number",
    itemNumber: "Item Number",
    size: "Size",
    side: "Side",
    calfCircumference: "Calf Circumf.",
    thighCircumference: "Thigh Circumf.",
    footLength: "Foot Length",
    bicepCircumference: "Bicep Circum.",
    forearmCircumference: "Forearm Circum.",
    wristCircumference: "Wrist Circum.",
    medialLength: "Medial Length",
    lateralLength: "Lateral Length",
    anteriorLength: "Anterior Length",
    posteriorLength: "Posterior Length",
    mensShoeSize: "Men’s Shoe Size",
    womensShoeSize: "Women’s Shoe Size",
    mpDiameter: "M-P Diameter*",
    fingerExtension: "Finger Extension",
    circumference: "Circumference",
    insideLength: "Inside Length",
    outsideLength: "Outside Length",
    length: "Length",
    width: "Width",
    height: "Height",
    insideDiameter: "Inside Diameter",
    spec: "Spec",
    notes: "Notes",
    Description: "Description",
    description: "Description"
  };

  // ✅ prefer sku, itemNumber is fallback only
  const COLUMN_ORDER = [
    "sku",
    "itemNumber",
    "size",
    "side",
    "thighCircumference",
    "calfCircumference",
    "footLength",
    "circumference",
    "medialLength",
    "lateralLength",
    "anteriorLength",
    "posteriorLength",
    "bicepCircumference",
    "wristCircumference",
    "forearmCircumference",
    "mensShoeSize",
    "womensShoeSize",
    "mpDiameter",
    "fingerExtension",
    "insideLength",
    "outsideLength",
    "length",
    "width",
    "height",
    "insideDiameter",
    "spec",
    "notes",
    "Description",
    "description"
  ];

  function byPrefOrder(a, b) {
    const ia = COLUMN_ORDER.indexOf(a), ib = COLUMN_ORDER.indexOf(b);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return (COLUMN_LABELS[a] || a).localeCompare(COLUMN_LABELS[b] || b);
  }

  // ✅ FIX: prevent duplicate "Item Number" columns (sku + itemNumber)
  function getOrderedColumns(rows = []) {
    const hasSku = (rows ?? []).some(
      (r) => r && r.sku != null && String(r.sku).trim() !== ""
    );
    const hasItemNumber = (rows ?? []).some(
      (r) => r && r.itemNumber != null && String(r.itemNumber).trim() !== ""
    );

    const present = Array.from(
      new Set(
        (rows ?? []).flatMap((row) =>
          Object.keys(row || {}).filter((k) => {
            // prevent two "Item Number" columns
            if (k === "itemNumber" && hasSku) return false; // prefer sku when present
            if (k === "sku" && !hasSku && hasItemNumber) return false; // prefer itemNumber when sku absent

            if (!COLUMN_LABELS[k]) return false;

            const v = row?.[k];
            if (v == null) return false;
            if (typeof v === "string") return v.trim() !== "";
            return true;
          })
        )
      )
    );

    return present.sort(byPrefOrder);
  }

  $: orderedColumns = getOrderedColumns(sizes);

  $: showMpNote =
    (orderedColumns.includes("mpDiameter") ||
      (Array.isArray(sizeGroups) &&
        sizeGroups.some((g) => getOrderedColumns(g.rows || []).includes("mpDiameter")))) &&
    mpNotes.length > 0;

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

  const ALL_FAMILY_KEYS = new Set(
    Object.keys(catalog.families ?? {}).map((k) => k.toUpperCase())
  );

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

  const ITEM_INDEX = (() => {
    const idx = new Map();
    const fams = catalog.families ?? {};
    for (const [fKey, fVal] of Object.entries(fams)) {
      for (const it of fVal.items ?? []) {
        const k = (it?.itemNumber ?? it?.sku ?? "").toString().trim();
        if (k) idx.set(k, fKey);
      }
    }
    return idx;
  })();

  function findFamilyKeyByItemCode(codeRaw = "") {
    const code = (codeRaw || "").trim();
    if (!code) return null;
    return ITEM_INDEX.get(code) ?? null;
  }

  const KEYWORD_FAMILY_MAP = [
    { re: /stockinette-wh/i, key: "STOCKINETTE" },
    { re: /wrist hand thumb extended/i, key: "WHT" },
    { re: /wrist hand thumb finger/i, key: "WHT" },
    { re: /wrist hand thumb/i, key: "WHT" },
    { re: /wrist hand extended/i, key: "WH" },
    { re: /wrist hand holder/i, key: "WH" },
    { re: /wrist hand/i, key: "WH" },
    { re: /sports thumb spica/i, key: "TS-SPORTS" },
    { re: /thumb guard spica/i, key: "TGS" },
    { re: /colles/i, key: "UFB" },
    { re: /humer(us|al).*(shoulder guard|sg)/i, key: "HFB-SG" },
    { re: /humer(us|al)/i, key: "HFB-SG" },
    { re: /ulna fracture/i, key: "UFB" },
    { re: /tibial fb proximal support|ptb|proximal support/i, key: "TFB" },
    { re: /tibial fracture brace/i, key: "TFB" },
    { re: /ankle foot|afo/i, key: "PLS-FF" }
  ];

  function findFamilyByKeywords(text = "") {
    if (!text) return null;
    for (const { re, key } of KEYWORD_FAMILY_MAP) if (re.test(text)) return key;
    return null;
  }

  function linkForAdditional(item) {
    if (item?.href) return item.href;
    const code = itemNum(item);
    const viaCode = findFamilyKeyByItemCode(code);
    let famKey = canonicalFamilyKey(viaCode);
    if (!famKey) {
      const desc = itemDesc(item);
      const viaKw = findFamilyByKeywords(desc) || findFamilyByKeywords(code);
      famKey = canonicalFamilyKey(viaKw);
    }
    if (!famKey) return null;
    return `/catalog/${encodeURIComponent(famKey)}`;
  }

  function nav(href) {
    if (!href) return;
    goto(href, { invalidateAll: true, noscroll: false });
  }

  let mounted = false;
  onMount(() => requestAnimationFrame(() => (mounted = true)));

  const isReduced =
    typeof matchMedia !== "undefined" &&
    matchMedia("(prefers-reduced-motion: reduce)").matches;

  const DUR_MULT = 1;
  const DELAY_MULT = 0.5;
  const T = (ms) => (isReduced ? 0 : Math.round(ms * DUR_MULT));
  const D = (ms) => (isReduced ? 0 : Math.round(ms * DELAY_MULT));

  const sx = (i) => [-18, 14, -10, 12, -8][i % 5];
  const sy = (i) => [12, 8, 14, 10, 11][i % 5];

  let lightboxOpen = false;
  let lightboxSrc = "";
  let lightboxAlt = "";

  function openLightbox(src, alt = "") {
    if (!src) return;
    lightboxSrc = imgSrc(src);
    lightboxAlt = alt || "Expanded image";
    lightboxOpen = true;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lightboxOpen = false;
    lightboxSrc = "";
    lightboxAlt = "";
    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
  }

  function onWindowKeydown(e) {
    if (e.key === "Escape") closeLightbox();
  }

  function normalizeComponentRows(items = []) {
    const out = [];
    for (const it of items ?? []) {
      if (!it) continue;
      const row = { ...(typeof it === "object" ? it : {}) };

      // keep sku as the primary displayed "Item Number"
      if (!row.sku && row.itemNumber) row.sku = row.itemNumber;

      for (const k of Object.keys(row)) {
        if (row[k] == null) continue;
        if (typeof row[k] === "string") row[k] = row[k].trim();
      }

      if (!row.itemNumber && !row.sku && typeof it === "string") {
        const sku = it.trim();
        out.push({ sku, itemNumber: sku });
        continue;
      }

      if (row.itemNumber || row.sku) out.push(row);
    }
    return out;
  }
</script>

<svelte:window on:keydown={onWindowKeydown} />

<section class="w-full">
  {#if mounted}
    <div in:fade={{ duration: T(420) }}>
      <div in:scale={{ duration: T(520), start: 0.985 }}>
        <div class="max-w-6xl mx-auto px-4 py-8">
          {#if title}
            <div in:fade={{ duration: T(350), delay: D(40) }}>
              <h1
                class="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6 sm:mb-8 text-emerald-700 text-center"
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

          <!-- ✅ Indications + Features (same exact style) + Hero -->
          <div class="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {#if indications.length || features.length}
              <div class="col-span-1 lg:col-span-8 space-y-6">
                {#if indications.length}
                  <div in:fade={{ duration: T(460), delay: D(140) }}>
                    <div
                      class="h-full rounded-2xl border border-slate-200 bg-white p-8 shadow-md"
                      in:scale={{ duration: T(420), delay: D(140), start: 0.99 }}
                    >
                      <h2 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-emerald-700 mb-4 text-center">
                        Indications
                      </h2>
                      <ul class="mt-4 list-disc pl-6 space-y-3 text-lg text-slate-800">
                        {#each indications as ind, i}
                          <li in:fly={{ x: sx(i), y: sy(i), duration: T(360), delay: D(160 + i * 40) }}>
                            {ind}
                          </li>
                        {/each}
                      </ul>
                    </div>
                  </div>
                {/if}

                {#if features.length}
                  <div in:fade={{ duration: T(460), delay: D(140) }}>
                    <div
                      class="h-full rounded-2xl border border-slate-200 bg-white p-8 shadow-md"
                      in:scale={{ duration: T(420), delay: D(140), start: 0.99 }}
                    >
                      <h2 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-emerald-700 mb-4 text-center">
                        Features
                      </h2>
                      <ul class="mt-4 list-disc pl-6 space-y-3 text-lg text-slate-800">
                        {#each features as feat, i}
                          <li in:fly={{ x: sx(i), y: sy(i), duration: T(360), delay: D(160 + i * 40) }}>
                            {feat}
                          </li>
                        {/each}
                      </ul>
                    </div>
                  </div>
                {/if}
              </div>
            {/if}

            {#if heroImage}
              <div class="col-span-1 lg:col-span-4" in:fade={{ duration: T(460), delay: D(160) }}>
                <div in:scale={{ duration: T(460), delay: D(160), start: 0.985 }}>
                  <img
                    src={imgSrc(heroImage)}
                    alt={title || "Product hero image"}
                    class="w-full max-h-[20rem] object-contain rounded-xl bg-slate-50 ring-1 ring-slate-200 shadow-sm cursor-zoom-in hover:ring-emerald-300"
                    loading="lazy"
                    decoding="async"
                    role="button"
                    tabindex="0"
                    on:click={() => openLightbox(heroImage, title || "Product image")}
                    on:keydown={(e) => e.key === "Enter" && openLightbox(heroImage, title || "Product image")}
                  />
                </div>
              </div>
            {/if}
          </div>
        </div>

        {#if sections.length}
          <div class="max-w-6xl mx-auto px-4 pb-4">
            <div
              class="mt-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm"
              in:scale={{ duration: T(420), delay: D(110), start: 0.99 }}
            >
              <div class="space-y-8">
                {#each sections as sec, si}
                  <section
                    id={sec.id}
                    class="scroll-mt-24"
                    in:fly={{ x: sx(si), y: sy(si), duration: T(360), delay: D(140 + si * 60) }}
                  >
                    {#if sec.title}
                      <h3 class="text-2xl font-bold text-slate-900">{sec.title}</h3>
                    {/if}

                    <div class="mt-3 grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                      {#if sectionImage(sec)}
                        <div class="md:col-span-5 order-first">
                          <img
                            src={imgSrc(sectionImage(sec))}
                            alt={(sec.title ? `${sec.title} illustration` : "Illustration")}
                            class="w-full h-48 md:h-56 object-contain rounded-lg bg-slate-50 ring-1 ring-slate-200 cursor-zoom-in hover:ring-emerald-300"
                            loading="lazy"
                            decoding="async"
                            role="button"
                            tabindex="0"
                            on:click={() => openLightbox(sectionImage(sec), sec.title ? `${sec.title} illustration` : "Illustration")}
                            on:keydown={(e) => e.key === "Enter" && openLightbox(sectionImage(sec), sec.title ? `${sec.title} illustration` : "Illustration")}
                          />
                        </div>
                      {/if}

                      <div class={sectionImage(sec) ? "md:col-span-7" : "md:col-span-12"}>
                        {#if sec.body}<p class="text-slate-700">{sec.body}</p>{/if}

                        {#if sec.requiredMaterials?.length}
                          <h4 class="mt-4 font-semibold text-slate-900">Required Materials</h4>
                          <ul class="mt-2 list-disc pl-6 space-y-1 text-slate-800">
                            {#each sec.requiredMaterials as m}<li>{m}</li>{/each}
                          </ul>
                        {/if}

                        {#if sec.steps?.length}
                          <h4 class="mt-4 font-semibold text-slate-900">Steps</h4>
                          <ol class="mt-2 list-decimal pl-6 space-y-1 text-slate-800">
                            {#each sec.steps as step}<li>{step}</li>{/each}
                          </ol>
                        {/if}

                        {#if sec.procedure?.length}
                          <h4 class="mt-4 font-semibold text-slate-900">Procedure</h4>
                          <ol class="mt-2 list-decimal pl-6 space-y-1 text-slate-800">
                            {#each sec.procedure as p}<li>{p}</li>{/each}
                          </ol>
                        {/if}

                        {#if sec.suggestedTools?.length}
                          <h4 class="mt-4 font-semibold text-slate-900">Suggested Tools</h4>
                          <ul class="mt-2 list-disc pl-6 space-y-1 text-slate-800">
                            {#each sec.suggestedTools as t}
                              <li>
                                {#if t.href}
                                  <a
                                    href={t.href}
                                    class="text-emerald-700 hover:underline"
                                    on:click|preventDefault={() => nav(t.href)}
                                  >
                                    {(t.itemNumber || t.sku || t.description) || "Tool"}
                                  </a>
                                  {#if t.description}
                                    <span class="text-slate-700"> — {t.description}</span>
                                  {/if}
                                {:else}
                                  {(t.itemNumber || t.sku || t.description) || "Tool"}
                                  {#if t.description}
                                    <span class="text-slate-700"> — {t.description}</span>
                                  {/if}
                                {/if}
                              </li>
                            {/each}
                          </ul>
                        {/if}

                        {#if sec.lists?.length}
                          <div class="mt-4 space-y-4">
                            {#each sec.lists as group}
                              <div>
                                {#if group.title}<h4 class="font-semibold text-slate-900">{group.title}</h4>{/if}
                                <ul class="mt-2 list-disc pl-6 space-y-1 text-slate-800">
                                  {#each group.items as it}
                                    <li>
                                      {#if isObj(it)}
                                        {#if it.href}
                                          <a
                                            href={it.href}
                                            class="text-emerald-700 hover:underline"
                                            on:click|preventDefault={() => nav(it.href)}
                                          >
                                            {itemNum(it) || "—"}
                                          </a>
                                          {#if itemDesc(it)}
                                            <span class="text-slate-700"> — {itemDesc(it)}</span>
                                          {/if}
                                        {:else}
                                          {itemNum(it) || itemDesc(it) || "—"}
                                        {/if}
                                      {:else}
                                        {it}
                                      {/if}
                                    </li>
                                  {/each}
                                </ul>
                              </div>
                            {/each}
                          </div>
                        {/if}
                      </div>
                    </div>
                  </section>
                {/each}
              </div>
            </div>
          </div>
        {/if}

        {#if components && components.length}
          <div class="max-w-6xl mx-auto px-4 pb-4">
            <div
              class="mt-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm"
              in:scale={{ duration: T(420), delay: D(110), start: 0.99 }}
            >
              <h2 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-emerald-700 mb-6 text-center">
                Components
              </h2>

              <div class="space-y-10">
                {#each components as comp, ci}
                  <section
                    id={slugify(comp?.group || `component-${ci + 1}`)}
                    class="scroll-mt-24"
                    in:fly={{ x: sx(ci), y: sy(ci), duration: T(360), delay: D(140 + ci * 60) }}
                  >
                    {#if comp?.group}
                      <h3 class="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
                        {comp.group}
                      </h3>
                    {/if}

                    {#if comp?.items && comp.items.length}
                      {#key comp.group}
                        {#await Promise.resolve(getOrderedColumns(normalizeComponentRows(comp.items))) then cols}
                          {#if cols.length}
                            <div class="-mx-4 sm:mx-0">
                              <div class="overflow-x-auto">
                                <div class="min-w-[680px] sm:min-w-0 overflow-hidden rounded-xl border border-slate-200">
                                  <table class="w-full text-xs sm:text-sm table-fixed sm:table-auto border-collapse">
                                    <thead class="bg-slate-50">
                                      <tr class="text-left text-slate-600 border-b border-slate-200">
                                        {#each cols as col, cci}
                                          <th class="py-2 px-3 pr-4 last:pr-3 font-semibold leading-snug whitespace-nowrap sm:whitespace-normal break-words align-top border-r border-slate-200 last:border-r-0" in:fade={{ duration: T(280), delay: D(60 + cci * 20) }}>
                                            {COLUMN_LABELS[col] || col}
                                          </th>
                                        {/each}
                                      </tr>
                                    </thead>
                                    <tbody class="align-top">
                                      {#each normalizeComponentRows(comp.items) as row, ri}
                                        <tr id={(row.itemNumber || row.sku) ? String(row.itemNumber || row.sku) : undefined} class="border-b border-slate-200 hover:bg-slate-50 transition">
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
                            <p class="text-sm text-slate-600 text-center">No attributes available for this component group.</p>
                          {/if}
                        {/await}
                      {/key}
                    {:else}
                      <p class="text-sm text-slate-600">No items listed.</p>
                    {/if}
                  </section>
                {/each}
              </div>
            </div>
          </div>
        {/if}

        <div class="max-w-6xl mx-auto px-4 pb-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {#if (sizeGroups && sizeGroups.length) || sizes.length}
            <aside class="col-span-1 lg:col-span-12 lg:col-start-1 mx-auto w-full" in:fade={{ duration: T(500), delay: D(80) }}>
              <div class="h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" in:scale={{ duration: T(500), delay: D(80), start: 0.99 }}>
                <h2 class="text-3xl sm:text-4xl font-extrabold tracking-tight text-emerald-700 mb-4 text-center">Sizes</h2>

                {#if sizeGroups && sizeGroups.length}
                  {#each sizeGroups as group, gi}
                    {#if group.rows && group.rows.length}
                      <div id={group.key} class={gi > 0 ? "mt-10" : ""} in:fly={{ x: sx(gi), y: sy(gi), duration: T(420), delay: D(120 + gi * 140) }}>
                        <div class="mb-3 flex items-center justify-between gap-3">
                          <h3 class="text-2xl sm:text-3xl font-bold text-slate-900 text-left">{group.title}</h3>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
                          {#if group.image}
                            <div class="md:col-span-4" in:fade={{ duration: T(320), delay: D(120) }}>
                              <img
                                src={imgSrc(group.image)}
                                alt={(group.title ? `${group.title} illustration` : "Size group illustration")}
                                class="w-full h-48 md:h-64 object-contain rounded-lg bg-slate-50 ring-1 ring-slate-200 shadow-sm cursor-zoom-in hover:ring-emerald-300"
                                loading="lazy"
                                decoding="async"
                                role="button"
                                tabindex="0"
                                on:click={() => openLightbox(group.image, group.title ? `${group.title} illustration` : "Size group illustration")}
                                on:keydown={(e) => e.key === "Enter" && openLightbox(group.image, group.title ? `${group.title} illustration` : "Size group illustration")}
                              />
                            </div>
                          {/if}

                          <div class={group.image ? "md:col-span-8" : "md:col-span-12"}>
                            {#key group.key || group.title}
                              {#await Promise.resolve(getOrderedColumns(group.rows)) then cols}
                                {#if cols.length}
                                  <div class="-mx-4 sm:mx-0">
                                    <div class="overflow-x-auto">
                                      <div class="min-w-[680px] sm:min-w-0 overflow-hidden rounded-xl border border-slate-200">
                                        <table class="w-full text-xs sm:text-sm table-fixed sm:table-auto border-collapse">
                                          <thead class="bg-slate-50">
                                            <tr class="text-left text-slate-600 border-b border-slate-200">
                                              {#each cols as col, ci}
                                                <th class="py-2 px-3 pr-4 last:pr-3 font-semibold leading-snug whitespace-nowrap sm:whitespace-normal break-words align-top border-r border-slate-200 last:border-r-0" in:fade={{ duration: T(280), delay: D(60 + ci * 20) }}>
                                                  {COLUMN_LABELS[col] || col}
                                                </th>
                                              {/each}
                                            </tr>
                                          </thead>
                                          <tbody class="align-top">
                                            {#each group.rows as row, ri}
                                              <tr id={(row.itemNumber || row.sku) ? String(row.itemNumber || row.sku) : undefined} class="border-b border-slate-200 hover:bg-slate-50 transition">
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
                                  <li in:fade={{ duration: T(240), delay: D(60 + ni * 40) }}>• {note}</li>
                                {/each}
                              </ul>
                            {/if}
                          </div>
                        </div>
                      </div>
                    {/if}
                  {/each}
                {:else}
                  {#if orderedColumns.length}
                    <div class="mt-4 -mx-4 sm:mx-0">
                      <div class="overflow-x-auto">
                        <div class="min-w-[680px] sm:min-w-0 overflow-hidden rounded-xl border border-slate-200" in:fly={{ x: -10, y: 12, duration: T(420), delay: D(160) }}>
                          <table class="w-full text-xs sm:text-sm table-fixed sm:table-auto border-collapse">
                            <thead class="bg-slate-50">
                              <tr class="text-left text-slate-600 border-b border-slate-200">
                                {#each orderedColumns as col, ci}
                                  <th class="py-2 px-3 pr-4 last:pr-3 font-semibold leading-snug whitespace-nowrap sm:whitespace-normal break-words align-top border-r border-slate-200 last:border-r-0" in:fade={{ duration: T(280), delay: D(60 + ci * 20) }}>
                                    {COLUMN_LABELS[col] || col}
                                  </th>
                                {/each}
                              </tr>
                            </thead>
                            <tbody class="align-top">
                              {#each sizes as row, i}
                                <tr id={(row.itemNumber || row.sku) ? String(row.itemNumber || row.sku) : undefined} class="border-b border-slate-200 hover:bg-slate-50 transition" in:fly={{ x: sx(i), y: sy(i), duration: T(320), delay: D(80 + i * 22) }}>
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
                    <p class="mt-4 text-sm text-slate-600 text-center" in:fade={{ duration: T(320), delay: D(120) }}>
                      No size attributes available.
                    </p>
                  {/if}
                {/if}

                {#if showMpNote}
                  <ul class="mt-3 text-[13px] text-slate-500 italic space-y-1" in:fly={{ x: 10, y: 8, duration: T(320), delay: D(140) }}>
                    {#each mpNotes as n}
                      <li>* {n}</li>
                    {/each}
                  </ul>
                {/if}

                {#if details.notes && details.notes.length && !measurementCards.length}
                  <div class="mt-3 space-y-1 text-[13px] text-slate-500 text">
                    {#each details.notes as note, ni}
                      <p in:fly={{ x: sx(ni), y: sy(ni), duration: T(300), delay: D(80 + ni * 30) }}>{note}</p>
                    {/each}
                  </div>
                {/if}
              </div>
            </aside>
          {/if}

          {#if additionalItems.length}
            <div class="mx-auto w-full col-span-1 lg:col-span-12" in:fly={{ x: -12, y: 10, duration: T(480), delay: D(120) }}>
              <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm mt-2" in:scale={{ duration: T(460), delay: D(120), start: 0.99 }}>
                <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-700 mb-4 text-center">Additional Items</h2>
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
                        <tr class="border-b border-slate-100 hover:bg-slate-50 transition" in:fly={{ x: sx(ai), y: sy(ai), duration: T(300), delay: D(80 + ai * 25) }}>
                          <td class="py-2 pr-4 font-mono text-slate-800 break-words">
                            {#if linkForAdditional(it)}
                              <a href={linkForAdditional(it)} class="text-emerald-700 hover:underline" on:click|preventDefault={() => nav(linkForAdditional(it))}>
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

        {#if lightboxOpen}
          <div class="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm" on:click={closeLightbox} transition:fade={{ duration: T(160) }} aria-hidden="true"></div>

          <div class="fixed inset-0 z-[1000] grid place-items-center px-4">
            <div class="relative w-full max-w-5xl" on:click|stopPropagation transition:scale={{ duration: T(180), start: 0.98 }} role="dialog" aria-modal="true" aria-label="Expanded image">
              <button class="absolute -top-3 -right-3 rounded-full bg-white text-slate-900 w-10 h-10 shadow-lg ring-1 ring-slate-200 hover:bg-slate-50" on:click={closeLightbox} aria-label="Close expanded image">
                ✕
              </button>

              <div class="rounded-2xl bg-white p-3 shadow-2xl ring-1 ring-black/10">
                <img src={lightboxSrc} alt={lightboxAlt} class="w-full max-h-[80vh] object-contain rounded-xl bg-slate-50" loading="eager" decoding="async" />
                <p class="mt-2 text-xs text-slate-500 text-center">{lightboxAlt}</p>
              </div>
            </div>
          </div>
        {/if}
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
  section[id]:target {
    outline: 2px solid rgb(16 185 129 / 0.6);
    outline-offset: 2px;
    background: rgb(16 185 129 / 0.06);
  }
</style>
