<script>
  
  import { fade, fly, scale } from "svelte/transition";
  import { onMount } from "svelte";
  import { page } from "$app/stores";

  // state
  let mounted = false;
  onMount(() => requestAnimationFrame(() => (mounted = true)));
  $: ref = $page.url.searchParams.get("ref");

  // motion config
  const isReduced =
    typeof matchMedia !== "undefined" &&
    matchMedia("(prefers-reduced-motion: reduce)").matches;
  const T = (ms) => (isReduced ? 0 : Math.round(ms * 3));
  const D = (ms) => (isReduced ? 0 : Math.round(ms));
  const sx = (i) => [-12, 10, -8, 8, -6][i % 5];
  const sy = (i) => [10, 8, 12, 9, 11][i % 5];
</script>

<!-- hero -->
<section class="relative isolate">
  <div class="absolute inset-0 -z-10 bg-cover bg-center" aria-hidden="true"></div>
  <div class="absolute inset-0 -z-10 bg-gradient-to-b from-emerald-800/90 via-emerald-700/70 to-emerald-600/60 -mt-10" aria-hidden="true"></div>

  <div class="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 pt-16 pb-14 sm:pt-20 sm:pb-20">
    {#if mounted}
      <div in:fade={{ duration: T(320) }}>
        <div class="mx-auto max-w-3xl text-center text-white" in:scale={{ duration: T(360), start: 0.985 }}>
          <p class="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] sm:text-xs font-medium ring-1 ring-white/20 backdrop-blur" in:fly={{ y: 10, duration: T(340), delay: D(40) }}>
            <span class="h-1.5 w-1.5 rounded-full bg-emerald-300"></span>
            Message received · We’ll be in touch shortly
          </p>
          <h1 class="mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight" in:fly={{ y: 12, duration: T(400), delay: D(110) }}>
            Thank You
          </h1>
          <p class="mt-4 text-sm sm:text-base lg:text-lg text-white/90" in:fly={{ y: 10, duration: T(360), delay: D(200) }}>
            We’ve received your message. Our team will reply as soon as possible.
            {#if ref}<br />Reference: <span class="font-semibold">{ref}</span>{/if}
          </p>
        </div>
      </div>
    {/if}
  </div>
</section>

<!-- body -->
<section class="relative w-full">
  <div class="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
    {#if mounted}
      <div in:fade={{ duration: T(360), delay: D(60) }}>
        <div class="rounded-2xl border border-slate-200 bg-white shadow-sm w-full min-w-0" in:scale={{ duration: T(360), delay: D(60), start: 0.99 }}>
          <div class="p-6 sm:p-10">
            <div class="mx-auto max-w-2xl text-center" in:fly={{ x: sx(0), y: sy(0), duration: T(320), delay: D(120) }}>
              <div class="inline-flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h2 class="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Message Sent
              </h2>
              <p class="mt-2 text-slate-600">
                A confirmation has been sent to your email (if provided). If you need to add anything,
                just reply to that message.
              </p>
            </div>

            <div class="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <a href="/" class="inline-flex items-center rounded-xl bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-black">Back to Home</a>
              <a href="/contact" class="inline-flex items-center rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50">Send Another Message</a>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</section>

<style>
  .min-w-0 { min-width: 0; }
</style>
