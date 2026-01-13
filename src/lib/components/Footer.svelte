<script>
  import { Footer, FooterCopyright } from "flowbite-svelte";
  const year = new Date().getFullYear();
</script>

<Footer
  class="w-full
         sm:fixed sm:bottom-0 sm:left-0 sm:z-40
         bg-white/90 dark:bg-gray-900/90
         backdrop-blur
         border-t border-slate-200 dark:border-gray-800
         !rounded-none"
>
  <div
    class="mx-auto w-full max-w-7xl px-4
           flex items-center justify-center h-5"
  >
    <FooterCopyright
      href="/"
      by="Maramed"
      {year}
      class="text-sm text-slate-500 dark:text-gray-400"
    />
  </div>
</Footer>
