<script>
  import { enhance, applyAction } from "$app/forms";   // applyAction auto-follows redirects
  import { fade, fly, scale } from "svelte/transition";
  import { onMount } from "svelte";
  import catalog from "$lib/data/products.json"; // pulls SKUs for the datalist

  export let data;
  const featured = data?.featured ?? [];

  const imgSrc = (p) => {
    if (!p) return "";
    if (/^(https?:)?\/\//.test(p)) return p;
    if (p.startsWith("/")) return p;
    if (p.startsWith("images/")) return `/${p}`;
    return `/images/${p}`;
  };

  let mounted = false;
  onMount(() => requestAnimationFrame(() => (mounted = true)));

  const isReduced =
    typeof matchMedia !== "undefined" &&
    matchMedia("(prefers-reduced-motion: reduce)").matches;

  const DUR_MULT = 3;
  const DELAY_MULT = 1;
  const T = (ms) => (isReduced ? 0 : Math.round(ms * DUR_MULT));
  const D = (ms) => (isReduced ? 0 : Math.round(ms * DELAY_MULT));

  const sx = (i) => [-12, 10, -8, 8, -6][i % 5];
  const sy = (i) => [10, 8, 12, 9, 11][i % 5];

  /* ===== SKU index from catalog ===== */
  function buildSkuIndex() {
    const idx = new Map();
    const add = (sku, entry) => {
      const key = String(sku || "").trim();
      if (!key) return;
      if (!idx.has(key)) idx.set(key, { sku: key, ...entry });
    };

    // top-level dictionary (preferred)
    const dict = catalog?.families;
    if (dict && !Array.isArray(dict)) {
      for (const [famKey, famVal] of Object.entries(dict)) {
        const familyTitle = famVal?.title || famKey;
        for (const it of famVal?.items ?? []) {
          add(it?.sku ?? it?.itemNumber, {
            familyKey: famVal?.key || famKey,
            familyTitle,
            size: it?.size || "",
            side: it?.side || "",
          });
        }
      }
    }

    // legacy series fallback
    for (const s of catalog?.series ?? []) {
      for (const fam of s?.families ?? []) {
        const familyTitle = fam?.title || fam?.key || fam?.slug || "";
        for (const it of fam?.items ?? []) {
          add(it?.sku ?? it?.itemNumber, {
            familyKey: fam?.key || fam?.slug || familyTitle,
            familyTitle,
            size: it?.size || "",
            side: it?.side || "",
          });
        }
      }
    }

    return idx;
  }

  const SKU_INDEX = buildSkuIndex();
  const SKU_OPTIONS = Array.from(SKU_INDEX.values()).map((v) => ({
    sku: v.sku,
    label:
      `${v.sku} — ${v.familyTitle}` +
      (v.size ? ` · ${v.size}` : "") +
      (v.side ? ` · ${v.side}` : ""),
  }));

  function describeSku(sku) {
    const hit = SKU_INDEX.get(String(sku || "").trim());
    if (!hit) return "";
    return `${hit.familyTitle}${hit.size ? " · " + hit.size : ""}${hit.side ? " · " + hit.side : ""}`;
  }

  /* ===== Order rows state ===== */
  let orderRows = [{ sku: "", description: "", qty: 1 }];

  function addRow() {
    orderRows = [...orderRows, { sku: "", description: "", qty: 1 }];
  }
  function removeRow(i) {
    if (orderRows.length === 1) {
      orderRows = [{ sku: "", description: "", qty: 1 }];
    } else {
      orderRows = orderRows.filter((_, idx) => idx !== i);
    }
  }
  function onSkuInput(i, val) {
    const v = String(val || "").trim();
    orderRows[i].sku = v;
    orderRows[i].description = v ? describeSku(v) : "";
  }
  function onQtyInput(i, val) {
    const n = Number(val);
    orderRows[i].qty = Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
  }
  function serializeOrderRows(rows) {
    return rows
      .filter((r) => (r.sku || "").trim())
      .map((r) => `${r.sku} | ${r.description || ""} | ${r.qty || 1}`)
      .join("\n");
  }

  // form state
  let sending = false;
  let sent = false;       // kept for completeness (not used after redirect)
  let errorMsg = "";

  $: orderItemsSerialized = serializeOrderRows(orderRows);
</script>

<!-- HERO -->
<section class="relative isolate">
  <div class="absolute inset-0 -z-10 bg-cover bg-center" style="background-image:url('/images/about-bg.jpg')" aria-hidden="true"></div>
  <div class="absolute inset-0 -z-10 bg-gradient-to-b from-emerald-800/90 via-emerald-700/70 to-emerald-600/60 -mt-10" aria-hidden="true"></div>

  <div class="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 pt-16 pb-14 sm:pt-20 sm:pb-20">
    {#if mounted}
      <div in:fade={{ duration: T(320) }}>
        <div class="mx-auto max-w-3xl text-center text-white" in:scale={{ duration: T(360), start: 0.985 }}>
          <p class="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] sm:text-xs font-medium ring-1 ring-white/20 backdrop-blur" in:fly={{ y: 10, duration: T(340), delay: D(40) }}>
            <span class="h-1.5 w-1.5 rounded-full bg-emerald-300"></span>
            Net 30 · Same-day shipping on most orders
          </p>
          <h1 class="mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight" in:fly={{ y: 12, duration: T(400), delay: D(110) }}>
            Ordering &amp; Reimbursement
          </h1>
          <p class="mt-4 text-sm sm:text-base lg:text-lg text-white/90" in:fly={{ y: 10, duration: T(360), delay: D(200) }}>
            Submit orders below. Terms of sale, customer service hours, and shipping information are included on this page.
          </p>
        </div>
      </div>
    {/if}
  </div>

  <!-- TERMS / HOURS / SHIPPING -->
  <section class="relative w-full">
    <div class="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 pb-14 sm:pb-20">
      {#if mounted}
        <div class="grid gap-6 lg:grid-cols-2" in:fade={{ duration: T(320) }}>
          <div class="rounded-2xl border border-slate-200 bg-white shadow-sm" in:scale={{ duration: T(360), delay: D(60), start: 0.99 }}>
            <div class="p-6 sm:p-8">
              <h3 class="text-xl font-semibold text-slate-900" in:fly={{ y: 10, duration: T(320), delay: D(100) }}>Terms of Sale</h3>
              <ul class="mt-3 space-y-2 text-slate-700">
                <li in:fly={{ x: 10, y: 8, duration: T(300), delay: D(130) }}>Accounts past due 30 days after delivery. Delinquent accounts assessed 1.5% per month (18% annual).</li>
                <li in:fly={{ x: -10, y: 10, duration: T(300), delay: D(150) }}>Shipment: F.O.B. Miami, Florida</li>
                <li in:fly={{ x: 8, y: 10, duration: T(300), delay: D(170) }}>Prices and Terms of Sale subject to change without notice.</li>
                <li in:fly={{ x: -8, y: 10, duration: T(300), delay: D(190) }}>Request a <em>Return Authorization Number</em> before all returns and place it on the shipping label. Unauthorized returns will not be accepted.</li>
                <li in:fly={{ x: 10, y: 8, duration: T(300), delay: D(210) }}>Now accepting American Express, Mastercard, Visa and Discover.</li>
                <li in:fly={{ x: -10, y: 8, duration: T(300), delay: D(230) }}>Orders may ship C.O.D. until an account is established. Terms: Net 30 Days.</li>
                <li in:fly={{ x: 8, y: 8, duration: T(300), delay: D(250) }}>Pay by invoice. Statements are mailed monthly.</li>
              </ul>
            </div>
          </div>

          <div class="rounded-2xl border border-slate-200 bg-white shadow-sm" in:scale={{ duration: T(360), delay: D(80), start: 0.99 }}>
            <div class="p-6 sm:p-8">
              <h3 class="text-xl font-semibold text-slate-900" in:fly={{ y: 10, duration: T(320), delay: D(120) }}>Customer Service Hours</h3>
              <p class="mt-2 text-slate-700" in:fade={{ duration: T(280), delay: D(150) }}>
                Monday–Friday, 8 AM – 5 PM (EST). 24-hour fax: (305) 823-8304.
                Email: <a class="text-emerald-700 underline" href="mailto:custsupport@maramed.com">custsupport@maramed.com</a>
              </p>
              <div class="mt-6">
                <h3 class="text-xl font-semibold text-slate-900" in:fly={{ y: 10, duration: T(320), delay: D(180) }}>Shipping</h3>
                <p class="mt-2 text-slate-700" in:fade={{ duration: T(280), delay: D(210) }}>
                  *Maramed offers same-day shipment on most orders at no additional charge.
                  Standard method is UPS Ground unless otherwise specified.
                </p>
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </section>
</section>

<!-- ORDER FORM -->
<section class="relative w-full">
  <div class="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
    {#if mounted}
      <div in:fade={{ duration: T(360), delay: D(60) }}>
        <div class="rounded-2xl border border-slate-200 bg-white shadow-sm w-full min-w-0" in:scale={{ duration: T(360), delay: D(60), start: 0.99 }}>
          <div class="p-6 sm:p-8">

            {#if errorMsg}
              <div class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800" in:fade={{ duration: T(200) }} aria-live="polite">
                {errorMsg}
              </div>
            {/if}

            <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Submit an Order</h2>
            <p class="mt-1 text-slate-600">Include SKUs, sizes, quantities, and your preferred shipping method.</p>

            <form
              method="POST"
              action="?/send"
              novalidate
              class="mt-5"
              use:enhance={(event) => {
                const { form } = event;

                // UI state
                sending = true;
                sent = false;
                errorMsg = "";

                // serialize dynamic rows into the hidden textarea before submit
                const hidden = form?.querySelector('textarea[name="orderItems"]');
                if (hidden) hidden.value = orderItemsSerialized;

                // Return a handler for the result of the action
                return async ({ result }) => {
                  sending = false;

                  // SvelteKit applies the action (follows 303 redirects, updates form state)
                  await applyAction(result);

                  // Optional: surface errors if it wasn't a redirect
                  if (result?.type === "failure") {
                    errorMsg = result?.data?.error || "Please check the required fields and try again.";
                  } else if (result?.type === "error") {
                    errorMsg = result?.error?.message || "Something went wrong submitting the form.";
                  }
                };
              }}
            >
              <!-- Honeypot -->
              <input type="text" name="fax" class="hidden" tabindex="-1" autocomplete="off" />

              <!-- Customer -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {#each [
                  { name: 'company',    label: 'Company / Practice', type: 'text',  req: false },
                  { name: 'contactName',label: 'Contact name',       type: 'text',  req: true  },
                  { name: 'email',      label: 'Email',              type: 'email', req: true  },
                  { name: 'phone',      label: 'Phone',              type: 'tel',   req: false }
                ] as f, i}
                  <div class="min-w-0" in:fly={{ x: sx(i), y: sy(i), duration: T(300), delay: D(80 + i*30) }}>
                    <label for={f.name} class="block text-sm font-medium text-slate-700">{f.label}</label>
                    <input
                      id={f.name} name={f.name} type={f.type}
                      class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm
                             focus:border-emerald-500 focus:ring-emerald-500"
                      required={f.req}
                    />
                  </div>
                {/each}
              </div>

              <!-- PO + Ship method -->
              <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div in:fly={{ x: sx(4), y: sy(4), duration: T(300), delay: D(180) }}>
                  <label for="poNumber" class="block text-sm font-medium text-slate-700">PO Number (optional)</label>
                  <input id="poNumber" name="poNumber" type="text" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"/>
                </div>
                <div in:fly={{ x: sx(5), y: sy(5), duration: T(300), delay: D(200) }}>
                  <label for="shipMethod" class="block text-sm font-medium text-slate-700">Requested ship method</label>
                  <select id="shipMethod" name="shipMethod" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500">
                    <option>UPS Ground (default)</option>
                    <option>UPS 2nd Day Air</option>
                    <option>UPS Next Day Air</option>
                    <option>Customer Freight Account (enter in notes)</option>
                    <option>Other (enter in notes)</option>
                  </select>
                </div>
              </div>

              <!-- Shipping address -->
              <div class="mt-6" in:fly={{ x: -12, y: 10, duration: T(320), delay: D(220) }}>
                <h3 class="text-lg font-semibold text-slate-900">Shipping address</h3>
                <div class="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="sm:col-span-2">
                    <label for="shipAddress1" class="block text-sm font-medium text-slate-700">Address line 1</label>
                    <input id="shipAddress1" name="shipAddress1" required class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"/>
                  </div>
                  <div class="sm:col-span-2">
                    <label for="shipAddress2" class="block text-sm font-medium text-slate-700">Address line 2 (optional)</label>
                    <input id="shipAddress2" name="shipAddress2" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"/>
                  </div>
                  <div>
                    <label for="shipCity" class="block text-sm font-medium text-slate-700">City</label>
                    <input id="shipCity" name="shipCity" required class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"/>
                  </div>
                  <div>
                    <label for="shipState" class="block text-sm font-medium text-slate-700">State / Province</label>
                    <input id="shipState" name="shipState" required class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"/>
                  </div>
                  <div>
                    <label for="shipZip" class="block text-sm font-medium text-slate-700">ZIP / Postal code</label>
                    <input id="shipZip" name="shipZip" required class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"/>
                  </div>
                  <div>
                    <label for="shipCountry" class="block text-sm font-medium text-slate-700">Country</label>
                    <input id="shipCountry" name="shipCountry" value="USA" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"/>
                  </div>
                </div>
              </div>

              <!-- Order list (table) -->
              <div class="mt-6 min-w-0" in:fly={{ x: -10, y: 12, duration: T(320), delay: D(260) }}>
                <label class="block text-sm font-medium text-slate-700">Order list</label>

                <div class="mt-2 overflow-x-auto">
                  <table class="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
                    <thead class="bg-slate-50">
                      <tr class="text-left text-slate-600 border-b border-slate-200">
                        <th class="py-2 px-3 w-[40%]">Item Number (SKU)</th>
                        <th class="py-2 px-3 w-[45%]">Description</th>
                        <th class="py-2 px-3 w-[15%] text-right">Qty</th>
                        <th class="py-2 px-3 w-[0]"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {#each orderRows as row, i}
                        <tr class="border-b border-slate-100">
                          <td class="py-2 px-3 align-top">
                            <input
                              list="skuOptions"
                              class="w-full rounded-md border border-slate-300 px-2 py-1 shadow-sm
                                     focus:border-emerald-500 focus:ring-emerald-500"
                              placeholder="e.g. HFB-200L"
                              bind:value={orderRows[i].sku}
                              on:input={(e) => onSkuInput(i, e.currentTarget.value)}
                              autocomplete="off"
                              required
                            />
                          </td>
                          <td class="py-2 px-3 align-top">
                            <input
                              class="w-full rounded-md border border-slate-300 px-2 py-1 shadow-sm
                                     focus:border-emerald-500 focus:ring-emerald-500"
                              placeholder="Auto-filled from catalog (editable)"
                              bind:value={orderRows[i].description}
                            />
                          </td>
                          <td class="py-2 px-3 align-top text-right">
                            <input
                              type="number" min="1" step="1" inputmode="numeric"
                              class="w-24 rounded-md border border-slate-300 px-2 py-1 text-right shadow-sm
                                     focus:border-emerald-500 focus:ring-emerald-500"
                              bind:value={orderRows[i].qty}
                              on:input={(e) => onQtyInput(i, e.currentTarget.value)}
                              required
                            />
                          </td>
                          <td class="py-2 px-3 align-top">
                            <div class="flex gap-2">
                              <button type="button" class="rounded-md border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50" on:click={() => addRow()}>
                                Add
                              </button>
                              <button type="button" class="rounded-md border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50" on:click={() => removeRow(i)}>
                                Remove
                              </button>
                            </div>
                          </td>
                        </tr>
                      {/each}
                    </tbody>
                  </table>
                </div>

                <!-- datalist powers the SKU field -->
                <datalist id="skuOptions">
                  {#each SKU_OPTIONS as opt}
                    <option value={opt.sku}>{opt.label}</option>
                  {/each}
                </datalist>

                <p class="mt-1 text-xs text-slate-500">
                  Tip: start typing a SKU to see matches.
                </p>

                <!-- Hidden payload your backend expects -->
                <textarea name="orderItems" class="hidden" readonly bind:value={orderItemsSerialized}></textarea>
              </div>

              <!-- Notes + terms -->
              <div class="mt-4 min-w-0" in:fly={{ x: 10, y: 10, duration: T(300), delay: D(280) }}>
                <label for="notes" class="block text-sm font-medium text-slate-700">Notes for Customer Service (optional)</label>
                <textarea id="notes" name="notes" rows="4"
                  class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm
                         focus:border-emerald-500 focus:ring-emerald-500"
                  placeholder="Delivery instructions, freight account, deadline, etc."
                ></textarea>
              </div>

              <div class="mt-4 flex items-center gap-2 text-sm" in:fade={{ duration: T(260), delay: D(300) }}>
                <input id="agree" name="agree" type="checkbox" required
                       class="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"/>
                <label for="agree" class="text-slate-700">
                  I agree to Maramed’s Terms of Sale.
                </label>
              </div>

              <div class="mt-6 flex items-center justify-between" in:fade={{ duration: T(260), delay: D(320) }}>
                <p class="text-xs text-slate-500">Orders ship from Miami, FL.</p>
                <button
                  type="submit"
                  class="inline-flex items-center rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white
                         hover:bg-black disabled:opacity-60"
                  disabled={sending}
                  aria-busy={sending}
                >
                  {sending ? "Sending…" : "Submit order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    {/if}
  </div>
</section>

<style>
  .min-w-0 { min-width: 0; }
</style>
