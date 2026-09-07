<script lang="ts">
	let { title, desc }: { title: string; desc: string } = $props();
</script>

<div class="mt-[26px] mb-4 text-center desk:mt-[19px] desk:mb-3">
	<h2 class="font-song text-[22px] leading-[1.25] font-bold">{title}</h2>
	<p class="mt-[7px] text-xs leading-[1.55] text-muted desk:mt-[2px] desk:text-[13px]">{desc}</p>
</div>
