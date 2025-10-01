<script>
  import { page } from "$app/stores";

  export let brand = { name: "Maramed", href: "/", logo: "/maramed-logo.png" };
  const links = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/clinical", label: "Clinical Studies" },
    { href: "/news", label: "News" },
    { href: "/catalog", label: "Catalog" },
    { href: "/ordering", label: "Ordering and Reimpursement" },
    { href: "/contact", label: "Contact" },
  ];

  let mobileOpen = false;
  $: pathname = $page?.url?.pathname ?? "/";
  const isActive = (href) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
</script>

<header
  class="fixed inset-x-0 top-0 z-40 border-b border-slate-200 dark:border-gray-800
         bg-gradient-to-b from-slate-300/90 to-slate-100/85 dark:from-gray-900/90 dark:to-gray-800/70
         backdrop-blur"
>
  <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-22 flex items-center justify-between">
    <a href={brand.href} class="flex items-center gap-2">
      {#if brand.logo}
        <img src={brand.logo} alt={brand.name} class="h-18 w-45 rounded-lg" />
      {/if}
    </a>

    <!-- Desktop nav -->
    <nav class="hidden md:flex items-center gap-6">
      {#each links as l}
        <a
          href={l.href}
          class="text-sm font-medium transition-colors"
          class:text-slate-900={isActive(l.href)}
          class:text-slate-700={!isActive(l.href)}
          class:hover:text-slate-900={!isActive(l.href)}
          class:dark:text-white={isActive(l.href)}
          class:dark:text-gray-300={!isActive(l.href)}
          class:dark:hover:text-white={!isActive(l.href)}
        >
          {l.label}
        </a>
      {/each}
    </nav>

    <!-- Mobile toggle -->
    <button
      class="md:hidden inline-flex items-center p-2 rounded-lg border border-slate-200 dark:border-gray-700"
      on:click={() => (mobileOpen = !mobileOpen)}
      aria-label="Toggle menu"
      aria-expanded={mobileOpen}
    >
      <svg viewBox="0 0 24 24" class="w-5 h-5" fill="none">
        <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
    </button>
  </div>

  {#if mobileOpen}
    <!-- Mobile menu -->
    <div class="md:hidden border-t border-slate-200 dark:border-gray-800">
      <nav class="px-4 py-3 flex flex-col space-y-2">
        {#each links as l}
          <a
            href={l.href}
            on:click={() => (mobileOpen = false)}
            class="text-sm font-medium"
            class:text-slate-900={isActive(l.href)}
            class:text-slate-700={!isActive(l.href)}
            class:hover:text-emerald-600={!isActive(l.href)}
            class:dark:text-white={isActive(l.href)}
            class:dark:text-gray-300={!isActive(l.href)}
            class:dark:hover:text-emerald-400={!isActive(l.href)}
          >
            {l.label}
          </a>
        {/each}
      </nav>
    </div>
  {/if}
</header>

<!-- spacer so content clears fixed header -->
<div class="h-16"></div>
