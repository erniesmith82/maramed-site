<script>
  
  import { fade, fly, scale } from "svelte/transition";
  import { onMount } from "svelte";
  import { enhance, applyAction } from "$app/forms";

  // mount gate
  let mounted = false;
  onMount(() => requestAnimationFrame(() => (mounted = true)));

  // motion config
  const isReduced =
    typeof matchMedia !== "undefined" &&
    matchMedia("(prefers-reduced-motion: reduce)").matches;
  const DUR_MULT = 3;
  const DELAY_MULT = 3;
  const T = (ms) => (isReduced ? 0 : Math.round(ms * DUR_MULT));
  const D = (ms) => (isReduced ? 0 : Math.round(ms * DELAY_MULT));
  const sx = (i) => [-12, 10, -8, 8, -6][i % 5];
  const sy = (i) => [10, 8, 12, 9, 11][i % 5];

  // form state
  let sent = false;
  let sending = false;
  let errorMsg = "";
</script>

<svelte:head>
  <!-- Primary SEO -->
  <title>Contact Maramed | Orthotic Fabrication & Central Fabrication Services in Miami</title>
  <meta
    name="description"
    content="Get in touch with Maramed’s orthotic fabrication team in Miami, Florida. Contact us for custom central fabrication, CAD/CAM milling, and orthotic component orders."
  />
  <meta
    name="keywords"
    content="Maramed contact, orthotic fabrication Miami, central fabrication, CADCAM, orthotic services, Miami orthotics, BioSculptor"
  />

  <!-- Open Graph / Social Sharing -->
  <meta property="og:title" content="Contact Maramed | Orthotic Fabrication & Central Fabrication Services in Miami" />
  <meta
    property="og:description"
    content="Reach out to Maramed for orthotic fabrication, CAD/CAM solutions, and central fabrication services. Located in Miami, Florida."
  />
  <meta property="og:image" content="/images/contact-hero.jpg" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://www.maramed.com/contact" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Contact Maramed | Orthotic Fabrication & Central Fabrication Services in Miami" />
  <meta
    name="twitter:description"
    content="Get in touch with Maramed’s team for CAD/CAM milling and orthotic fabrication services in Miami, FL."
  />
  <meta name="twitter:image" content="/images/contact-hero.jpg" />

  <!-- Canonical / Favicon -->
  <link rel="canonical" href="https://www.maramed.com/contact" />
  <link rel="icon" type="image/png" href="/favicon.png" />
</svelte:head>
<!-- background -->
<div
  class="fixed inset-0 -z-10 bg-slate-50 bg-[url('/images/bg-medspark.png')] bg-no-repeat bg-cover"
  aria-hidden="true"
></div>
<div
  class="pointer-events-none fixed inset-0 -z-10
         bg-[radial-gradient(80rem_80rem_at_80%_-10%,theme(colors.emerald.100/.30),transparent_50%),radial-gradient(70rem_70rem_at_-10%_10%,theme(colors.emerald.200/.20),transparent_55%)]"
></div>

