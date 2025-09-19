<script>
  // animations (same pattern used elsewhere)
  import { fade, fly, scale } from "svelte/transition";
  import { onMount } from "svelte";

  // small helper data you already had
  const stats = [
    { label: "Founded", value: "1972" },
    { label: "Clinically tested cases", value: "5,000+" },
    { label: "Global reach", value: "Worldwide" }
  ];

  // gate transitions to client
  let mounted = false;
  onMount(() => requestAnimationFrame(() => (mounted = true)));

  // reduced-motion + global timing controls
  const isReduced =
    typeof matchMedia !== "undefined" &&
    matchMedia("(prefers-reduced-motion: reduce)").matches;

  // tune these two for overall speed / spacing
  const DUR_MULT = 3;   // smaller = faster; try 0.4 for snappier
  const DELAY_MULT = 0.6; // smaller = tighter staggering

  const T = (ms) => (isReduced ? 0 : Math.round(ms * DUR_MULT));
  const D = (ms) => (isReduced ? 0 : Math.round(ms * DELAY_MULT));

  // light “scatter” offsets
  const sx = (i) => [-12, 10, -8, 9, -6][i % 5];
  const sy = (i) => [ 10,  8, 12, 9, 11][i % 5];
</script>

<svelte:head>
  <title>About — Maramed Orthopedic Systems</title>
  <meta
    name="description"
    content="Since 1972, Maramed Orthopedic Systems has pioneered custom-fit prefabricated orthoses and fracture braces—clinically tested in 5,000+ cases—and continues innovating with BioSculptor."
  />
  <script type="application/ld+json">
    {JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Maramed Orthopedic Systems",
      url: "https://maramed.com/",
      description:
        "Pioneers in custom-fit prefabricated orthoses and fracture braces since 1972. Clinically tested in 5,000+ cases.",
      parentOrganization: {
        "@type": "Organization",
        name: "BioSculptor Corporation",
        url: "https://www.biosculptor.com"
      }
    })}
  </script>
</svelte:head>

<!-- HERO -->
<section class="relative isolate">
  <!-- Background image -->
  <div
    class="absolute inset-0 -z-10 bg-cover bg-center"
    style="background-image:url('/images/about-bg.jpg')"
    aria-hidden="true"
  ></div>

  <!-- Overlay gradient -->
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
            Innovating patient care since 1972
          </p>

          <h1
            class="mt-5 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight"
            in:fly={{ y: 12, duration: T(400), delay: D(110) }}
          >
            About Maramed Orthopedic Systems
          </h1>

          <p
            class="mt-4 text-sm sm:text-base lg:text-lg text-white/90"
            in:fly={{ y: 10, duration: T(360), delay: D(200) }}
          >
            Pioneers of custom-fit prefabricated orthoses and fracture braces—clinically tested in more than 5,000 cases.
          </p>
        </div>
      </div>
    {/if}
  </div>
</section>

