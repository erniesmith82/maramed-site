<script>
  
  import { fade, fly, scale } from "svelte/transition";
  import { onMount } from "svelte";

  // props
  export let data;

  // reactive data
  $: study = data?.study ?? {};
  $: prev  = data?.prev ?? null;
  $: next  = data?.next ?? null;

  // mount gate
  let mounted = false;
  onMount(() => requestAnimationFrame(() => (mounted = true)));

  // motion config
  const isReduced =
    typeof matchMedia !== "undefined" &&
    matchMedia("(prefers-reduced-motion: reduce)").matches;
  const DUR_MULT = 3;
  const DELAY_MULT = 1;
  const T = (ms) => (isReduced ? 0 : Math.round(ms * DUR_MULT));
  const D = (ms) => (isReduced ? 0 : Math.round(ms * DELAY_MULT));
  const sx = (i) => [-12, 10, -8, 8, -6][i % 5];
  const sy = (i) => [10, 8, 12, 9, 11][i % 5];

  // meta
  $: canonical = study?.slug ? `/clinical/${study.slug}` : "/clinical";
  $: metaTitle = study?.title ? `${study.title} — Clinical Study — Maramed` : "Clinical Study — Maramed";
  $: metaDesc =
    study?.description ||
    (study?.title ? `${study.title}${study?.subtitle ? " — " + study.subtitle : ""}` : "Clinical study");

  // citation rendering
  const CITE_MODE = "sup";
  function expandCiteToken(tok) {
    const clean = tok.trim();
    const m = clean.match(/^(\d+)\s*[-–]\s*(\d+)$/);
    if (!m) return [clean];
    const a = parseInt(m[1], 10), b = parseInt(m[2], 10);
    if (isNaN(a) || isNaN(b)) return [clean];
    const start = Math.min(a, b), end = Math.max(a, b);
    const out = [];
    for (let n = start; n <= end; n++) out.push(String(n));
    return out;
  }
  function transformCitationsExplicit(html = "", mode = CITE_MODE) {
    const markerRe = /\[\[([^\]]+)\]\]/g;
    return html.replace(markerRe, (_, inner) => {
      const tokens = inner.split(",").map(s => s.trim()).filter(Boolean);
      if (mode === "strip") return "";
      if (mode === "brackets") return ` [${tokens.join(", ")}]`;
      const nums = tokens.flatMap(expandCiteToken);
      const linked = nums.map(n => `<a href="#ref-${n}" class="no-underline hover:underline">${n}</a>`).join(", ");
      return `<sup class="align-super text-[10px] leading-none">${linked}</sup>`;
    });
  }

  // content helpers
  function mdToHtml(s = "") {
    const safe = String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    const withMarks = safe
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>");
    const withParas = withMarks
      .split(/\n{2,}/)
      .map((block) => `<p>${block.replace(/\n/g, "<br>")}</p>`)
      .join("");
    return transformCitationsExplicit(withParas);
  }
  function slugifyHeading(h = "") {
    return String(h).toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
  }
  function isReferencesHeading(h = "") {
    return String(h).trim().toLowerCase() === "references";
  }
  function splitRefs(s = "") {
    return String(s).split(/\n+/).map((r) => r.trim()).filter(Boolean);
  }
</script>

{#if study && study.title}
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
              Clinical Study
            </p>

            <h1 class="mt-5 text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight" in:fly={{ y: 12, duration: T(400), delay: D(110) }}>
              {study.title}
            </h1>

            {#if study.subtitle || study.year}
              <p class="mt-3 text-sm sm:text-base text-white/85" in:fade={{ duration: T(260), delay: D(180) }}>
                {study.subtitle}{study.subtitle && study.year ? " • " : ""}{study.year}
              </p>
            {/if}

            {#if study.authors?.length}
              <p class="mt-2 text-xs sm:text-sm text-white/80 font-bold" in:fade={{ duration: T(240), delay: D(220) }}>
                {study.authors.join(", ")}
              </p>
            {/if}
          </div>
        </div>
      {/if}
    </div>
  </section>

  <!-- body -->
  <section class="relative w-full">
    <div class="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {#if mounted}
        <article class="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 sm:p-8" in:scale={{ duration: T(360), delay: D(60), start: 0.99 }}>
          {#if study.description}
            <p class="text-slate-700">{study.description}</p>
            <hr class="my-6 border-slate-200" />
          {/if}

          {#each study.sections || [] as sec, i}
            <section class="mt-6 first:mt-0" id={slugifyHeading(sec?.heading)}>
              {#if sec.heading}
                <h2
                  class="text-xl sm:text-2xl lg:text-3xl font-semibold text-slate-900 scroll-mt-20"
                  in:fly={{ x: sx(i), y: sy(i), duration: T(300), delay: D(100 + i * 40) }}
                >
                  {sec.heading}
                </h2>
              {/if}

              {#if sec.content}
                {#if isReferencesHeading(sec.heading)}
                  <ol id="references" class="mt-3 list-decimal ml-5 space-y-1 text-slate-800">
                    {#each splitRefs(sec.content) as ref, j}
                      <li id={`ref-${j + 1}`}>{ref}</li>
                    {/each}
                  </ol>
                {:else}
                  <div
                    class="mt-3 text-slate-800 leading-relaxed space-y-3"
                    in:fade={{ duration: T(260), delay: D(140 + i * 40) }}
                  >
                    {@html mdToHtml(sec.content)}
                  </div>
                {/if}
              {/if}
            </section>
          {/each}

          {#if study.tags?.length}
            <div class="mt-8 flex flex-wrap gap-2">
              {#each study.tags as tag}
                <span class="inline-flex items-center rounded-full bg-slate-100 text-slate-700 text-xs px-2.5 py-1 border border-slate-200">
                  {tag}
                </span>
              {/each}
            </div>
          {/if}

          <div class="mt-10 flex items-center justify-between border-t border-slate-200 pt-6">
            <a href="/clinical" class="text-sm font-medium text-emerald-700 hover:underline">← Back to Clinical Studies</a>
            <div class="flex gap-3">
              {#if prev}
                <a href={`/clinical/${prev.slug}`} class="text-sm text-slate-600 hover:underline" title={prev.title}>Previous</a>
              {/if}
              {#if next}
                <a href={`/clinical/${next.slug}`} class="text-sm text-slate-600 hover:underline" title={next.title}>Next</a>
              {/if}
            </div>
          </div>
        </article>
      {/if}
    </div>
  </section>
{/if}
