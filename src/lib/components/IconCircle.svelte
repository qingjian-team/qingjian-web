<script lang="ts">
	import type { PhosphorIcon } from '$lib/data';

	let {
		icon: Icon,
		size = 25,
		class: className = 'size-[45px] rounded-[20px]'
	}: { icon: PhosphorIcon; size?: number; class?: string } = $props();
</script>

<span
	class="inline-flex shrink-0 items-center justify-center bg-[#eef5e8] text-[#336f33] {className}"
>
	<Icon {size} weight="regular" />
</span>
