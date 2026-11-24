<script lang="ts">
	import { resolve } from '$app/paths';
	import Lightbox from '$lib/components/Lightbox.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { baseLocale, localized } from '$lib/i18n';
	import '$lib/docs/doc.css';

	let { data } = $props();

	let body = $state<HTMLElement | undefined>();

	const href = (doc: string) =>
		localized(
			resolve('/transparency/[entry]/[[doc]]', { entry: data.entry, doc: doc || undefined })
		);
</script>

<!-- 只有中文；不进搜索引擎索引，撤下后不留检索快照 -->
<svelte:head>
	<meta name="robots" content="noindex" />
</svelte:head>

<Seo
	title={data.title}
	description={data.title}
	translations={[baseLocale]}
	contentLocale={baseLocale}
/>

<!-- eslint-disable svelte/no-navigation-without-resolve -- 站内链接经 localized()：先 resolve()，再加语言前缀 -->
<div class="wrap min-h-[65vh] py-[30px] pb-[45px] desk:py-[50px] desk:pb-20">
	<article
		class="mx-auto max-w-[820px] rounded-2xl border border-[#e4e4e0] bg-white px-5 py-7 desk:px-12 desk:py-10"
	>
		<a
			class="text-[13px] text-[#6b6b66] hover:text-[#1f4f8a]"
			href={localized(resolve('/transparency'))}
		>
			← 公开说明
		</a>
		<h1
			class="my-3.5 font-song text-[30px] leading-[1.4] font-bold text-[#141414] desk:text-[36px]"
		>
			{data.title}
		</h1>
		{#if data.docs.length > 1}
			<nav class="mb-8 flex flex-wrap gap-4 text-[14px]">
				{#each data.docs as doc (doc.slug)}
					<a
						class={doc.slug === data.doc
							? 'font-semibold text-[#141414]'
							: 'text-[#6b6b66] hover:text-[#1f4f8a]'}
						href={href(doc.slug)}
						aria-current={doc.slug === data.doc ? 'page' : undefined}>{doc.title}</a
					>
				{/each}
			</nav>
		{/if}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- 构建时由自己私有仓库里的 Markdown 渲染 -->
		<div class="doc tp-doc" bind:this={body}>{@html data.html}</div>
	</article>
</div>

<Lightbox root={body} />

<style>
	/* 正文用接近黑的中性色和更大的字号，读起来像一份说明，不沿用文档页的浅灰与绿色点缀 */
	.tp-doc :global(p),
	.tp-doc :global(li) {
		font-size: 16px;
		line-height: 1.9;
		color: #262626;
	}
	.tp-doc :global(p) {
		margin: 0 0 16px;
	}
	.tp-doc :global(h2) {
		margin: 40px 0 14px;
		padding-top: 8px;
		color: #141414;
	}
	.tp-doc :global(h2:first-child) {
		margin-top: 0;
	}
	.tp-doc :global(h3) {
		margin: 28px 0 10px;
		font-size: 17px;
		color: #141414;
	}
	.tp-doc :global(strong) {
		font-weight: 600;
		color: #141414;
	}
	.tp-doc :global(a) {
		color: #1f4f8a;
	}
	.tp-doc :global(blockquote) {
		margin: 0 0 18px;
		padding: 4px 16px;
		border-left: 3px solid #cfcfca;
		background: #fafaf8;
	}
	.tp-doc :global(blockquote p) {
		color: #3d3d3d;
	}
	.tp-doc :global(code) {
		background: #f1f1ee;
		color: #262626;
	}
	.tp-doc :global(.table-wrap) {
		border-color: #e4e4e0;
	}
	.tp-doc :global(th) {
		background: #f4f4f2;
		color: #262626;
	}
	.tp-doc :global(td),
	.tp-doc :global(td:first-child) {
		border-top-color: #e4e4e0;
		font-size: 14px;
		color: #262626;
	}
	.tp-doc :global(hr) {
		border-top-color: #e4e4e0;
	}
	.tp-doc :global(.anchor) {
		color: #9a9a95;
	}

	/* 截图墙：统一大小的卡片，图从顶部裁切预览，点开看完整大图；说明文字在卡片下 */
	.tp-doc :global(.tp-gallery) {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
		gap: 16px 14px;
		margin: 14px 0 24px;
	}
	.tp-doc :global(.tp-fig) {
		display: flex;
		min-width: 0;
		flex-direction: column;
		gap: 6px;
		margin: 0;
	}
	.tp-doc :global(.tp-thumb) {
		display: block;
		aspect-ratio: 3 / 4;
		width: 100%;
		cursor: zoom-in;
		overflow: hidden;
		border: 1px solid #e4e4e0;
		border-radius: 8px;
		background: #f6f6f4;
		padding: 0;
		transition: box-shadow 0.15s;
	}
	.tp-doc :global(.tp-thumb:hover) {
		box-shadow: 0 4px 14px rgb(0 0 0 / 0.12);
	}
	.tp-doc :global(.tp-thumb img) {
		display: block;
		width: 100%;
		height: 100%;
		max-width: none;
		margin: 0;
		border: 0;
		border-radius: 0;
		object-fit: cover;
		object-position: top center;
	}
	.tp-doc :global(.tp-fig figcaption) {
		font-size: 13px;
		line-height: 1.5;
		color: #555550;
	}
</style>
