<script lang="ts">
	import { page } from '$app/state';

	/**
	 * 每页的搜索引擎与分享卡片信息。站点级的（站名、图片、结构化数据）在 +layout.svelte 里，
	 * 这里只放随页面变的：标题、描述、规范地址。标题格式「页名 | 青简输入法 Qingjian」，首页不带页名。
	 */
	let { title, description }: { title?: string; description: string } = $props();

	const SITE = 'https://qingjian.app';
	const BRAND = '青简输入法 Qingjian';

	const fullTitle = $derived(
		title ? `${title} | ${BRAND}` : `${BRAND} | 打字时顺便多认识一个外语词`
	);
	const canonical = $derived(`${SITE}${page.url.pathname === '/' ? '/' : page.url.pathname}`);
</script>

<svelte:head>
	<title>{fullTitle}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonical} />

	<meta property="og:type" content="website" />
	<meta property="og:title" content={fullTitle} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={canonical} />

	<meta name="twitter:title" content={fullTitle} />
	<meta name="twitter:description" content={description} />
</svelte:head>
