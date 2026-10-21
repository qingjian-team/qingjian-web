<script lang="ts">
	import { resolve } from '$app/paths';
	import { localized } from '$lib/i18n';
	import { m } from '$lib/paraglide/messages';

	let { class: className = '' }: { class?: string } = $props();
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -- 站内链接经 localized()：先 resolve()，再加语言前缀 -->

<a
	class="flex items-center gap-[9px] whitespace-nowrap {className}"
	href={localized(resolve('/'))}
	aria-label={m.brand_home_label()}
>
	<img class="h-[21px] w-auto desk:h-[23px]" src="/assets/logo.svg" alt={m.brand_logo_alt()} />
	<strong class="font-brand text-[21px] font-bold tracking-[2px] desk:text-[23px]"
		>{m.brand_name()}</strong
	>
	<span class="font-georgia text-[14px] tracking-[1px] desk:text-[16px]">Qingjian</span>
</a>
