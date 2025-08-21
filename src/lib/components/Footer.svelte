<script>
  import { Footer, FooterLinkGroup, FooterLink, FooterCopyright } from "flowbite-svelte";
  const year = new Date().getFullYear();
</script>

<!-- Note: no absolute/fixed here; use mt-auto if you ever place it directly in a flex container -->
<Footer class="mt-auto w-full border-t border-gray-200 bg-white p-4 shadow-sm md:flex md:items-center md:justify-between md:p-6 dark:border-gray-600 dark:bg-gray-800">
  <FooterCopyright href="/" by="Maramed" {year} />
  <FooterLinkGroup class="mt-3 flex flex-wrap items-center text-sm text-gray-500 sm:mt-0 dark:text-gray-400">
    <FooterLink href="/about">About</FooterLink>
    <FooterLink href="/privacy">Privacy Policy</FooterLink>
    <FooterLink href="/licensing">Licensing</FooterLink>
    <FooterLink href="/contact">Contact</FooterLink>
  </FooterLinkGroup>
</Footer>