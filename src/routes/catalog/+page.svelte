<script>
  // no data
</script>

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
