<script lang="ts">
	import CheckIcon from 'phosphor-svelte/lib/CheckIcon';
	import XIcon from 'phosphor-svelte/lib/XIcon';
	import { ui } from '$lib/ui.svelte';
	import Button from './Button.svelte';

	let dialog = $state<HTMLElement | undefined>();

	const copy = $derived.by(() => {
		const id = ui.modal;
		if (id === 'Windows' || id === 'Linux')
			return { title: `${id} 版正在规划中`, body: '更多平台支持正在路上，敬请期待。' };
		return { title: '与青简保持连接', body: '社区链接尚未配置，敬请期待。' };
	});

	function focusables() {
		return [...(dialog?.querySelectorAll<HTMLElement>('button, a, input, [tabindex="0"]') ?? [])];
	}

	// 打开时锁滚动、聚焦到弹窗内，关闭后把焦点还给触发元素
	$effect(() => {
		if (!ui.modal) return;

		const previous = document.activeElement as HTMLElement | null;
		focusables()[0]?.focus();

		const overflow = document.body.style.overflow;
		document.body.style.overflow = 'hidden';

		return () => {
			document.body.style.overflow = overflow;
			previous?.focus();
		};
	});

	// Tab 在弹窗内循环，Esc 关闭
	function onkeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			ui.modal = null;
			return;
		}
		if (event.key !== 'Tab') return;

		const items = focusables();
		const first = items[0];
		const last = items.at(-1);
		if (!first || !last) return;

		if (event.shiftKey && document.activeElement === first) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && document.activeElement === last) {
			event.preventDefault();
			first.focus();
		}
	}
</script>

<svelte:window {onkeydown} />

<!-- 背景层点击关闭；键盘路径由 Esc 覆盖，故无需额外角色 -->
<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
<div
	class="fixed inset-0 z-10 flex items-center justify-center bg-[#163b3859] p-5 backdrop-blur-[6px]"
	onclick={() => (ui.modal = null)}
>
	<!-- 弹窗内点击只做冒泡拦截，键盘交互走上面的 Esc / Tab 处理 -->
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<div
		bind:this={dialog}
		class="relative max-h-[90vh] w-[480px] max-w-full overflow-auto rounded-[20px] border border-line bg-white p-[25px] shadow-[0_24px_90px_#12382c33] desk:p-8"
		role="dialog"
		aria-modal="true"
		aria-labelledby="modal-title"
		tabindex="-1"
		onclick={(event) => event.stopPropagation()}
	>
		<button
			class="absolute top-4 right-4 grid size-8 place-items-center rounded-full bg-[#f0f7f5]"
			aria-label="关闭"
			onclick={() => (ui.modal = null)}
		>
			<XIcon size={22} />
		</button>

		<img class="mb-3.5 h-[50px] w-12 object-contain" src="/assets/logo.png" alt="" />
		<h2 id="modal-title" class="mb-3 font-song text-[26px] font-bold">{copy.title}</h2>
		<p class="my-[10px] mb-4 text-sm leading-[1.55] text-muted">{copy.body}</p>
		<Button onclick={() => (ui.modal = null)}>知道了 <CheckIcon size={17} /></Button>
	</div>
</div>
