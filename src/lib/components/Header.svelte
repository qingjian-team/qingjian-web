<script lang="ts">
	import GithubLogoIcon from 'phosphor-svelte/lib/GithubLogoIcon';
	import ListIcon from 'phosphor-svelte/lib/ListIcon';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import Brand from './Brand.svelte';
	import NavLink from './NavLink.svelte';
	import { isCurrentPath, navLinks } from '$lib/data';

	let menu = $state(false);

	/**
	 * 像竹简一样随滚动收展：往下滚收起来让位给正文，往上滚立刻回来，靠近页顶总是展开。
	 * 小于 6px 的抖动不算方向变化；手机菜单打开时不收。
	 */
	let rolled = $state(false);
	$effect(() => {
		const NEAR_TOP = 80;
		const JITTER = 6;
		let last = window.scrollY;
		let frame = 0;
		const update = () => {
			frame = 0;
			const y = window.scrollY;
			const delta = y - last;
			if (y < NEAR_TOP) rolled = false;
			else if (delta > JITTER) rolled = true;
			else if (delta < -JITTER) rolled = false;
			last = y;
		};
		const schedule = () => {
			if (!frame) frame = requestAnimationFrame(update);
		};
		window.addEventListener('scroll', schedule, { passive: true });
		return () => {
			window.removeEventListener('scroll', schedule);
			if (frame) cancelAnimationFrame(frame);
		};
	});

	const hidden = $derived(rolled && !menu);
</script>

<header
	class="fixed top-[10px] left-1/2 z-8 h-[58px] w-[calc(100%-24px)] -translate-x-1/2 rounded-[17px] border border-[#dfeae6] bg-white/87 shadow-[0_6px_26px_#254b3510] backdrop-blur-xl transition-[translate,opacity] duration-300 ease-out motion-reduce:transition-none desk:top-[14px] desk:w-[min(1152px,calc(100%-40px))] {hidden
		? 'pointer-events-none -translate-y-[calc(100%+24px)] opacity-0'
		: ''}"
	aria-hidden={hidden}
>
	<div class="flex h-full items-center justify-between px-[15px] desk:px-[22px]">
		<Brand />

		<button class="desk:hidden" aria-label="打开导航" onclick={() => (menu = !menu)}>
			<ListIcon size={25} />
		</button>

		<nav
			class="absolute top-[65px] right-0 left-0 flex-wrap gap-[23px] rounded-[14px] bg-white px-[6%] py-[22px] text-[13px] font-medium shadow-[0_8px_12px_#163b3812] desk:static desk:flex desk:flex-nowrap desk:gap-[29px] desk:bg-transparent desk:p-0 desk:shadow-none {menu
				? 'flex'
				: 'hidden'}"
		>
			{#each navLinks as link (link.path)}
				<NavLink
					href={resolve(link.path)}
					label={link.label}
					current={isCurrentPath(page.url.pathname, link.path)}
					onclick={() => (menu = false)}
				/>
			{/each}
			<!-- 源码仓库：桌面端只画图标、用竖线与站内导航隔开，手机菜单里带文字 -->
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- 外部链接 -->
			<a
				class="flex items-center gap-1.5 text-muted transition-colors hover:text-teal desk:border-l desk:border-line desk:pl-[22px]"
				href="https://github.com/qingjian-team/qingjian"
				target="_blank"
				rel="noopener"
				aria-label="GitHub 仓库"
				onclick={() => (menu = false)}
			>
				<GithubLogoIcon size={19} />
				<span class="desk:hidden">GitHub</span>
			</a>
		</nav>
	</div>
</header>
