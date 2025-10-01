<script>
  import {
    Footer,
    FooterLinkGroup,
    FooterLink,
    FooterCopyright
  } from "flowbite-svelte";
  const year = new Date().getFullYear();
</script>

<Footer
  class="w-full
         sm:fixed sm:bottom-0 sm:left-0 sm:z-40
         bg-white/85 backdrop-blur border-t border-slate-200 !rounded-none
         dark:bg-gray-900/70 dark:border-gray-800"
>
  <div class="mx-auto w-full max-w-7xl px-4
              flex flex-col sm:flex-row items-center gap-3 sm:gap-6
              justify-center sm:justify-between">
    <FooterCopyright href="/" by="Maramed" {year} />
    <FooterLinkGroup
      class="mt-0 sm:ml-auto flex flex-wrap items-center gap-x-6 gap-y-2
             text-sm text-gray-500 dark:text-gray-400
             justify-center sm:justify-end text-center sm:text-right"
    >
      <FooterLink href="/about">About</FooterLink>
      <FooterLink href="/privacy">Privacy Policy</FooterLink>
      <FooterLink href="/licensing">Licensing</FooterLink>
      <FooterLink href="/contact">Contact</FooterLink>
    </FooterLinkGroup>
  </div>
</Footer>
