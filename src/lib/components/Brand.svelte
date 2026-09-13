<script lang="ts">
	import { resolve } from '$app/paths';

	let { class: className = '' }: { class?: string } = $props();
</script>

<a
	class="flex items-center gap-[9px] whitespace-nowrap {className}"
	href={resolve('/')}
	aria-label="青简首页"
>
	<img class="h-[21px] w-auto desk:h-[23px]" src="/assets/logo.svg" alt="青简标志" />
	<strong class="font-song text-[21px] font-bold tracking-[2px] desk:text-[23px]">青简</strong>
	<span class="font-georgia text-[14px] tracking-[1px] desk:text-[16px]">Qingjian</span>
</a>
