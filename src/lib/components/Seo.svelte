<script lang="ts">
	import { page } from '$app/state';
	import { baseLocale, localized, locales, plainPath } from '$lib/i18n';
	import { m } from '$lib/paraglide/messages';

	/**
	 * 每页的搜索引擎与分享卡片信息。站点级的（站名、图片、结构化数据）在 +layout.svelte 里，
	 * 这里只放随页面变的：标题、描述、规范地址、各语言版本、分享卡片图（缺省是横版 logo，主题详情页换成主题封面）。
	 * 标题格式「页名 | 青简输入法 Qingjian」，首页不带页名。
	 */
	let { title, description, image }: { title?: string; description: string; image?: string } =
		$props();

	const SITE = 'https://qingjian.app';

	const fullTitle = $derived(
		title ? `${title} | ${m.seo_brand()}` : `${m.seo_brand()} | ${m.seo_home_suffix()}`
	);
	const imageUrl = $derived(`${SITE}${image ?? '/brand/qingjian-logo-horizontal.png'}`);
	const path = $derived(plainPath(page.url));
	const canonical = $derived(`${SITE}${localized(path)}`);
</script>

<svelte:head>
	<title>{fullTitle}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonical} />
	<!-- 同一页的各语言版本，搜索引擎据此给不同语言的用户排对应的那一版 -->
	{#each locales as locale (locale)}
		<link rel="alternate" hreflang={locale} href="{SITE}{localized(path, locale)}" />
	{/each}
	<link rel="alternate" hreflang="x-default" href="{SITE}{localized(path, baseLocale)}" />

	<meta property="og:type" content="website" />
	<meta property="og:title" content={fullTitle} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={canonical} />

	<meta name="twitter:title" content={fullTitle} />
	<meta name="twitter:description" content={description} />
	<meta property="og:image" content={imageUrl} />
	<meta name="twitter:image" content={imageUrl} />
</svelte:head>