<!-- STORY -->
<section class="px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
  <div class="mx-auto max-w-screen-md text-gray-800 leading-relaxed">
    <article class="prose prose-slate prose-sm sm:prose-base lg:prose-lg mx-auto">
      {#if mounted}
        <p in:fly={{ x: sx(0), y: sy(0), duration: T(360), delay: D(40) }}>
          Founded in <strong>1972</strong> by a world-renowned orthotist and orthopedic surgeon,
          <strong>Maramed Orthopedic Systems</strong> pioneered the use of
          <em>custom-fit prefabricated orthoses and fracture braces</em>. Working closely with the
          University of Miami’s Department of Orthopedics, Maramed helped introduce a groundbreaking
          treatment approach that combined anatomical precision with full functionality.
        </p>

        <p in:fly={{ x: sx(1), y: sy(1), duration: T(360), delay: D(120) }}>
          From the start, our mission has been clear: to develop orthopedic devices that serve both
          <strong>patients</strong> and <strong>practitioners</strong> with the highest standards of
          comfort, function, and reliability. Every innovation was born out of extensive research and
          development, ensuring that our products meet vital clinical needs.
        </p>

        <p in:fly={{ x: sx(2), y: sy(2), duration: T(360), delay: D(200) }}>
          Today, Maramed is recognized worldwide for delivering <strong>innovative, cost-effective
          solutions</strong>. Unlike most prefabricated orthoses, our fracture braces hold a unique
          distinction: they have been <strong>clinically tested in more than 5,000 cases</strong>,
          proving effectiveness in trauma care and rehabilitative applications.
        </p>

        <p in:fly={{ x: sx(3), y: sy(3), duration: T(360), delay: D(280) }}>
          In <strong>2014</strong>, Maramed Orthopedic Systems merged with
          <a href="https://www.biosculptor.com" target="_blank" rel="noopener">BioSculptor Corporation</a>,
          a leader in digital technology for orthopedic, podiatric, and P&amp;O practices. Together, we
          continue to push the boundaries of patient care through advanced design, manufacturing, and
          clinical innovation.
        </p>
      {/if}
    </article>
  </div>
</section>

<!-- QUICK STATS -->
<section class="px-4 sm:px-6 lg:px-8 pb-6">
  <div class="mx-auto max-w-screen-lg">
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
      {#each stats as s, i}
        {#if mounted}
          <div
            class="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 text-center shadow-sm"
            in:fly={{ x: sx(i), y: sy(i), duration: T(340), delay: D(40 + i*90) }}
          >
            <div class="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900">{s.value}</div>
            <div class="mt-1 text-[10px] sm:text-xs uppercase tracking-wide text-slate-500">{s.label}</div>
          </div>
        {/if}
      {/each}
    </div>
  </div>
</section>

<!-- TIMELINE -->
<section class="px-4 sm:px-6 lg:px-8 py-10">
  <div class="mx-auto max-w-screen-lg">
    <h2 class="mb-6 text-center text-lg sm:text-xl font-bold text-slate-900">Our Heritage</h2>

    <ol class="relative mx-auto max-w-2xl sm:border-s sm:border-slate-200 sm:ps-6">
      {#if mounted}
        <li class="mb-8 sm:mb-10" in:fly={{ x: sx(0), y: sy(0), duration: T(360), delay: D(40) }}>
          <div class="hidden sm:block absolute -start-[7px] mt-1 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-white"></div>
          <div class="rounded-xl sm:rounded-none sm:rounded-l-none sm:ps-0">
            <h3 class="font-semibold text-slate-900">1972 — The Beginning</h3>
            <p class="text-sm sm:text-[15px] text-slate-600">
              Maramed is founded and pioneers custom-fit prefabricated orthoses and fracture braces in collaboration with the University of Miami.
            </p>
          </div>
        </li>

        <li class="mb-8 sm:mb-10" in:fly={{ x: sx(1), y: sy(1), duration: T(360), delay: D(140) }}>
          <div class="hidden sm:block absolute -start-[7px] mt-1 h-3 w-3 rounded-full bg-sky-500 ring-4 ring-white"></div>
          <div>
            <h3 class="font-semibold text-slate-900">2014 — Joining BioSculptor</h3>
            <p class="text-sm sm:text-[15px] text-slate-600">
              Maramed merges with BioSculptor Corporation, amplifying innovation through digital design and manufacturing.
            </p>
          </div>
        </li>

        <li in:fly={{ x: sx(2), y: sy(2), duration: T(360), delay: D(240) }}>
          <div class="hidden sm:block absolute -start-[7px] mt-1 h-3 w-3 rounded-full bg-slate-400 ring-4 ring-white"></div>
          <div>
            <h3 class="font-semibold text-slate-900">Today — Clinically Proven Care</h3>
            <p class="text-sm sm:text-[15px] text-slate-600">
              Our braces are clinically tested in 5,000+ cases and trusted around the world for trauma and rehabilitative care.
            </p>
          </div>
        </li>
      {/if}
    </ol>
  </div>
</section>

<!-- VALUES -->
<section class="px-4 sm:px-6 lg:px-8 pb-14">
  <div class="mx-auto max-w-screen-lg">
    <h2 class="mb-6 text-center text-lg sm:text-xl font-bold text-slate-900">What We Stand For</h2>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
      {#if mounted}
        <div
          class="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm"
          in:fly={{ x: sx(0), y: sy(0), duration: T(360), delay: D(40) }}
        >
          <div class="text-2xl sm:text-3xl" aria-hidden="true">🧩</div>
          <h3 class="mt-3 font-semibold text-slate-900">Anatomical Precision</h3>
          <p class="mt-1 text-sm text-slate-600">Devices designed around real human biomechanics.</p>
        </div>

        <div
          class="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm"
          in:fly={{ x: sx(1), y: sy(1), duration: T(360), delay: D(130) }}
        >
          <div class="text-2xl sm:text-3xl" aria-hidden="true">🔬</div>
          <h3 class="mt-3 font-semibold text-slate-900">Clinically Proven</h3>
          <p class="mt-1 text-sm text-slate-600">Evidence-based products validated in thousands of cases.</p>
        </div>

        <div
          class="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm"
          in:fly={{ x: sx(2), y: sy(2), duration: T(360), delay: D(220) }}
        >
          <div class="text-2xl sm:text-3xl" aria-hidden="true">🤝</div>
          <h3 class="mt-3 font-semibold text-slate-900">Patient &amp; Practitioner First</h3>
          <p class="mt-1 text-sm text-slate-600">Comfort, function, and reliability drive every decision.</p>
        </div>
      {/if}
    </div>
  </div>
</section>

<!-- CTA -->
<section class="px-4 sm:px-6 lg:px-8 pb-20">
  <div class="mx-auto max-w-screen-lg" >
    {#if mounted}
      <div in:fade={{ duration: T(320) }}>
        <div
          class="rounded-3xl bg-gradient-to-r from-emerald-600 to-sky-600 px-5 sm:px-8 py-8 sm:py-10 text-center text-white shadow-lg"
          in:scale={{ duration: T(360), start: 0.985 }}
        >
          <h2 class="text-lg sm:text-xl font-bold" in:fly={{ y: 10, duration: T(320), delay: D(40) }}>
            Explore our catalog or talk to our team
          </h2>
          <p class="mt-1 text-sm sm:text-base text-emerald-100" in:fly={{ y: 10, duration: T(320), delay: D(110) }}>
            Discover proven orthoses and fracture braces, or request guidance for your practice.
          </p>
          <div class="mt-5 flex flex-col sm:flex-row justify-center gap-3">
            <a
              href="/catalog"
              class="rounded-xl bg-white px-4 py-2 text-sm sm:text-base font-semibold text-slate-900 shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
              in:fly={{ x: sx(0), y: sy(0), duration: T(320), delay: D(180) }}
            >View Catalog</a>
            <a
              href="/contact"
              class="rounded-xl border border-white/70 px-4 py-2 text-sm sm:text-base font-semibold text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
              in:fly={{ x: sx(1), y: sy(1), duration: T(320), delay: D(230) }}
            >Contact Us</a>
          </div>
        </div>
      </div>
    {/if}
  </div>
</section>
