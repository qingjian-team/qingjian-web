<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';

	type Props = {
		children: Snippet;
		variant?: 'solid' | 'outline';
		class?: string;
	} & (({ href: string } & HTMLAnchorAttributes) | ({ href?: never } & HTMLButtonAttributes));

	let { children, variant = 'solid', class: className = '', href, ...rest }: Props = $props();

	const base =
		'inline-flex min-h-[39px] items-center justify-center gap-2.5 rounded-xl border text-sm font-semibold transition hover:-translate-y-px';
	const variants = {
		solid:
			'border-teal bg-teal px-[25px] text-white shadow-[inset_0_0_10px_#ffffff13] hover:bg-teal-dark',
		outline: 'border-teal bg-white/72 px-[22px] text-teal hover:bg-[#edf8f6]'
	};
</script>

{#if href}
	<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- href 由调用方 resolve() 后传入 -->
	<a {href} class="{base} {variants[variant]} {className}" {...rest as HTMLAnchorAttributes}>
		{@render children()}
	</a>
{:else}
	<button class="{base} {variants[variant]} {className}" {...rest as HTMLButtonAttributes}>
		{@render children()}
	</button>
{/if}
