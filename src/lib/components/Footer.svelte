<script lang="ts">
	import GithubLogoIcon from 'phosphor-svelte/lib/GithubLogoIcon';
	import LeafIcon from 'phosphor-svelte/lib/LeafIcon';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import Brand from './Brand.svelte';
	import NavLink from './NavLink.svelte';
	import { isCurrentPath, navLinks } from '$lib/data';
	import { ui } from '$lib/ui.svelte';

	/** 站点上线于 2026 年，跨年后显示为区间 */
	const START_YEAR = 2026;
	const currentYear = new Date().getFullYear();
	const copyrightYears = currentYear > START_YEAR ? `${START_YEAR}-now` : `${START_YEAR}`;

	/** 社区链接。X 账号还没开，先不列 */
	const community = [
		{ label: 'GitHub', icon: GithubLogoIcon, href: 'https://github.com/qingjian-team' }
	];
</script>

<footer class="relative z-1 mx-auto mt-16 w-[88%] desk:w-[min(1152px,90%)]">
	<div
		class="grid gap-10 border-t border-line pt-10 desk:grid-cols-[2fr_1fr_1fr] desk:gap-8 desk:pt-12"
	>
		<div>
			<Brand />
			<p class="mt-4 max-w-[280px] text-[13px] leading-[1.7] text-muted">
				输入的时候，顺便多认识一个词。
			</p>
			<span class="mt-3 inline-block text-[11px] tracking-[.5px] text-[#9aa5b1]">
				用 Rust 写的拼音输入法 · macOS 测试版 · Windows 内测版
			</span>
		</div>

		<nav aria-labelledby="footer-site">
			<h2 id="footer-site" class="text-[11px] font-semibold tracking-[1.5px] text-[#18324b]">
				站点
			</h2>
			<ul class="mt-4 flex flex-col gap-2.5">
				{#each navLinks as link (link.path)}
					<li class="text-[13px] text-muted">
						<NavLink
							href={resolve(link.path)}
							label={link.label}
							current={isCurrentPath(page.url.pathname, link.path)}
							orientation="vertical"
						/>
					</li>
				{/each}
			</ul>
		</nav>

		<nav aria-labelledby="footer-community">
			<h2 id="footer-community" class="text-[11px] font-semibold tracking-[1.5px] text-[#18324b]">
				社区
			</h2>
			<ul class="mt-4 flex flex-col gap-2.5">
				{#each community as item (item.href)}
					{@const Icon = item.icon}
					<li>
						<!-- eslint-disable svelte/no-navigation-without-resolve -- 外部链接 -->
						<a
							class="flex items-center gap-2 text-[13px] text-muted transition-colors hover:text-teal"
							href={item.href}
							target="_blank"
							rel="noopener"
						>
							<Icon size={15} />
							{item.label}
						</a>
						<!-- eslint-enable svelte/no-navigation-without-resolve -->
					</li>
				{/each}
			</ul>
		</nav>
	</div>

	<div
		class="mt-10 flex flex-col gap-3 border-t border-line py-5 text-[11px] text-[#8b95a4] desk:flex-row desk:items-center desk:justify-between"
	>
		<span>
			© {copyrightYears}
			<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- 官网绝对地址 -->
			<a class="transition-colors hover:text-teal" href="https://qingjian.app">青简 Qingjian</a>
		</span>

		<div class="flex flex-wrap items-center gap-x-4 gap-y-1">
			<span class="font-song tracking-[.5px]">不积跬步，无以至千里。</span>
			<button
				class="inline-flex items-center gap-[5px] text-[#668679] transition-colors hover:text-[#007d6c] disabled:cursor-default disabled:text-[#8b95a4]"
				onclick={() => (ui.wind = !ui.wind)}
				disabled={ui.reducedMotion}
				aria-pressed={ui.animate}
			>
				<LeafIcon size={13} />
				{ui.reducedMotion ? '静态竹影' : ui.wind ? '暂停风动' : '开启风动'}
			</button>
		</div>
	</div>
</footer>
