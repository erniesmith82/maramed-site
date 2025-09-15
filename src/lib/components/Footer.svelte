<script>
  import { Footer, FooterLinkGroup, FooterLink, FooterCopyright } from "flowbite-svelte";
  const year = new Date().getFullYear();
</script>

<Footer
  class="fixed bottom-0 left-0 z-40 w-full
         bg-white/85 backdrop-blur border-t border-slate-200 !rounded-none
         dark:bg-gray-900/70 dark:border-gray-800"
>
  <FooterCopyright href="/" by="Maramed" {year} />

  <FooterLinkGroup
    class="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500
           sm:mt-0 dark:text-gray-400"
  >
    <FooterLink href="/about">About</FooterLink>
    <FooterLink href="/privacy">Privacy Policy</FooterLink>
    <FooterLink href="/licensing">Licensing</FooterLink>
    <FooterLink href="/contact">Contact</FooterLink>
  </FooterLinkGroup>
</Footer>