<section class="relative w-full">
  <div class="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
    <!-- header -->
    {#if mounted}
      <div in:fade={{ duration: T(320) }}>
        <div
          class="rounded-3xl border border-emerald-800/30 bg-gradient-to-b from-emerald-700/95 to-emerald-600/90 text-white p-6 sm:p-10 shadow-sm"
          in:scale={{ duration: T(380), start: 0.985 }}
        >
          <h1
            class="text-4xl sm:text-5xl font-extrabold tracking-tight text-center"
            in:fly={{ y: 12, duration: T(420), delay: D(40) }}
          >
            Get in touch
          </h1>
          <p
            class="mt-3 max-w-2xl mx-auto text-emerald-50/90 text-center"
            in:fade={{ duration: T(360), delay: D(120) }}
          >
            Send your part list, ask about specs, or request sizing help. We’ll respond quickly.
          </p>
        </div>
      </div>
    {/if}

    <!-- content -->
    <div class="mt-8 grid gap-8 min-w-0 lg:[grid-template-columns:minmax(0,7fr)_minmax(0,5fr)]">
      <!-- form -->
      {#if mounted}
        <div class="min-w-0" in:fade={{ duration: T(360), delay: D(60) }}>
          <div
            class="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm w-full min-w-0"
            in:scale={{ duration: T(360), delay: D(60), start: 0.99 }}
          >
            {#if sent}
              <div
                class="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800"
                in:fade={{ duration: T(220) }}
                aria-live="polite"
              >
                Thanks! Your message was sent. We’ll get back to you shortly.
              </div>
            {/if}

            {#if errorMsg}
              <div
                class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800"
                in:fade={{ duration: T(200) }}
                aria-live="polite"
              >
                {errorMsg}
              </div>
            {/if}

            <form
              method="POST"
              action="?/send"
              novalidate
              use:enhance={({ form }) => {
                sending = true;
                sent = false;
                errorMsg = "";

                return async ({ result }) => {
                  sending = false;

                  // follow server redirect (if any)
                  await applyAction(result);

                  if (result?.type === "success" && result?.data?.ok) {
                    errorMsg = "";
                    sent = true;
                    form.reset();
                    return;
                  }
                  if (result?.type === "failure") {
                    errorMsg = result?.data?.error || "Please check the required fields and try again.";
                    return;
                  }
                  if (result?.type === "error") {
                    errorMsg = result?.error?.message || "Something went wrong submitting the form.";
                    return;
                  }
                  errorMsg = "Something went wrong submitting the form.";
                };
              }}
            >
              <input type="text" name="fax" class="hidden" tabindex="-1" autocomplete="off" />

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {#each [
                  { name: 'name',    label: 'Full name',    type: 'text'   },
                  { name: 'email',   label: 'Email',        type: 'email'  },
                  { name: 'company', label: 'Company',      type: 'text'   },
                  { name: 'phone',   label: 'Phone',        type: 'tel'    }
                ] as field, i}
                  <div class="min-w-0" in:fly={{ x: sx(i), y: sy(i), duration: T(300), delay: D(80 + i*30) }}>
                    <label for={field.name} class="block text-sm font-medium text-slate-700">{field.label}</label>
                    <input
                      id={field.name} name={field.name} type={field.type}
                      class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                      required={field.name === 'name' || field.name === 'email'}
                    />
                  </div>
                {/each}
              </div>

              <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="min-w-0" in:fly={{ x: sx(4), y: sy(4), duration: T(300), delay: D(200) }}>
                  <label for="subject" class="block text-sm font-medium text-slate-700">Subject</label>
                  <input
                    id="subject" name="subject" type="text"
                    class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                    placeholder="Order, sizing help, product question…"
                  />
                </div>

                <div class="min-w-0" in:fly={{ x: sx(5), y: sy(5), duration: T(300), delay: D(230) }}>
                  <label for="interest" class="block text-sm font-medium text-slate-700">Product interest (optional)</label>
                  <select
                    id="interest" name="interest"
                    class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                  >
                    <option value="">—</option>
                    <option>Wrist Hand / Thumb</option>
                    <option>Thumb Spica</option>
                    <option>Fracture Braces</option>
                    <option>AFO / Drop Foot Splints</option>
                    <option>Stockinette & Liners</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div class="mt-4 min-w-0" in:fly={{ x: -10, y: 12, duration: T(320), delay: D(260) }}>
                <label for="message" class="block text-sm font-medium text-slate-700">Message</label>
                <textarea
                  id="message" name="message" rows="6"
                  class="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                  placeholder="How can we help?"
                  required
                ></textarea>
              </div>

              <div class="mt-6 flex items-center justify-between" in:fade={{ duration: T(260), delay: D(300) }}>
                <p class="text-xs text-slate-500">We’ll never share your information.</p>
                <button
                  type="submit"
                  class="inline-flex items-center rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-black disabled:opacity-60"
                  disabled={sending}
                  aria-busy={sending}
                >
                  {sending ? "Sending…" : "Send message"}
                </button>
              </div>
            </form>
          </div>
        </div>
      {/if}

      <!-- contact card -->
      {#if mounted}
        <div class="min-w-0" in:fade={{ duration: T(360), delay: D(100) }}>
          <div
            class="rounded-2xl border border-emerald-800/30 bg-gradient-to-b from-emerald-700/95 to-emerald-600/90 text-white p-6 sm:p-8 shadow-sm h-full w-full min-w-0"
            in:scale={{ duration: T(380), delay: D(100), start: 0.985 }}
          >
            <h2 class="text-xl font-semibold" in:fly={{ y: 10, duration: T(320), delay: D(140) }}>Contact details</h2>
            <ul class="mt-3 space-y-2 text-emerald-50/90">
              <li in:fly={{ x: 10, y: 8, duration: T(300), delay: D(170) }}>
                <span class="font-semibold">Email:</span>
                <a class="underline" href="mailto:custsupport@maramed.com">custsupport@maramed.com</a>
              </li>
              <li in:fly={{ x: -10, y: 10, duration: T(300), delay: D(195) }}>
                <span class="font-semibold">Phone:</span> (305) 823-8304
              </li>
              <li in:fly={{ x: 8, y: 10, duration: T(300), delay: D(220) }}>
                <span class="font-semibold">Hours:</span> Mon–Fri · 8am–5pm (EST)
              </li>
            </ul>

            <div class="mt-6 rounded-xl bg-white/10 p-4" in:fade={{ duration: T(280), delay: D(240) }}>
              <p class="text-sm text-emerald-50/90">
                Prefer email? Include SKUs, sizes, and quantities—we’ll quote and confirm availability.
              </p>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
</section>

<style>
  .min-w-0 { min-width: 0; }
</style>
