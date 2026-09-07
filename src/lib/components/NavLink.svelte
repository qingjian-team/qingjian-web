<script lang="ts">
	let {
		href,
		label,
		current,
		orientation = 'horizontal',
		onclick
	}: {
		href: string;
		label: string;
		current: boolean;
		orientation?: 'horizontal' | 'vertical';
		onclick?: () => void;
	} = $props();

	const classes = $derived(
		`relative flex items-center transition-colors hover:text-teal ${current ? 'text-teal' : ''}`
	);
</script>

<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- href 由调用方 resolve() 后传入 -->
<a {href} class={classes} aria-current={current ? 'page' : undefined} {onclick}>
	{label}
	{#if current}
		<!-- 竹节标记，纯装饰 -->
		{#if orientation === 'horizontal'}
			<span
				class="pointer-events-none absolute right-0 -bottom-[7px] left-0 h-[2px] rounded-full bamboo-joint-x"
				aria-hidden="true"
			></span>
		{:else}
			<span
				class="pointer-events-none absolute top-[2px] bottom-[2px] -left-[11px] w-[2px] rounded-full bamboo-joint-y"
				aria-hidden="true"
			></span>
		{/if}
	{/if}
</a>
