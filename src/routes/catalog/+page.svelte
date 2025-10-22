<!-- src/routes/catalog/+page.svelte -->
<svelte:head>
  <!-- Primary SEO -->
  <title>Maramed Orthotic Catalog | Central Fabrication & CAD/CAM Systems</title>
  <meta
    name="description"
    content="Explore Maramed’s full catalog of orthotic components, materials, and CAD/CAM systems for precision central fabrication. Designed and manufactured in Miami, Florida."
  />
  <meta
    name="keywords"
    content="orthotics, orthotic catalog, central fabrication, CADCAM systems, vacuum forming, Miami, Maramed, orthotic materials"
  />

  <!-- Open Graph / Social Sharing -->
  <meta property="og:title" content="Maramed Orthotic Catalog | Central Fabrication & CAD/CAM Systems" />
  <meta
    property="og:description"
    content="Discover Maramed’s complete line of orthotic systems, CAD/CAM solutions, and central fabrication materials."
  />
  <meta property="og:image" content="/images/catalog-hero.jpg" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://www.maramed.com/catalog" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Maramed Orthotic Catalog | Central Fabrication & CAD/CAM Systems" />
  <meta
    name="twitter:description"
    content="Explore orthotic components, CAD/CAM systems, and central fabrication materials by Maramed."
  />
  <meta name="twitter:image" content="/images/catalog-hero.jpg" />

  <!-- Canonical / Favicon -->
  <link rel="canonical" href="https://www.maramed.com/catalog" />
  <link rel="icon" type="image/png" href="/favicon.png" />
</svelte:head>

<!-- catalog page wrapper: full-bleed background image with scrollable content slot -->
<section
  class="relative isolate min-h-[100svh] sm:min-h-screen flex
         bg-no-repeat bg-top sm:bg-center
         bg-contain lg:bg-cover"
  style="background-image:url('/Maramed-catalog.jpg'); background-color:white;"
>
  <main
    class="relative z-10 flex-1 px-3 sm:px-6 lg:px-8 py-1 sm:py-3 overflow-y-auto no-scrollbar"
    style="padding-top: env(safe-area-inset-top, 0px);
           padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 0.5rem);"
  >
    <div class="mx-auto w-full max-w-screen-xl [&>*:first-child]:mt-0">
      <slot />
    </div>
  </main>
</section>

<style>
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
