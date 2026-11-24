<script lang="ts">
	import CaretLeftIcon from 'phosphor-svelte/lib/CaretLeftIcon';
	import CaretRightIcon from 'phosphor-svelte/lib/CaretRightIcon';
	import XIcon from 'phosphor-svelte/lib/XIcon';

	/**
	 * 看大图：点 root 里任一 [data-full] 按钮打开，左右键或两侧按钮切换同页的图，Esc、点背景或关闭按钮退出。
	 * 打开时锁住页面滚动，关闭后焦点还给原来的缩略图。
	 */
	let { root }: { root: HTMLElement | undefined } = $props();

	type Item = { full: string; alt: string; trigger: HTMLElement };
	let items = $state<Item[]>([]);
	let index = $state<number | null>(null);
	let closeButton = $state<HTMLButtonElement | undefined>();

	const current = $derived(index === null ? null : items[index]);

	$effect(() => {
		if (!root) return;
		const onclick = (event: MouseEvent) => {
			const trigger = (event.target as HTMLElement).closest<HTMLElement>('[data-full]');
			if (!trigger || !root.contains(trigger)) return;
			event.preventDefault();
			const triggers = [...root.querySelectorAll<HTMLElement>('[data-full]')];
			items = triggers.map((element) => ({
				full: element.dataset.full ?? '',
				alt: element.querySelector('img')?.alt ?? '',
				trigger: element
			}));
			index = triggers.indexOf(trigger);
		};
		root.addEventListener('click', onclick);
		return () => root.removeEventListener('click', onclick);
	});

	$effect(() => {
		if (index === null) return;
		const trigger = items[index]?.trigger;
		const overflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		closeButton?.focus();
		return () => {
			document.body.style.overflow = overflow;
			trigger?.focus();
		};
	});

	function step(delta: number) {
		if (index === null || !items.length) return;
		index = (index + delta + items.length) % items.length;
	}

	function close() {
		index = null;
	}

	/** 页面主体是 z-1 的层叠上下文，留在里面盖不住顶栏；挂到 body 下才能整屏覆盖 */
	function portal(node: HTMLElement) {
		document.body.appendChild(node);
		return { destroy: () => node.remove() };
	}

	function onkeydown(event: KeyboardEvent) {
		if (index === null) return;
		if (event.key === 'Escape') close();
		else if (event.key === 'ArrowLeft') step(-1);
		else if (event.key === 'ArrowRight') step(1);
	}
</script>

<svelte:window {onkeydown} />

{#if current}
	<!-- 点背景关闭只是鼠标的捷径，键盘用 Esc（在 window 上处理） -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		use:portal
		class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 p-4"
		role="dialog"
		aria-modal="true"
		aria-label={current.alt || '大图'}
		tabindex="-1"
		onclick={(event) => {
			if (event.target === event.currentTarget) close();
		}}
	>
		<button
			bind:this={closeButton}
			type="button"
			class="absolute top-4 right-4 grid size-10 place-items-center rounded-full text-white/80 hover:bg-white/10 hover:text-white"
			aria-label="关闭"
			onclick={close}
		>
			<XIcon size={22} />
		</button>
		{#if items.length > 1}
			<button
				type="button"
				class="absolute top-1/2 left-2 grid size-11 -translate-y-1/2 place-items-center rounded-full text-white/80 hover:bg-white/10 hover:text-white"
				aria-label="上一张"
				onclick={() => step(-1)}
			>
				<CaretLeftIcon size={26} />
			</button>
			<button
				type="button"
				class="absolute top-1/2 right-2 grid size-11 -translate-y-1/2 place-items-center rounded-full text-white/80 hover:bg-white/10 hover:text-white"
				aria-label="下一张"
				onclick={() => step(1)}
			>
				<CaretRightIcon size={26} />
			</button>
		{/if}
		<img
			src={current.full}
			alt={current.alt}
			class="max-h-[calc(100vh-110px)] max-w-[min(1400px,calc(100vw-120px))] rounded object-contain"
		/>
		<p class="mt-3 max-w-[760px] text-center text-[14px] leading-[1.6] text-white/85">
			{current.alt}
			{#if items.length > 1}<span class="ml-2 text-white/50"
					>{(index ?? 0) + 1} / {items.length}</span
				>{/if}
		</p>
	</div>
{/if}
