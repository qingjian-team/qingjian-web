<script lang="ts">
	import CaretDownIcon from 'phosphor-svelte/lib/CaretDownIcon';
	import GlobeIcon from 'phosphor-svelte/lib/GlobeIcon';
	import { page } from '$app/state';
	import { localeNames, localized, locales, plainPath } from '$lib/i18n';
	import { m } from '$lib/paraglide/messages';
	import { getLocale } from '$lib/paraglide/runtime';

	/** 页头的语言菜单：当前语言加粗、不是链接，其余语言链到同一页的对应版本 */
	let { onpick }: { onpick?: () => void } = $props();

	let open = $state(false);
	let root = $state<HTMLElement | undefined>();
	const current = $derived(getLocale());
	const path = $derived(plainPath(page.url));

	// 点菜单外面或按 Esc 收起
	$effect(() => {
		if (!open) return;
		const close = (event: Event) => {
			if (
				event instanceof KeyboardEvent
					? event.key === 'Escape'
					: !root?.contains(event.target as Node)
			)
				open = false;
		};
		document.addEventListener('pointerdown', close);
		document.addEventListener('keydown', close);
		return () => {
			document.removeEventListener('pointerdown', close);
			document.removeEventListener('keydown', close);
		};
	});
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -- 站内链接经 localized()：先 resolve()，再加语言前缀 -->

<div class="relative" bind:this={root}>
	<button
		class="flex items-center gap-1.5 text-muted transition-colors hover:text-teal"
		aria-label={m.lang_menu_label()}
		aria-expanded={open}
		aria-haspopup="true"
		onclick={() => (open = !open)}
	>
		<GlobeIcon size={18} />
		<span>{localeNames[current]}</span>
		<CaretDownIcon size={12} />
	</button>

	<!-- 收起时只是隐藏、不从页面里拿掉：构建时预渲染靠爬页面里的链接找到各语言的页，搜索引擎也一样 -->
	<ul
		class="absolute top-[calc(100%+12px)] left-0 z-9 min-w-[150px] rounded-[12px] border border-line bg-white py-1.5 text-[13px] shadow-[0_8px_24px_#163b3818] desk:right-0 desk:left-auto {open
			? ''
			: 'hidden'}"
	>
		{#each locales as locale (locale)}
			<li lang={locale}>
				{#if locale === current}
					<span class="block px-4 py-1.5 font-semibold text-ink">{localeNames[locale]}</span>
				{:else}
					<!-- 换语言整页重载，服务端按新地址定语言 -->
					<a
						class="block px-4 py-1.5 text-muted transition-colors hover:bg-[#f0f7f5] hover:text-teal"
						href={localized(path, locale)}
						hreflang={locale}
						data-sveltekit-reload
						onclick={() => {
							open = false;
							onpick?.();
						}}>{localeNames[locale]}</a
					>
				{/if}
			</li>
		{/each}
	</ul>
</div>
