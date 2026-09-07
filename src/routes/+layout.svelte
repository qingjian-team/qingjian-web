<script lang="ts">
	import './layout.css';
	import type { Snippet } from 'svelte';
	import BambooGrove from '$lib/components/BambooGrove.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Header from '$lib/components/Header.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import { latest } from '$lib/releases';
	import { ui } from '$lib/ui.svelte';

	let { children }: { children: Snippet } = $props();

	/** 给搜索引擎的结构化数据：一个免费的 macOS 输入法应用 */
	const structuredData = {
		'@context': 'https://schema.org',
		'@type': 'SoftwareApplication',
		name: '青简 Qingjian',
		alternateName: '青简输入法',
		url: 'https://qingjian.app',
		description:
			'用 Rust 写的拼音输入法。候选词旁边多一条你正在学的外语的译词，打字时顺便多认识一个词。全部在本机完成，一次只学一种语言。',
		applicationCategory: 'UtilitiesApplication',
		operatingSystem: 'macOS 13+',
		softwareVersion: latest.version,
		inLanguage: 'zh-CN',
		offers: { '@type': 'Offer', price: '0', priceCurrency: 'CNY' },
		author: { '@type': 'Person', name: 'yenharvey' }
	};
	// 标签名拆开写：文件里不能出现完整的脚本开闭标签，Svelte 会把它们当成脚本块的边界
	const structuredDataTag =
		'<scr' + 'ipt type="application/ld+json">' + JSON.stringify(structuredData) + '</scr' + 'ipt>';

	// 跟随系统的「减弱动效」偏好
	$effect(() => {
		const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
		const sync = () => (ui.reducedMotion = preference.matches);
		sync();
		preference.addEventListener('change', sync);
		return () => preference.removeEventListener('change', sync);
	});
</script>

<svelte:head>
	<!-- 站点级：站名、语言、分享卡片图；每页的标题 / 描述 / 规范地址在 Seo 组件里 -->
	<meta property="og:site_name" content="青简 Qingjian" />
	<meta property="og:locale" content="zh_CN" />
	<meta property="og:image" content="https://qingjian.app/brand/qingjian-logo-horizontal.png" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:image" content="https://qingjian.app/brand/qingjian-logo-horizontal.png" />
	<meta
		name="keywords"
		content="青简, Qingjian, 输入法, 拼音输入法, macOS 输入法, Rust 输入法, 学英语, 学日语, 双拼, 整句输入, 本地输入法"
	/>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- 结构化数据是自己拼的 JSON，不含用户输入 -->
	{@html structuredDataTag}
</svelte:head>

<div class="relative isolate flex min-h-screen flex-col overflow-clip pt-[83px] desk:pt-[82px]">
	<BambooGrove />
	<Header />

	<main class="relative z-1 flex-1">
		{@render children()}
	</main>

	<Footer />

	{#if ui.modal}
		<Modal />
	{/if}
</div>
