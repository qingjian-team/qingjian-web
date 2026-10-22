<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import ArrowRightIcon from 'phosphor-svelte/lib/ArrowRightIcon';
	import ArrowSquareOutIcon from 'phosphor-svelte/lib/ArrowSquareOutIcon';
	import ClockIcon from 'phosphor-svelte/lib/ClockIcon';
	import DownloadSimpleIcon from 'phosphor-svelte/lib/DownloadSimpleIcon';
	import Button from '$lib/components/Button.svelte';
	import Contributors from '$lib/components/Contributors.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import SectionHeading from '$lib/components/SectionHeading.svelte';
	import Subpage from '$lib/components/Subpage.svelte';
	import { renderInline } from '$lib/docs/render';
	import { localized } from '$lib/i18n';
	import { m } from '$lib/paraglide/messages';
	import { getLocale } from '$lib/paraglide/runtime';
	import {
		channelLabel,
		detectArch,
		detectPlatform,
		downloadsOpen,
		formatBuiltAt,
		formatSize,
		latest,
		latestFor,
		previewPlatforms,
		renderNote,
		platforms,
		releaseGroups,
		releasedPlatforms,
		shortCommit,
		splitContributors,
		unsignedHints,
		type Arch,
		type PlatformId,
		type Release,
		type ReleaseGroup
	} from '$lib/releases';

	/**
	 * 访问者的系统与 CPU，挂载后再猜；服务端与猜不出时按 macOS + Apple Silicon 展示。
	 * 放在 onMount 而不是 $derived 里，让服务端渲染与首次客户端渲染一致，不出水合差异。
	 */
	let detected = $state<PlatformId | null>(null);
	let arch = $state<Arch | null>(null);
	onMount(() => {
		detected = detectPlatform();
		void detectArch().then((found) => (arch = found));
	});

	const detectedPlatform = $derived(platforms.find((p) => p.id === detected) ?? null);
	/** 检测到的系统还没有版本时，主按钮位置只说「计划中」；点「替 Mac 下载」再把 macOS 的按钮放出来 */
	let showMacAnyway = $state(false);
	const heroPlatform = $derived(
		detectedPlatform?.available ? detectedPlatform : platforms.find((p) => p.available)!
	);
	const heroHidden = $derived(!!detectedPlatform && !detectedPlatform.available && !showMacAnyway);
	/** 这个平台最新的那版（各平台版本号独立）；还没发过就为 null，页首退回全局最新、不给按钮 */
	const platformRelease = $derived(latestFor(heroPlatform.id));
	const heroRelease = $derived(platformRelease ?? latest);
	/** 主按钮只给一个包：这个平台上与猜到的架构一致的，猜不出按 Apple Silicon；其余架构的包作小字链接 */
	const heroAssets = $derived(
		platformRelease?.assets.filter((a) => a.platform === heroPlatform.id) ?? []
	);
	const heroAsset = $derived(
		heroAssets.find((a) => a.cpu === (arch ?? 'arm64')) ?? heroAssets[0] ?? null
	);
	const otherAssets = $derived(heroAssets.filter((a) => a !== heroAsset));
	/** 页首的更新日志：贡献者那一行摘出来画成头像 */
	const heroNotes = $derived(splitContributors(heroRelease.notes));

	function platformName(id: PlatformId | null) {
		return platforms.find((p) => p.id === id)?.name ?? id ?? '';
	}

	/** 版本卡片里的构建行：共用一个 GitHub Release 的几个平台合成一行（0.1.4 起），更早按平台分开发的各占一行 */
	function releaseLines(builds: Release[]) {
		const lines: { build: Release; names: string }[] = [];
		for (const build of builds) {
			const same = lines.find((line) => build.tag && line.build.tag === build.tag);
			if (same) same.names += ` / ${platformName(build.platform)}`;
			else lines.push({ build, names: platformName(build.platform) });
		}
		return lines;
	}

	/** 「全部版本」的标签页：全部，或只看某个发过版本的平台 */
	let tab = $state<'all' | PlatformId>('all');
	const tabs = $derived([
		{ id: 'all' as const, name: m.dl_tab_all() },
		...releasedPlatforms.map((p) => ({ id: p.id, name: p.name }))
	]);
	/** 按标签页过滤：只看某平台时，只留有该平台构建的版本，且每条只显示那个平台的构建 */
	const shownGroups = $derived<ReleaseGroup[]>(
		tab === 'all'
			? releaseGroups
			: releaseGroups
					.map((g) => ({ ...g, builds: g.builds.filter((b) => b.platform === tab) }))
					// 本地预览的版本没有构建，按更新日志的平台前缀判断归属
					.filter(
						(g) =>
							g.builds.length > 0 || (g.preview && previewPlatforms(g.notes).some((p) => p === tab))
					)
	);

	/** 更新日志来自主仓库的 CHANGELOG，只有中文；其他语言的页面在日志上方说一句 */
	const notesInChinese = getLocale() !== 'zh-Hans';
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -- 站内链接经 localized()：先 resolve()，再加语言前缀 -->

