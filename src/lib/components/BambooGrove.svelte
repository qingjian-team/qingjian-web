<script lang="ts">
	import { ui } from '$lib/ui.svelte';

	/** 四层竹影，远景两层模糊虚化、近景两层压在页面边缘，各自不同的摆动周期 */
	const layers = [
		{
			// 远景左
			box: 'hidden desk:block left-[-6%] bottom-[-28%] blur-[2px] w-[clamp(360px,34vw,620px)] opacity-[.07] wide:opacity-[.12]',
			img: 'desk:[animation-duration:21s] [animation-delay:-8s]'
		},
		{
			// 远景右（水平翻转）
			box: 'hidden desk:block right-[-9%] bottom-[-14%] blur-[3px] w-[clamp(360px,38vw,650px)] opacity-[.07] wide:opacity-[.1] [transform:scaleX(-1)]',
			img: 'desk:[animation-duration:25s] [animation-delay:-13s]'
		},
		{
			// 近景左
			box: 'left-[-170px] bottom-[-5%] w-[260px] opacity-[.14] desk:left-[-185px] desk:bottom-[-20%] desk:w-[330px] desk:opacity-[.16] wide:left-[clamp(-190px,-10vw,-70px)] wide:w-[clamp(240px,26vw,470px)] wide:opacity-[.37]',
			img: 'desk:[animation-duration:12s] [animation-delay:-5s]'
		},
		{
			// 近景右（水平垂直都翻转，竹梢朝下）
			box: 'right-[-160px] top-[12%] w-[240px] opacity-[.12] [transform:scale(-1,-1)] desk:right-[-185px] desk:top-[-24%] desk:w-[330px] desk:opacity-[.16] wide:right-[clamp(-170px,-9vw,-60px)] wide:w-[clamp(240px,26vw,470px)] wide:opacity-[.3]',
			img: 'desk:[animation-duration:15s] [animation-delay:-11s]'
		}
	];
</script>

<div class="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none" aria-hidden="true">
	{#each layers as layer (layer.box)}
		<div class="absolute origin-[50%_100%] {layer.box}">
			<img
				class="block h-auto w-full origin-[22%_98%] animate-bamboo [animation-duration:20s] motion-reduce:animate-none {layer.img}"
				style:animation-play-state={ui.animate ? 'running' : 'paused'}
				src="/assets/bamboo-grove.webp"
				alt=""
				draggable="false"
			/>
		</div>
	{/each}
</div>
