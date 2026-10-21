<script lang="ts">
	import XIcon from 'phosphor-svelte/lib/XIcon';
	import { page } from '$app/state';
	import { localized, plainPath, suggestedLocale, type Locale } from '$lib/i18n';
	import { m } from '$lib/paraglide/messages';
	import { getLocale } from '$lib/paraglide/runtime';

	/**
	 * 浏览器语言和当前页面语言对不上时，在页顶提示一次「这个网站有 English 版」，由访问者自己点。
	 * 不自动跳转：搜索引擎抓得到每种语言，想看原文的人也不会被拽走。提示用对方的语言写；点了关闭就记住，不再出现。
	 */
	const DISMISSED_KEY = 'qingjian-language-banner-dismissed';

	let target = $state<Locale | null>(null);
	const path = $derived(plainPath(page.url));

	$effect(() => {
		let dismissed = false;
		try {
			dismissed = localStorage.getItem(DISMISSED_KEY) === '1';
		} catch {
			// 隐私模式等拿不到存储时照常提示
		}
		const suggested = suggestedLocale(navigator.languages ?? [navigator.language]);
		target = !dismissed && suggested !== getLocale() ? suggested : null;
	});

	function dismiss() {
		target = null;
		try {
			localStorage.setItem(DISMISSED_KEY, '1');
		} catch {
			// 存不下就只关这一次
		}
	}
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -- 站内链接经 localized()：先 resolve()，再加语言前缀 -->

{#if target}
	<div
		class="relative z-2 mx-auto mt-1 flex w-[calc(100%-24px)] flex-wrap items-center gap-x-4 gap-y-2 rounded-[14px] border border-[#cfe3d6] bg-[#f0f7f2] px-4 py-2.5 text-[13px] desk:w-[min(1152px,calc(100%-40px))]"
		lang={target}
		role="region"
		aria-label={m.lang_menu_label({}, { locale: target })}
	>
		<span class="text-ink">{m.banner_text({}, { locale: target })}</span>
		<a
			class="font-semibold text-teal hover:underline"
			href={localized(path, target)}
			hreflang={target}
			data-sveltekit-reload>{m.banner_switch({}, { locale: target })}</a
		>
		<button
			class="ml-auto inline-flex items-center gap-1 text-muted transition-colors hover:text-teal"
			onclick={dismiss}
		>
			<XIcon size={14} />
			{m.banner_dismiss({}, { locale: target })}
		</button>
	</div>
{/if}
