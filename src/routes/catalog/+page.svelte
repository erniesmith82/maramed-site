<!-- src/routes/catalog/+layout.svelte -->
<script>
  // Tabs removed; no data or helpers needed here.
</script>

<section class="min-h-screen flex">
  <main class="flex-1 p-6 overflow-y-auto">
    <slot />
  </main>
</section>

<style>
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>