<Seo
	title={m.dl_seo_title()}
	description={downloadsOpen
		? m.dl_seo_desc_open({ version: latest.version })
		: m.dl_seo_desc_soon({ version: latest.version })}
/>

<Subpage
	title={downloadsOpen ? m.dl_title_open() : m.dl_title_soon()}
	desc={downloadsOpen ? m.dl_desc_open() : m.dl_desc_soon()}
>
	<!-- 顶部：当前版本 + 主下载按钮 + 这一版的更新日志 -->
	<section
		class="grid gap-6 rounded-2xl border border-line bg-white/86 p-5 desk:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] desk:gap-10 desk:p-[30px]"
	>
		<div>
			<div class="flex flex-wrap items-center gap-2">
				<span class="font-song text-[34px] leading-none font-bold">{heroRelease.version}</span>
				<span
					class="rounded-[20px] bg-[#fff1dc] px-2 py-[3px] text-[11px] font-semibold text-[#b25f00]"
					>{channelLabel(heroRelease.channel)}</span
				>
				<span class="text-[13px] text-muted">{heroPlatform.name}</span>
			</div>
			<p class="mt-2 text-[13px] text-muted">
				{m.dl_released_on({ date: heroRelease.date })}{#if heroRelease.commit}
					· {m.dl_commit()} <code class="text-[12px]">{shortCommit(heroRelease.commit)}</code>{/if}
			</p>

			<div class="mt-6 flex flex-col gap-3">
				{#if !downloadsOpen}
					<span
						class="inline-flex w-fit items-center gap-2 rounded-xl border border-dashed border-[#bcd98f] bg-[#f0f7f5] px-[18px] py-[10px] text-sm font-medium text-teal"
					>
						<ClockIcon size={17} />
						{m.dl_soon_badge()}
					</span>
					<p class="text-[12px] leading-[1.7] text-muted">
						{m.dl_soon_note({ requirement: heroPlatform.requirement() })}
					</p>
				{:else if heroHidden && detectedPlatform}
					<span
						class="inline-flex w-fit items-center gap-2 rounded-xl border border-dashed border-[#c9d3d0] bg-[#f4f6f5] px-[18px] py-[10px] text-sm font-medium text-[#6b7a76]"
					>
						<ClockIcon size={17} />
						{m.dl_planned_badge({ platform: detectedPlatform.name })}
					</span>
					<p class="text-[12px] leading-[1.7] text-muted">
						{m.dl_planned_note({ platform: detectedPlatform.name })}
						<button class="text-teal hover:underline" onclick={() => (showMacAnyway = true)}
							>{m.dl_planned_mac()}</button
						>{m.dl_planned_end()}
					</p>
				{:else if heroAsset}
					<div class="flex flex-wrap items-center gap-2.5">
						<Button href={heroAsset.url} download class="w-fit">
							{m.dl_button({ platform: heroPlatform.name, arch: heroAsset.arch })}
							<DownloadSimpleIcon size={18} />
						</Button>
						<!-- GitHub 下载慢时的网盘，同一版本各平台共用一个地址 -->
						{#each heroRelease.mirrors as mirror (mirror.url)}
							<Button
								href={mirror.url}
								variant="outline"
								target="_blank"
								rel="noopener"
								class="w-fit"
							>
								{m.dl_mirror({ name: mirror.name })}
								<ArrowSquareOutIcon size={16} />
							</Button>
						{/each}
					</div>
					<p class="text-[12px] leading-[1.7] text-muted">
						{m.dl_hero_meta({
							requirement: heroPlatform.requirement(),
							size: formatSize(heroAsset.size)
						})}
						{#each otherAssets as other (other.file)}
							{m.dl_other_arch_before({ arch: other.arch })}
							<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- 安装包是外部下载地址 -->
							<a class="text-teal hover:underline" href={other.url} download
								>{m.dl_other_arch_link({ arch: other.arch })}</a
							>{m.dl_other_arch_after()}
						{/each}
						{m.dl_checksums_before()}
						<a class="text-teal hover:underline" href="#releases">{m.dl_checksums_link()}</a
						>{m.dl_checksums_after()}
						{unsignedHints[heroPlatform.id]()}
					</p>
				{/if}
				<div class="flex flex-wrap items-center gap-x-4 gap-y-1">
					<a
						class="inline-flex w-fit items-center gap-1 text-[13px] text-teal hover:underline"
						href={localized(resolve('/docs/[...path]', { path: 'getting-started/install' }))}
					>
						{m.dl_install_guide()}
						<ArrowRightIcon size={14} />
					</a>
					<!-- eslint-disable svelte/no-navigation-without-resolve -- 外部链接 -->
					<a
						class="inline-flex w-fit items-center gap-1 text-[13px] text-teal hover:underline"
						href={heroRelease.pageUrl}
						target="_blank"
						rel="noopener"
					>
						{m.dl_view_on_github()}
						<ArrowSquareOutIcon size={14} />
					</a>
					<!-- eslint-enable svelte/no-navigation-without-resolve -->
				</div>
			</div>
		</div>

		<div>
			<h2 class="mb-3 text-[13px] font-semibold tracking-[1.5px] text-[#18324b]">
				{m.dl_whats_new()}
			</h2>
			{#if notesInChinese}
				<p class="mb-2 text-[12px] text-muted">{m.dl_notes_chinese()}</p>
			{/if}
			<ul class="flex flex-col gap-2" lang="zh-Hans">
				{#each heroNotes.notes as note (note)}
					<li class="flex gap-2 text-[13px] leading-[1.65] text-muted">
						<span class="mt-[9px] size-[5px] shrink-0 rounded-full bg-teal"></span>
						<!-- eslint-disable-next-line svelte/no-at-html-tags -- 更新日志来自我们自己发版时生成的 releases.json，渲染时已转义 -->
						<span>{@html renderNote(note, renderInline)}</span>
					</li>
				{/each}
			</ul>
			{#if heroNotes.contributors.length > 0}
				<Contributors contributors={heroNotes.contributors} class="mt-4" />
			{/if}
		</div>
	</section>

	<!-- 平台一览 -->
	<section id="platforms" class="scroll-mt-3">
		<SectionHeading title={m.dl_platforms_title()} desc={m.dl_platforms_desc()} />
		<div class="grid gap-2.5 desk:grid-cols-4 desk:gap-[13px]">
			{#each platforms as platform (platform.id)}
				{@const Icon = platform.icon}
				<article
					class="flex min-h-[70px] items-center gap-[15px] rounded-[9px] border border-[#e8f0ef] bg-white/94 p-3 px-[18px] shadow-[0_3px_10px_#183c3506] desk:gap-[11px]"
				>
					<Icon size={32} weight={platform.id === 'linux' ? 'regular' : 'fill'} class="shrink-0" />
					<div>
						<strong class="text-sm font-medium">{platform.name}</strong>
						<small class="mt-[3px] block text-[11px] text-muted"
							>{platform.available ? platform.requirement() : platform.api}</small
						>
					</div>
					<span
						class="ml-auto rounded-[20px] px-2 py-[3px] text-[11px] whitespace-nowrap {platform.available
							? 'bg-[#e3efcf] font-semibold text-[#336f33]'
							: 'bg-[#f1f2f4] text-[#84909d]'}"
					>
						{platform.available
							? platform.id === 'windows'
								? m.dl_status_alpha()
								: platform.id === 'android'
									? m.dl_status_preview()
									: m.dl_status_beta()
							: m.dl_status_planned()}
					</span>
				</article>
			{/each}
		</div>
	</section>

	<!-- 全部版本：下载没开放时不列（全是「暂无」的表格没有信息量） -->
	<section id="releases" class="scroll-mt-3" hidden={!downloadsOpen}>
		<SectionHeading title={m.dl_releases_title()} desc={m.dl_releases_desc()} />
		<div class="mb-4 flex flex-wrap gap-2" role="tablist" aria-label={m.dl_tabs_label()}>
			{#each tabs as item (item.id)}
				<button
					type="button"
					role="tab"
					aria-selected={tab === item.id}
					class="rounded-[20px] border px-3 py-1 text-[13px] transition-colors {tab === item.id
						? 'border-teal bg-teal text-white'
						: 'border-line bg-white/86 text-muted hover:text-ink'}"
					onclick={() => (tab = item.id)}
				>
					{item.name}
				</button>
			{/each}
		</div>
		<div class="flex flex-col gap-4">
			{#each shownGroups as group (group.version)}
				{@const groupNotes = splitContributors(group.notes)}
				<article class="rounded-2xl border border-line bg-white/86 p-5 desk:p-6">
					<header class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
						<h3 class="font-song text-[22px] font-bold">{group.version}</h3>
						<span class="text-[12px] text-muted"
							>{group.preview ? m.dl_unreleased() : group.date} · {channelLabel(
								group.channel
							)}</span
						>
					</header>
					<!-- 每个平台一行：提交、构建时间、GitHub Release；同版本号多平台时叠着列。本地预览的版本还没有构建 -->
					<ul class="mt-1 flex flex-col gap-0.5 text-[12px] text-muted" hidden={group.preview}>
						{#each releaseLines(group.builds) as { build, names } ((build.tag || build.version) + build.platform)}
							<li class="flex flex-wrap items-center gap-x-2">
								<strong class="font-medium text-ink">{names}</strong>
								{#if build.commit}<span
										>· {m.dl_commit()} <code>{shortCommit(build.commit)}</code></span
									>{/if}
								{#if build.builtAt}<span
										>· {m.dl_built_at({ time: formatBuiltAt(build.builtAt) })}</span
									>{/if}
								<span>·</span>
								<!-- eslint-disable svelte/no-navigation-without-resolve -- 外部链接 -->
								<a
									class="inline-flex items-center gap-1 text-teal hover:underline"
									href={build.pageUrl}
									target="_blank"
									rel="noopener"
								>
									GitHub Release <ArrowSquareOutIcon size={13} />
								</a>
								<!-- eslint-enable svelte/no-navigation-without-resolve -->
							</li>
						{/each}
					</ul>
					{#if group.mirrors.length > 0 && !group.preview}
						<p class="mt-1 flex flex-wrap items-center gap-x-2 text-[12px] text-muted">
							{m.dl_mirrors_note()}
							<!-- eslint-disable svelte/no-navigation-without-resolve -- 外部链接 -->
							{#each group.mirrors as mirror (mirror.url)}
								<a
									class="inline-flex items-center gap-1 text-teal hover:underline"
									href={mirror.url}
									target="_blank"
									rel="noopener">{mirror.name} <ArrowSquareOutIcon size={13} /></a
								>
							{/each}
							<!-- eslint-enable svelte/no-navigation-without-resolve -->
						</p>
					{/if}

					{#if group.builds.includes(heroRelease)}
						<p class="mt-2 text-[12px] text-muted">{m.dl_current_note()}</p>
					{:else}
						<ul
							class="mt-3 grid gap-x-6 gap-y-1.5 text-[13px] leading-[1.65] text-muted desk:grid-cols-2"
							lang="zh-Hans"
						>
							{#each groupNotes.notes as note (note)}
								<li class="flex gap-2">
									<span class="mt-[9px] size-[4px] shrink-0 rounded-full bg-[#94be52]"></span>
									<!-- eslint-disable-next-line svelte/no-at-html-tags -- 更新日志来自我们自己发版时生成的 releases.json，渲染时已转义 -->
									<span>{@html renderNote(note, renderInline)}</span>
								</li>
							{/each}
						</ul>
						{#if groupNotes.contributors.length > 0}
							<Contributors contributors={groupNotes.contributors} class="mt-3" />
						{/if}
					{/if}

					<div class="mt-4 overflow-x-auto rounded-lg border border-line" hidden={group.preview}>
						<table class="w-full min-w-[560px] text-left text-[13px]">
							<thead class="bg-[#f0f7f2] text-[12px] text-[#4d6b62]">
								<tr>
									<th class="px-3 py-2 font-medium">{m.dl_col_platform()}</th>
									<th class="px-3 py-2 font-medium">{m.dl_col_chip()}</th>
									<th class="px-3 py-2 font-medium">{m.dl_col_file()}</th>
									<th class="px-3 py-2 font-medium">{m.dl_col_size()}</th>
									<th class="px-3 py-2 font-medium"></th>
								</tr>
							</thead>
							<tbody>
								{#each group.builds.flatMap((b) => b.assets) as asset (asset.file)}
									<tr class="border-t border-line">
										<td class="px-3 py-2 whitespace-nowrap">{platformName(asset.platform)}</td>
										<td class="px-3 py-2 whitespace-nowrap text-muted">{asset.arch}</td>
										<td class="px-3 py-2">
											<code class="rounded bg-[#eef3f1] px-1.5 py-0.5 text-[12px] text-ink"
												>{asset.file}</code
											>
											{#if asset.sha256}
												<span
													class="mt-1 block font-mono text-[11px] leading-[1.5] break-all text-muted"
													title="SHA-256">SHA-256 {asset.sha256}</span
												>
											{/if}
										</td>
										<td class="px-3 py-2 whitespace-nowrap text-muted">{formatSize(asset.size)}</td>
										<td class="px-3 py-2 text-right whitespace-nowrap">
											<!-- eslint-disable svelte/no-navigation-without-resolve -- 安装包是外部下载地址 -->
											<a
												class="inline-flex items-center gap-1 text-teal hover:underline"
												href={asset.url}
												download
											>
												{m.dl_download()}
												<DownloadSimpleIcon size={15} />
											</a>
											<!-- eslint-enable svelte/no-navigation-without-resolve -->
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</article>
			{/each}
		</div>
	</section>
</Subpage>

<style>
	/* 更新日志里的输入示例，与文档页的行内代码同一套样子 */
	li :global(code) {
		padding: 1px 6px;
		border-radius: 4px;
		background: #eef3f1;
		font-size: 0.92em;
		color: var(--color-ink);
	}
</style>
