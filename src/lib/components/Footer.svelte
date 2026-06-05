<script>
  import { Footer, FooterCopyright } from "flowbite-svelte";
  const year = new Date().getFullYear();
</script>

<Footer class="w-full bg-[#020817] border-t border-slate-200/10 !rounded-none">
	<div class="mx-auto flex w-full max-w-7xl items-center justify-between px-16 py-5">
		<div class="text-sm text-slate-400">
			<p>A Division of BioSculptor Corporation</p>
			<FooterCopyright
				href="/"
				by="Maramed Orthopedic Systems"
				{year}
				class="mt-1 text-sm text-slate-500"
			/>
		</div>

		<div class="text-right text-sm leading-6">
			<p class="text-slate-400">
				<a href="tel:3058238300" class="text-emerald-400 hover:text-emerald-300">
					(305) 823-8300
				</a>
				<span class="mx-3 text-slate-600">•</span>
				<span>Fax:</span>
				<a href="tel:3058238304" class="ml-1 text-emerald-400 hover:text-emerald-300">
					(305) 823-8304
				</a>
			</p>

			<p>
				<a
					href="mailto:custsupport@maramed.com"
					class="text-emerald-400 hover:text-emerald-300"
				>
					custsupport@maramed.com
				</a>
			</p>
		</div>
	</div>
</Footer>