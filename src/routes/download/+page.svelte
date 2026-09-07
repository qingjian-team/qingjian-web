<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import ArrowRightIcon from 'phosphor-svelte/lib/ArrowRightIcon';
	import ClockIcon from 'phosphor-svelte/lib/ClockIcon';
	import DownloadSimpleIcon from 'phosphor-svelte/lib/DownloadSimpleIcon';
	import Button from '$lib/components/Button.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import SectionHeading from '$lib/components/SectionHeading.svelte';
	import Subpage from '$lib/components/Subpage.svelte';
	import {
		channelLabel,
		detectPlatform,
		downloadsOpen,
		formatBuiltAt,
		formatSize,
		latest,
		platforms,
		releases,
		shortCommit,
		type PlatformId
	} from '$lib/releases';

	/**
	 * 访问者的系统，挂载后从 UA 猜；服务端与猜不出时按 macOS 展示（目前唯一能用的平台）。
	 * 放在 onMount 而不是 $derived 里，让服务端渲染与首次客户端渲染一致，不出水合差异。
	 */
	let detected = $state<PlatformId | null>(null);
	onMount(() => {
		detected = detectPlatform();
	});

	const detectedPlatform = $derived(platforms.find((p) => p.id === detected) ?? null);
	const heroPlatform = $derived(
		detectedPlatform?.available ? detectedPlatform : platforms.find((p) => p.available)!
	);
	/** 主按钮对应的文件：检测到的平台上的第一个安装包 */
	const heroAsset = $derived(latest.assets.find((a) => a.platform === heroPlatform.id) ?? null);

	function platformName(id: PlatformId) {
		return platforms.find((p) => p.id === id)?.name ?? id;
	}
</script>

<Seo
	title="下载"
	description={downloadsOpen
		? `下载青简输入法 macOS 版 ${latest.version}（测试版，需要 macOS 13 或更新），查看更新日志与全部版本。Windows 与 Linux 版计划中。`
		: `青简输入法 macOS 版 ${latest.version} 测试版即将开放下载（需要 macOS 13 或更新），先看看这一版有什么。Windows 与 Linux 版计划中。`}
/>

<Subpage
	title={downloadsOpen ? '下载青简。' : '快好了。'}
	desc={downloadsOpen
		? '现在只有 macOS 版，测试阶段。Windows 与 Linux 版在计划中。'
		: 'macOS 测试版作者自己每天在用，正在给少数测试者打包；等 Apple 开发者签名办下来就在这里公开下载。Windows 与 Linux 版在计划中。'}
