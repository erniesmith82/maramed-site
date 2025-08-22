<script>
  // (Optional) Enhance later with animations or counters
  const stats = [
    { label: "Founded", value: "1972" },
    { label: "Clinically tested cases", value: "5,000+" },
    { label: "Global reach", value: "Worldwide" }
  ];
</script>

<svelte:head>
  <title>About — Maramed Orthopedic Systems</title>
  <meta name="description" content="Since 1972, Maramed Orthopedic Systems has pioneered custom-fit prefabricated orthoses and fracture braces—clinically tested in 5,000+ cases—and continues innovating with BioSculptor." />
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
  <!-- Background image (replace with your asset path) -->
  <div
    class="absolute inset-0 -z-10 bg-cover bg-center"
    style="background-image:url('/images/about-bg.jpg')"
    aria-hidden="true"
  ></div>
  <!-- Overlay gradient for legibility -->
  <div class="absolute inset-0 -z-10 bg-gradient-to-b from-slate-900/40 via-slate-900/20 to-white"></div>

  <div class="mx-auto max-w-[1200px] px-6 py-16 sm:py-20">
    <div class="mx-auto max-w-[750px] text-center text-white">
      <p class="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium ring-1 ring-white/20 backdrop-blur">
        <span class="h-1.5 w-1.5 rounded-full bg-emerald-300"></span>
        Innovating patient care since 1972
      </p>
      <h1 class="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl">
        About Maramed Orthopedic Systems
      </h1>
      <p class="mt-4 text-sm/6 sm:text-base/7 text-slate-100">
        Pioneers of custom‑fit prefabricated orthoses and fracture braces—clinically tested in more than 5,000 cases.
      </p>
    </div>
  </div>
</section>

<!-- STORY -->
<section class="px-6 py-12 sm:py-16">
  <div class="mx-auto max-w-[800px] text-gray-800 leading-relaxed">
    <article class="prose prose-slate mx-auto">
      <p>
        Founded in <strong>1972</strong> by a world‑renowned orthotist and orthopedic surgeon,
        <strong>Maramed Orthopedic Systems</strong> pioneered the use of
        <em>custom‑fit prefabricated orthoses and fracture braces</em>. Working closely with the
        University of Miami’s Department of Orthopedics, Maramed helped introduce a groundbreaking
        treatment approach that combined anatomical precision with full functionality.
      </p>

      <p>
        From the start, our mission has been clear: to develop orthopedic devices that serve both
        <strong>patients</strong> and <strong>practitioners</strong> with the highest standards of
        comfort, function, and reliability. Every innovation was born out of extensive research and
        development, ensuring that our products meet vital clinical needs.
      </p>

      <p>
        Today, Maramed is recognized worldwide for delivering <strong>innovative, cost‑effective
        solutions</strong>. Unlike most prefabricated orthoses, our fracture braces hold a unique
        distinction: they have been <strong>clinically tested in more than 5,000 cases</strong>,
        proving effectiveness in trauma care and rehabilitative applications.
      </p>

      <p>
        In <strong>2014</strong>, Maramed Orthopedic Systems merged with
        <a href="https://www.biosculptor.com" target="_blank" rel="noopener">BioSculptor Corporation</a>,
        a leader in digital technology for orthopedic, podiatric, and P&amp;O practices. Together, we
        continue to push the boundaries of patient care through advanced design, manufacturing, and
        clinical innovation.
      </p>
    </article>
  </div>
</section>

<!-- QUICK STATS -->
<section class="px-6 pb-4">
  <div class="mx-auto max-w-[900px]">
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {#each stats as s}
        <div class="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <div class="text-2xl font-extrabold text-slate-900">{s.value}</div>
          <div class="mt-1 text-xs uppercase tracking-wide text-slate-500">{s.label}</div>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- TIMELINE -->
<section class="px-6 py-12">
  <div class="mx-auto max-w-[900px]">
    <h2 class="mb-6 text-center text-xl font-bold text-slate-900">Our Heritage</h2>
    <ol class="relative mx-auto max-w-[750px] border-s-l border-slate-200 ps-6">
      <li class="mb-8">
        <div class="absolute -start-[7px] mt-1 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-white"></div>
        <h3 class="font-semibold text-slate-900">1972 — The Beginning</h3>
        <p class="text-sm text-slate-600">
          Maramed is founded and pioneers custom‑fit prefabricated orthoses and fracture braces in collaboration with the University of Miami.
        </p>
      </li>
      <li class="mb-8">
        <div class="absolute -start-[7px] mt-1 h-3 w-3 rounded-full bg-sky-500 ring-4 ring-white"></div>
        <h3 class="font-semibold text-slate-900">2014 — Joining BioSculptor</h3>
        <p class="text-sm text-slate-600">
          Maramed merges with BioSculptor Corporation, amplifying innovation through digital design and manufacturing.
        </p>
      </li>
      <li>
        <div class="absolute -start-[7px] mt-1 h-3 w-3 rounded-full bg-slate-400 ring-4 ring-white"></div>
        <h3 class="font-semibold text-slate-900">Today — Clinically Proven Care</h3>
        <p class="text-sm text-slate-600">
          Our braces are clinically tested in 5,000+ cases and trusted around the world for trauma and rehabilitative care.
        </p>
      </li>
    </ol>
  </div>
</section>

<!-- VALUES -->
<section class="px-6 pb-16">
  <div class="mx-auto max-w-[1000px]">
    <h2 class="mb-6 text-center text-xl font-bold text-slate-900">What We Stand For</h2>

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="text-3xl" aria-hidden="true">🧩</div>
        <h3 class="mt-3 font-semibold text-slate-900">Anatomical Precision</h3>
        <p class="mt-1 text-sm text-slate-600">Devices designed around real human biomechanics.</p>
      </div>
      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="text-3xl" aria-hidden="true">🔬</div>
        <h3 class="mt-3 font-semibold text-slate-900">Clinically Proven</h3>
        <p class="mt-1 text-sm text-slate-600">Evidence‑based products validated in thousands of cases.</p>
      </div>
      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="text-3xl" aria-hidden="true">🤝</div>
        <h3 class="mt-3 font-semibold text-slate-900">Patient &amp; Practitioner First</h3>
        <p class="mt-1 text-sm text-slate-600">Comfort, function, and reliability drive every decision.</p>
      </div>
    </div>
  </div>
</section>

<!-- CTA -->
<section class="px-6 pb-24">
  <div class="mx-auto max-w-[900px] rounded-3xl bg-gradient-to-r from-emerald-600 to-sky-600 px-6 py-10 text-center text-white shadow-lg">
    <h2 class="text-xl font-bold">Explore our catalog or talk to our team</h2>
    <p class="mt-1 text-sm/6 text-emerald-100">
      Discover proven orthoses and fracture braces, or request guidance for your practice.
    </p>
    <div class="mt-5 flex justify-center gap-3">
      <a href="/catalog" class="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white">View Catalog</a>
      <a href="/contact" class="rounded-xl border border-white/70 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white">Contact Us</a>
    </div>
  </div>
</section>
