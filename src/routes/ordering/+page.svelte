<script>
  import { enhance, applyAction } from "$app/forms";
  import { fade, fly, scale } from "svelte/transition";
  import { onMount, tick } from "svelte";
  import catalog from "$lib/data/products.json";

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

  // SKU groups by family
  function buildSkuGroups() {
    const groups = [];
    const dict = catalog?.families;

    if (dict && !Array.isArray(dict)) {
      for (const [famKey, famVal] of Object.entries(dict)) {
        const familyKey = famVal?.key || famKey;
        const familyTitle = famVal?.title || famKey;
        const items = famVal?.items ?? [];

        if (!items.length) continue;

        groups.push({
          familyKey,
          familyTitle,
          items: items
            .map((it) => {
              const sku = String(it?.sku ?? it?.itemNumber ?? "").trim();

              return {
                sku,
                familyKey,
                familyTitle,
                size: it?.size || it?.Size || "",
                side: it?.side || "",
                description: it?.description || it?.Description || "",
                group: it?.group || ""
              };
            })
            .filter((it) => it.sku)
        });
      }
    }

    return groups.sort((a, b) => a.familyTitle.localeCompare(b.familyTitle));
  }

  const SKU_GROUPS = buildSkuGroups();

  const SKU_INDEX = new Map();
  for (const group of SKU_GROUPS) {
    for (const item of group.items) {
      if (!SKU_INDEX.has(item.sku)) {
        SKU_INDEX.set(item.sku, item);
      }
    }
  }

  function getFamilyItems(familyKey) {
    return SKU_GROUPS.find((g) => g.familyKey === familyKey)?.items ?? [];
  }

  function describeSku(sku) {
    const hit = SKU_INDEX.get(String(sku || "").trim());
    if (!hit) return "";

    return `${hit.familyTitle}${hit.size ? " · " + hit.size : ""}${hit.side ? " · " + hit.side : ""}${hit.description ? " · " + hit.description : ""}`;
  }

  let orderRows = [{ familyKey: "", sku: "", description: "", qty: 1 }];

  function addRow() {
    orderRows = [...orderRows, { familyKey: "", sku: "", description: "", qty: 1 }];
  }

  function removeRow(i) {
    orderRows =
      orderRows.length === 1
        ? [{ familyKey: "", sku: "", description: "", qty: 1 }]
        : orderRows.filter((_, idx) => idx !== i);
  }

  function onFamilyChange(i, familyKey) {
    orderRows[i].familyKey = familyKey;
    orderRows[i].sku = "";
    orderRows[i].description = "";
  }

  function onSkuSelect(i, sku) {
    const v = String(sku || "").trim();
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

  $: orderItemsSerialized = serializeOrderRows(orderRows);

  let sending = false;
  let errorMsg = "";
  let agree = false;

  async function showTopError(msg) {
    errorMsg = msg;
    await tick();

    const el = document.getElementById("formErrorTop");

    if (el) {
      try {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      } catch {
        window.scrollTo(0, 0);
      }

      setTimeout(() => el.focus({ preventScroll: true }), 150);
      history.replaceState(null, "", "#formErrorTop");
    } else {
      try {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } catch {
        window.scrollTo(0, 0);
      }
    }
  }

  async function handleSubmit(e) {
    const form = e.currentTarget;
    const valid = form.checkValidity();
    const termsOk = !!form.querySelector("#agree")?.checked;

    if (!valid || !termsOk) {
      e.preventDefault();

      await showTopError(
        !termsOk
          ? "Please agree to Maramed’s Terms of Sale before submitting."
          : "Please check the required fields and try again."
      );

      form.reportValidity?.();

      const target = !termsOk ? form.querySelector("#agree") : form.querySelector(":invalid");
      setTimeout(() => target?.focus({ preventScroll: true }), 200);
    }
  }
</script>

<!-- hero -->
<section class="relative isolate">
  <div class="absolute inset-0 -z-10 bg-cover bg-center" aria-hidden="true"></div>

  <div class="absolute inset-0 -z-10 bg-emerald-800/85 -mt-10" aria-hidden="true"></div>

  <div class="absolute inset-0 -z-10 ring-1 ring-inset ring-black/10 -mt-10" aria-hidden="true"></div>

  <div class="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 pt-16 pb-14 sm:pt-20 sm:pb-20">
    {#if mounted}
      <div in:fade={{ duration: T(320) }}>
        <div class="mx-auto max-w-3xl text-center text-white" in:scale={{ duration: T(360), start: 0.985 }}>
          <h1 class="mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight" in:fly={{ y: 12, duration: T(400), delay: D(110) }}>
            Ordering &amp; Reimbursement
          </h1>
        </div>
      </div>
    {/if}
  </div>

  <section class="relative w-full">
    <div class="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 pb-14 sm:pb-20">
      {#if mounted}
        <div class="grid gap-6 lg:grid-cols-2" in:fade={{ duration: T(320) }}>
          <div class="rounded-2xl border border-slate-200 bg-white shadow-sm" in:scale={{ duration: T(360), delay: D(60), start: 0.99 }}>
            <div class="p-6 sm:p-8">
              <h3 class="text-xl font-semibold text-slate-900" in:fly={{ y: 10, duration: T(320), delay: D(100) }}>Terms of Sale</h3>

              <ul class="mt-3 space-y-2 text-slate-700">
                <li in:fly={{ x: -10, y: 10, duration: T(300), delay: D(150) }}>Shipment: F.O.B. Miami, Florida</li>
                <li in:fly={{ x: 8, y: 10, duration: T(300), delay: D(170) }}>Prices and Terms of Sale subject to change without notice.</li>
                <li in:fly={{ x: -8, y: 10, duration: T(300), delay: D(190) }}>
                  Request a <em>Return Authorization Number (RA#)</em> before all returns and place it on the shipping label. Unauthorized returns will not be accepted. A 20% restocking fee applies to all approved returns.
                </li>
                <li in:fly={{ x: 10, y: 8, duration: T(300), delay: D(210) }}>
                  All major credit cards are accepted. A 3.5% credit card processing fee applies to all card payments.
                </li>
                <li in:fly={{ x: -10, y: 8, duration: T(300), delay: D(230) }}>Orders may ship C.O.D. until an account is established. Terms: Net 30 Days.</li>
              </ul>
            </div>
          </div>

          <div class="rounded-2xl border border-slate-200 bg-white shadow-sm" in:scale={{ duration: T(360), delay: D(80), start: 0.99 }}>
            <div class="p-6 sm:p-8">
              <h3 class="text-xl font-semibold text-slate-900" in:fly={{ y: 10, duration: T(320), delay: D(120) }}>Customer Service Hours</h3>

              <div class="mt-3 space-y-2 text-slate-700" in:fade={{ duration: T(280), delay: D(150) }}>
                <p><strong>Hours:</strong> Monday–Friday, 8:00 AM – 4:30 PM (EST)</p>
                <p><strong>Phone:</strong> (305) 823-8300</p>
                <p><strong>Fax:</strong> (305) 823-8304</p>
                <p>
                  <strong>Email:</strong>
                  <a class="text-emerald-700 underline" href="mailto:custsupport@maramed.com">
                    custsupport@maramed.com
                  </a>
                </p>
              </div>

              <div class="mt-6">
                <h3 class="text-xl font-semibold text-slate-900" in:fly={{ y: 10, duration: T(320), delay: D(180) }}>Shipping</h3>
                <p class="mt-2 text-slate-700" in:fade={{ duration: T(280), delay: D(210) }}>
                  *Most orders ship the same business day, subject to product availability. Standard shipping methods include UPS Ground and FedEx Ground unless alternate shipping arrangements are requested.
                </p>
              </div>

              <div class="mt-6">
                <p class="mt-2 text-red-700 font-bold text-lg" in:fade={{ duration: T(280), delay: D(210) }}>
                  **Maramed sells to licensed professionals and distributors only.
                </p>
              </div>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </section>
</section>

<!-- order form -->
<section class="relative w-full">
  <div class="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
    {#if mounted}
      <div in:fade={{ duration: T(360), delay: D(60) }}>
        <div class="rounded-2xl border border-slate-200 bg-white shadow-sm w-full min-w-0" in:scale={{ duration: T(360), delay: D(60), start: 0.99 }}>
          <div class="p-6 sm:p-8">
            {#if errorMsg}
              <div
                id="formErrorTop"
                tabindex="-1"
                role="alert"
                aria-live="assertive"
                class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800"
                in:fade={{ duration: T(200) }}
              >
                {errorMsg}
              </div>
            {/if}

            <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Submit an Order</h2>
            <p class="mt-1 text-slate-600">Choose a product family, select the item number, then enter quantity.</p>

            <form
              method="POST"
              action="?/send"
              novalidate
              on:submit|capture={handleSubmit}
              class="mt-5"
              use:enhance={({ form }) => {
                const hidden = form?.querySelector('textarea[name="orderItems"]');
                if (hidden) hidden.value = orderItemsSerialized;

                sending = true;
                errorMsg = "";

                return async ({ result }) => {
                  sending = false;
                  await applyAction(result);

                  if (result?.type === "failure") {
                    await showTopError(result?.data?.error || "Please check the required fields and try again.");
                  } else if (result?.type === "error") {
                    await showTopError(result?.error?.message || "Something went wrong submitting the form.");
                  }
                };
              }}
            >
              <input type="text" name="fax" class="hidden" tabindex="-1" autocomplete="off" />

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {#each [
                  { name: "company", label: "Company / Practice", type: "text", req: false },
                  { name: "contactName", label: "Contact name", type: "text", req: true },
                  { name: "email", label: "Email", type: "email", req: true },
                  { name: "phone", label: "Phone", type: "tel", req: false }
                ] as f, i}
                  <div class="min-w-0" in:fly={{ x: sx(i), y: sy(i), duration: T(300), delay: D(80 + i * 30) }}>
                    <label for={f.name} class="block text-sm font-medium text-slate-700">
                      {f.label}{#if f.req}<span class="req-star" aria-hidden="true"></span>{/if}
                    </label>
                    <input
                      id={f.name}
                      name={f.name}
                      type={f.type}
                      class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                      required={f.req}
                    />
                  </div>
                {/each}
              </div>

              <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div in:fly={{ x: sx(4), y: sy(4), duration: T(300), delay: D(180) }}>
                  <label for="poNumber" class="block text-sm font-medium text-slate-700">PO Number (optional)</label>
                  <input id="poNumber" name="poNumber" type="text" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500" />
                </div>

                <div in:fly={{ x: sx(5), y: sy(5), duration: T(300), delay: D(200) }}>
                  <label for="shipMethod" class="block text-sm font-medium text-slate-700">Requested ship method</label>
                  <select
                    id="shipMethod"
                    name="shipMethod"
                    class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                  >
                    <optgroup label="UPS">
                      <option selected>UPS Ground (default)</option>
                      <option>UPS 3 Day Select</option>
                      <option>UPS 2nd Day Air</option>
                      <option>UPS Next Day Air Saver</option>
                      <option>UPS Next Day Air</option>
                    </optgroup>
                    <optgroup label="FedEx">
                      <option>FedEx Ground / Home Delivery</option>
                      <option>FedEx Express Saver (3 Day)</option>
                      <option>FedEx 2Day</option>
                      <option>FedEx Standard Overnight</option>
                      <option>FedEx Priority Overnight</option>
                    </optgroup>
                    <option>Customer Freight Account (enter carrier & account in notes)</option>
                    <option>Other (enter in notes)</option>
                  </select>
                </div>
              </div>

              <div class="mt-6" in:fly={{ x: -12, y: 10, duration: T(320), delay: D(220) }}>
                <h3 class="text-lg font-semibold text-slate-900">Shipping address</h3>

                <div class="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div class="sm:col-span-2">
                    <label for="shipAddress1" class="block text-sm font-medium text-slate-700">
                      Address line 1 <span class="req-star" aria-hidden="true"></span>
                    </label>
                    <input id="shipAddress1" name="shipAddress1" required class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500" />
                  </div>

                  <div class="sm:col-span-2">
                    <label for="shipAddress2" class="block text-sm font-medium text-slate-700">Address line 2 (optional)</label>
                    <input id="shipAddress2" name="shipAddress2" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500" />
                  </div>

                  <div>
                    <label for="shipCity" class="block text-sm font-medium text-slate-700">
                      City <span class="req-star" aria-hidden="true"></span>
                    </label>
                    <input id="shipCity" name="shipCity" required class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500" />
                  </div>

                  <div>
                    <label for="shipState" class="block text-sm font-medium text-slate-700">
                      State / Province <span class="req-star" aria-hidden="true"></span>
                    </label>
                    <input id="shipState" name="shipState" required class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500" />
                  </div>

                  <div>
                    <label for="shipZip" class="block text-sm font-medium text-slate-700">
                      ZIP / Postal code <span class="req-star" aria-hidden="true"></span>
                    </label>
                    <input id="shipZip" name="shipZip" required class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500" />
                  </div>

                  <div>
                    <label for="shipCountry" class="block text-sm font-medium text-slate-700">Country</label>
                    <input id="shipCountry" name="shipCountry" value="USA" class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500" />
                  </div>
                </div>
              </div>

              <div class="mt-6 min-w-0" in:fly={{ x: -10, y: 12, duration: T(320), delay: D(260) }}>
                <h3 id="orderListHeading" class="block text-sm font-medium text-slate-700">Order list</h3>

                <div class="mt-2 overflow-x-auto">
                  <table class="w-full text-sm border border-slate-200 rounded-lg overflow-hidden" aria-labelledby="orderListHeading">
                    <thead class="bg-slate-50">
                      <tr class="text-left text-slate-600 border-b border-slate-200">
                        <th class="py-2 px-3 w-[40%]">Product / Item Number <span class="req-star" aria-hidden="true"></span></th>
                        <th class="py-2 px-3 w-[45%]">Description</th>
                        <th class="py-2 px-3 w-[15%] text-right">Qty <span class="req-star" aria-hidden="true"></span></th>
                        <th class="py-2 px-3 w-[0]"></th>
                      </tr>
                    </thead>

                    <tbody>
                      {#each orderRows as row, i}
                        <tr class="border-b border-slate-100">
                          <td class="py-2 px-3 align-top">
                            <div class="grid gap-2">
                              <select
                                class="w-full rounded-md border border-slate-300 px-2 py-1 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                                bind:value={orderRows[i].familyKey}
                                on:change={(e) => onFamilyChange(i, e.currentTarget.value)}
                                required
                              >
                                <option value="">Choose product family</option>
                                {#each SKU_GROUPS as group}
                                  <option value={group.familyKey}>{group.familyTitle}</option>
                                {/each}
                              </select>

                              <select
                                id={"sku_" + i}
                                class="w-full rounded-md border border-slate-300 px-2 py-1 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 disabled:bg-slate-100 disabled:text-slate-400"
                                bind:value={orderRows[i].sku}
                                on:change={(e) => onSkuSelect(i, e.currentTarget.value)}
                                disabled={!orderRows[i].familyKey}
                                required
                              >
                                <option value="">Choose item number</option>
                                {#each getFamilyItems(orderRows[i].familyKey) as item}
                                  <option value={item.sku}>
                                    {item.sku}{item.size ? ` — ${item.size}` : ""}{item.side ? ` · ${item.side}` : ""}{item.group ? ` · ${item.group}` : ""}
                                  </option>
                                {/each}
                              </select>
                            </div>
                          </td>

                          <td class="py-2 px-3 align-top">
                            <input
                              class="w-full rounded-md border border-slate-300 px-2 py-1 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                              placeholder="Auto-filled from catalog (editable)"
                              bind:value={orderRows[i].description}
                            />
                          </td>

                          <td class="py-2 px-3 align-top text-right">
                            <input
                              id={"qty_" + i}
                              type="number"
                              min="1"
                              step="1"
                              inputmode="numeric"
                              class="w-24 rounded-md border border-slate-300 px-2 py-1 text-right shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
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

                <p class="mt-1 text-xs text-slate-500">
                  Select the product family first, then choose the item number.
                </p>

                <textarea name="orderItems" class="hidden" readonly bind:value={orderItemsSerialized}></textarea>
              </div>

              <div class="mt-4 min-w-0" in:fly={{ x: 10, y: 10, duration: T(300), delay: D(280) }}>
                <label for="notes" class="block text-sm font-medium text-slate-700">Notes for Customer Service (optional)</label>
                <textarea
                  id="notes"
                  name="notes"
                  rows="4"
                  class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                  placeholder="Delivery instructions, freight account, deadline, etc."
                ></textarea>
              </div>

              <div class="mt-4 flex items-center gap-2 text-sm" in:fade={{ duration: T(260), delay: D(300) }}>
                <input
                  id="agree"
                  name="agree"
                  type="checkbox"
                  bind:checked={agree}
                  required
                  aria-required="true"
                  aria-describedby="agree-help"
                  class="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label for="agree" class="text-slate-700">
                  <span class="req-star" aria-hidden="true"></span> I agree to Maramed’s Terms of Sale.
                </label>
              </div>

              <p id="agree-help" class="mt-1 text-xs text-slate-500">Required to submit your order.</p>

              <div class="mt-6 flex items-center justify-between" in:fade={{ duration: T(260), delay: D(320) }}>
                <p class="text-xs text-slate-500">Orders ship from Miami, FL.</p>

                <button
                  type="submit"
                  class="inline-flex items-center rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-black disabled:opacity-60 disabled:cursor-not-allowed"
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
  .min-w-0 {
    min-width: 0;
  }

  .req-star::after {
    content: " *";
    color: #dc2626;
    font-weight: 600;
  }

  #formErrorTop {
    scroll-margin-top: 80px;
  }

  :global(:where(input, select, textarea)[data-invalid="true"]) {
    border-color: #dc2626 !important;
    box-shadow: 0 0 0 1px #dc2626;
  }

  :global(label[data-invalid-label="true"]) {
    color: #dc2626 !important;
  }
</style>