<script>
  import "../app.css"; // global styles (Tailwind, etc.)
  import Navbar from "$lib/components/Navbar.svelte";
	import Footer from "$lib/components/Footer.svelte";

</script>

<div class="min-h-dvh flex flex-col bg-white text-slate-900">
  <!-- Navbar always at top -->
  <Navbar />

  <!-- Page content gets injected here -->
  <main class="flex-1 pt-16">
    <slot />
  </main>

  <!-- Footer always at bottom -->
<Footer/>
</div>
