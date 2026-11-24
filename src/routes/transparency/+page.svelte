<script lang="ts">
	import { resolve } from '$app/paths';
	import Seo from '$lib/components/Seo.svelte';
	import { baseLocale, localized } from '$lib/i18n';

	let { data } = $props();

	const href = (entry: string) => localized(resolve('/transparency/[entry]/[[doc]]', { entry }));
</script>

<!-- 只有中文；不进搜索引擎索引，撤下后不留检索快照 -->
<svelte:head>
	<meta name="robots" content="noindex" />
</svelte:head>

<Seo
	title="公开说明"
	description="青简涉及的争议，我的说明与完整记录。"
	translations={[baseLocale]}
	contentLocale={baseLocale}
/>

<!-- eslint-disable svelte/no-navigation-without-resolve -- 站内链接经 localized()：先 resolve()，再加语言前缀 -->
<div class="wrap min-h-[65vh] py-[30px] pb-[45px] desk:py-[60px] desk:pb-20">
	<div class="mx-auto max-w-[820px]">
		<h1
			class="my-3.5 font-song text-[30px] leading-[1.4] font-bold text-[#141414] desk:text-[36px]"
		>
			公开说明
		</h1>
		<p class="mb-8 text-base leading-[1.7] text-[#3d3d3d]">
			青简涉及的争议，我的说明与按时间整理的完整记录。
		</p>
		<ul class="flex flex-col gap-4">
			{#each data.entries as entry (entry.slug)}
				<li class="rounded-xl border border-[#e4e4e0] bg-white p-5">
					<a
						class="text-lg font-semibold text-[#141414] hover:text-[#1f4f8a]"
						href={href(entry.slug)}
					>
						{entry.title}
					</a>
					<p class="mt-1 text-[13px] text-[#6b6b66]">{entry.date}</p>
					<p class="mt-2 text-[15px] leading-[1.75] text-[#262626]">{entry.summary}</p>
				</li>
			{/each}
		</ul>
	</div>
</div>
