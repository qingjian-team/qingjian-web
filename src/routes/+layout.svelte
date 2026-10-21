<script lang="ts">
	import './layout.css';
	import type { Snippet } from 'svelte';
	import BambooGrove from '$lib/components/BambooGrove.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import Header from '$lib/components/Header.svelte';
	import LanguageBanner from '$lib/components/LanguageBanner.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import { ogLocales } from '$lib/i18n';
	import { m } from '$lib/paraglide/messages';
	import { getLocale } from '$lib/paraglide/runtime';
	import { latest } from '$lib/releases';
	import { ui } from '$lib/ui.svelte';

	let { children }: { children: Snippet } = $props();

	/** 给搜索引擎的结构化数据：一个免费的 macOS 输入法应用。换语言是整页重载，这里按当前语言算一次就够 */
	const structuredData = {
		'@context': 'https://schema.org',
		'@type': 'SoftwareApplication',
		name: '青简 Qingjian',
		alternateName: m.seo_brand(),
		url: 'https://qingjian.app',
		description: m.site_description(),
		applicationCategory: 'UtilitiesApplication',
		operatingSystem: 'macOS 13+',
		softwareVersion: latest.version,
		inLanguage: getLocale(),
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
	<!-- 站点级：站名、语言；每页的标题 / 描述 / 规范地址 / 分享卡片图在 Seo 组件里 -->
	<meta property="og:site_name" content="青简 Qingjian" />
	<meta property="og:locale" content={ogLocales[getLocale()]} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="keywords" content={m.site_keywords()} />
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- 结构化数据是自己拼的 JSON，不含用户输入 -->
	{@html structuredDataTag}
</svelte:head>

<div class="relative isolate flex min-h-screen flex-col overflow-clip pt-[83px] desk:pt-[82px]">
	<BambooGrove />
	<Header />
	<LanguageBanner />

	<main class="relative z-1 flex-1">
		{@render children()}
	</main>

	<Footer />

	{#if ui.modal}
		<Modal />
	{/if}
</div>
