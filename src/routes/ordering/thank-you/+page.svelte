<script>
  import { fade, fly, scale } from "svelte/transition";
  import { onMount } from "svelte";
  import { page } from "$app/stores";

  let mounted = false;
  onMount(() => requestAnimationFrame(() => (mounted = true)));

  const isReduced =
    typeof matchMedia !== "undefined" &&
    matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Match the same animation timing pattern from the ordering page
  const DUR_MULT = 3;
  const DELAY_MULT = 1;
  const T = (ms) => (isReduced ? 0 : Math.round(ms * DUR_MULT));
  const D = (ms) => (isReduced ? 0 : Math.round(ms * DELAY_MULT));

  // Small helper offsets for staggered fly-ins (kept for consistency)
  const sx = (i) => [-12, 10, -8, 8, -6][i % 5];
  const sy = (i) => [10, 8, 12, 9, 11][i % 5];

  // Read the order reference from the query string
  $: ref = $page.url.searchParams.get("ref");

  function copyRef() {
    if (!ref || typeof navigator?.clipboard?.writeText !== "function") return;
    navigator.clipboard.writeText(ref).catch(() => {});
  }
</script>

<!-- HERO (same background + gradient treatment) -->
<section class="relative isolate">
  <div
    class="absolute inset-0 -z-10 bg-cover bg-center"
    style="background-image:url('/images/about-bg.jpg')"
    aria-hidden="true"
  ></div>
  <div
    class="absolute inset-0 -z-10 bg-gradient-to-b from-emerald-800/90 via-emerald-700/70 to-emerald-600/60 -mt-10"
    aria-hidden="true"
  ></div>

  <div class="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 pt-16 pb-14 sm:pt-20 sm:pb-20">
    {#if mounted}
      <div in:fade={{ duration: T(320) }}>
        <div class="mx-auto max-w-3xl text-center text-white" in:scale={{ duration: T(360), start: 0.985 }}>
          <p
            class="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] sm:text-xs font-medium ring-1 ring-white/20 backdrop-blur"
            in:fly={{ y: 10, duration: T(340), delay: D(40) }}
          >
            <span class="h-1.5 w-1.5 rounded-full bg-emerald-300"></span>
            Order received · We’ll be in touch shortly
          </p>

          <h1
            class="mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight"
            in:fly={{ y: 12, duration: T(400), delay: D(110) }}
          >
            Thank You
          </h1>

          <p
            class="mt-4 text-sm sm:text-base lg:text-lg text-white/90"
            in:fly={{ y: 10, duration: T(360), delay: D(200) }}
          >
            We’ve received your order request. Our Customer Service team will reach out to confirm
            items, sizes, quantities, and shipping details.
          </p>
        </div>
      </div>
    {/if}
  </div>
</section>

<!-- CONFIRMATION CARD -->
<section class="relative w-full">
  <div class="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
    {#if mounted}
      <div in:fade={{ duration: T(360), delay: D(60) }}>
        <div
          class="rounded-2xl border border-slate-200 bg-white shadow-sm w-full min-w-0"
          in:scale={{ duration: T(360), delay: D(60), start: 0.99 }}
        >
          <div class="p-6 sm:p-10">
            <div
              class="mx-auto max-w-2xl text-center"
              in:fly={{ x: sx(0), y: sy(0), duration: T(320), delay: D(120) }}
            >
              <div class="inline-flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>

              <h2 class="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Order Request Submitted
              </h2>

              {#if ref}
                <div class="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800 ring-1 ring-emerald-200">
                  <span class="uppercase">Reference:</span>
                  <code class="font-mono">{ref}</code>
                  <button
                    type="button"
                    class="rounded-md border border-emerald-300 px-2 py-0.5 text-[11px] hover:bg-emerald-100"
                    on:click={copyRef}
                    title="Copy reference"
                  >
                    Copy
                  </button>
                </div>
              {/if}

              <p class="mt-3 text-slate-600">
                A confirmation email has been sent to the address you provided. If you need to update
                anything, reply directly to that email or contact us below.
              </p>
            </div>

            <!-- Helpful links / next steps -->
            <div class="mt-8 grid gap-4 sm:grid-cols-2">
              <a
                href="/catalog"
                class="group flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 hover:bg-slate-100 transition"
                in:fly={{ x: sx(1), y: sy(1), duration: T(300), delay: D(180) }}
              >
                <div class="min-w-0">
                  <p class="font-medium text-slate-900">Continue Browsing the Catalog</p>
                  <p class="text-sm text-slate-600">Explore product families, sizes, and specifications.</p>
                </div>
                <span aria-hidden="true" class="ml-4">→</span>
              </a>

              <a
                href={"mailto:custsupport@maramed.com" + (ref ? `?subject=Order%20Reference%20${encodeURIComponent(ref)}` : "")}
                class="group flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 hover:bg-slate-100 transition"
                in:fly={{ x: sx(2), y: sy(2), duration: T(300), delay: D(200) }}
              >
                <div class="min-w-0">
                  <p class="font-medium text-slate-900">Contact Customer Service</p>
                  <p class="text-sm text-slate-600">custsupport@maramed.com · (305) 823-8304</p>
                </div>
                <span aria-hidden="true" class="ml-4">→</span>
              </a>
            </div>

            <!-- Actions -->
            <div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
                 in:fade={{ duration: T(260), delay: D(240) }}>
              <a
                href="/"
                class="inline-flex items-center rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-black"
              >
                Back to Home
              </a>
              <a
                href="/ordering"
                class="inline-flex items-center rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50"
              >
                Submit Another Order
              </a>
            </div>

            <p class="mt-6 text-center text-xs text-slate-500">
              Orders ship from Miami, FL. Standard method is UPS Ground unless otherwise specified.
            </p>
          </div>
        </div>
      </div>
    {/if}
  </div>
</section>

<style>
  .min-w-0 { min-width: 0; }
</style>
