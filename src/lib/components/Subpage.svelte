<script lang="ts">
	import type { Snippet } from 'svelte';

	/** 子页面的统一开头：标题 + 一句说明。页面名已在导航栏高亮，这里不再重复小标题 */
	let { title, desc, children }: { title: string; desc: string; children: Snippet } = $props();
</script>

<div class="wrap min-h-[65vh] py-[30px] pb-[45px] desk:py-[60px] desk:pb-20">
	<div class="mb-10 max-w-[690px]">
		<h1 class="my-3.5 font-song text-[30px] leading-[1.4] font-bold desk:text-[38px]">{title}</h1>
		<p class="text-base leading-[1.55] text-muted">{desc}</p>
	</div>

	{@render children()}
</div>