>
	<!-- 顶部：当前版本 + 主下载按钮 + 这一版的更新日志 -->
	<section
		class="grid gap-6 rounded-2xl border border-line bg-white/86 p-5 desk:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] desk:gap-10 desk:p-[30px]"
	>
		<div>
			<div class="flex flex-wrap items-center gap-2">
				<span class="font-song text-[34px] leading-none font-bold">{latest.version}</span>
				<span
					class="rounded-[20px] bg-[#fff1dc] px-2 py-[3px] text-[11px] font-semibold text-[#b25f00]"
					>{channelLabel(latest.channel)}</span
				>
			</div>
			<p class="mt-2 text-[13px] text-muted">
				{latest.date} 发布{#if latest.commit}
					· 提交 <code class="text-[12px]">{shortCommit(latest.commit)}</code>{/if}
			</p>

			<div class="mt-6 flex flex-col gap-3">
				{#if !downloadsOpen}
					<span
						class="inline-flex w-fit items-center gap-2 rounded-xl border border-dashed border-[#abd7d0] bg-[#f0f7f5] px-[18px] py-[10px] text-sm font-medium text-teal"
					>
						<ClockIcon size={17} /> 即将开放下载
					</span>
					<p class="text-[12px] leading-[1.7] text-muted">
						{heroPlatform.requirement}。开放后这里会出现按你系统给的下载按钮，测试版没有 Apple
						开发者签名时首次打开要到「系统设置 → 隐私与安全性」点「仍要打开」。
					</p>
				{:else if heroAsset}
					<Button href={heroAsset.url} download class="w-fit">
						下载 {heroPlatform.name} 版（{heroAsset.arch}） <DownloadSimpleIcon size={18} />
					</Button>
					<p class="text-[12px] leading-[1.7] text-muted">
						{#if detectedPlatform && !detectedPlatform.available}
							你正在用 {detectedPlatform.name}，这个平台的版本还在计划中；上面是 macOS 版。
						{:else}
							{heroPlatform.requirement}。
						{/if}
						{heroAsset.file}，{formatSize(heroAsset.size)}；其他芯片的安装包与 SHA-256 见
						<a class="text-teal hover:underline" href="#releases">全部版本</a>。 测试版没有 Apple
						开发者签名，首次打开要到「系统设置 → 隐私与安全性」点「仍要打开」。
					</p>
				{/if}
				<a
					class="inline-flex w-fit items-center gap-1 text-[13px] text-teal hover:underline"
					href={resolve('/docs/[...path]', { path: 'getting-started/install' })}
				>
					安装说明 <ArrowRightIcon size={14} />
				</a>
			</div>
		</div>

		<div>
			<h2 class="mb-3 text-[13px] font-semibold tracking-[1.5px] text-[#18324b]">这一版有什么</h2>
			<ul class="flex flex-col gap-2">
				{#each latest.notes as note (note)}
					<li class="flex gap-2 text-[13px] leading-[1.65] text-muted">
						<span class="mt-[9px] size-[5px] shrink-0 rounded-full bg-teal"></span>
						{note}
					</li>
				{/each}
			</ul>
		</div>
	</section>

	<!-- 平台一览 -->
	<section id="platforms" class="scroll-mt-3">
		<SectionHeading
			title="平台"
			desc="核心引擎平台无关，每个平台只写一层接入系统输入法框架的壳。"
		/>
		<div class="grid gap-2.5 desk:grid-cols-3 desk:gap-[13px]">
			{#each platforms as platform (platform.id)}
				{@const Icon = platform.icon}
				<article
					class="flex min-h-[70px] items-center gap-[15px] rounded-[9px] border border-[#e8f0ef] bg-white/94 p-3 px-[18px] shadow-[0_3px_10px_#183c3506] desk:gap-[11px]"
				>
					<Icon size={32} weight={platform.id === 'linux' ? 'regular' : 'fill'} class="shrink-0" />
					<div>
						<strong class="text-sm font-medium">{platform.name}</strong>
						<small class="mt-[3px] block text-[11px] text-muted"
							>{platform.available ? platform.requirement : platform.api}</small
						>
					</div>
					<span
						class="ml-auto rounded-[20px] px-2 py-[3px] text-[11px] whitespace-nowrap {platform.available
							? 'bg-[#c9f7e3] font-semibold text-[#008568]'
							: 'bg-[#f1f2f4] text-[#84909d]'}"
					>
						{platform.available ? '测试版' : '计划中'}
					</span>
				</article>
			{/each}
		</div>
	</section>

	<!-- 全部版本：下载没开放时不列（全是「暂无」的表格没有信息量） -->
	<section id="releases" class="scroll-mt-3" hidden={!downloadsOpen}>
		<SectionHeading title="全部版本" desc="从新到旧。每个版本列出各平台的安装包。" />
		<div class="flex flex-col gap-4">
			{#each releases as release (release.version)}
				<article class="rounded-2xl border border-line bg-white/86 p-5 desk:p-6">
					<header class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
						<h3 class="font-song text-[22px] font-bold">{release.version}</h3>
						<span class="text-[12px] text-muted"
							>{release.date} · {channelLabel(release.channel)}{#if release.commit}
								· 提交 <code>{shortCommit(release.commit)}</code>{/if}{#if release.builtAt}
								· 构建于 {formatBuiltAt(release.builtAt)}{/if}</span
						>
					</header>

					{#if release === latest}
						<p class="mt-2 text-[12px] text-muted">当前版本，更新日志见页首。</p>
					{:else}
						<ul
							class="mt-3 grid gap-x-6 gap-y-1.5 text-[13px] leading-[1.65] text-muted desk:grid-cols-2"
						>
							{#each release.notes as note (note)}
								<li class="flex gap-2">
									<span class="mt-[9px] size-[4px] shrink-0 rounded-full bg-[#9fc7c0]"></span>
									{note}
								</li>
							{/each}
						</ul>
					{/if}

					<div class="mt-4 overflow-x-auto rounded-lg border border-line">
						<table class="w-full min-w-[560px] text-left text-[13px]">
							<thead class="bg-[#f0f7f2] text-[12px] text-[#4d6b62]">
								<tr>
									<th class="px-3 py-2 font-medium">平台</th>
									<th class="px-3 py-2 font-medium">芯片</th>
									<th class="px-3 py-2 font-medium">文件</th>
									<th class="px-3 py-2 font-medium">大小</th>
									<th class="px-3 py-2 font-medium"></th>
								</tr>
							</thead>
							<tbody>
								{#each release.assets as asset (asset.file)}
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
												下载 <DownloadSimpleIcon size={15} />
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
