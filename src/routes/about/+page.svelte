<script lang="ts">
	import ArrowRightIcon from 'phosphor-svelte/lib/ArrowRightIcon';
	import IconCircle from '$lib/components/IconCircle.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import SectionHeading from '$lib/components/SectionHeading.svelte';
	import Subpage from '$lib/components/Subpage.svelte';
	import { engineFlow } from '$lib/data';
	import { m } from '$lib/paraglide/messages';

	/** 平台外壳的进度，与主仓库 README「平台」一节一致 */
	const platforms = [
		{ name: 'macOS', api: 'Input Method Kit (IMK)', status: m.about_status_beta, ready: true },
		{
			name: 'Windows',
			api: 'Text Services Framework (TSF)',
			status: m.about_status_alpha,
			ready: true
		},
		{ name: 'Linux', api: 'Fcitx5', status: m.about_status_beta, ready: true }
	];

	/** 随包数据的来源与许可，与偏好设置「关于」页的清单一致 */
	const dataSources = [
		[m.data_dict, m.data_dict_src],
		[m.data_lm, m.data_lm_src],
		[m.data_gloss, m.data_gloss_src],
		[m.data_emoji, m.data_emoji_src],
		[m.data_english, m.data_english_src],
		[m.data_levels, m.data_levels_src]
	];
</script>

<Seo title={m.about_seo_title()} description={m.about_seo_desc()} />

<Subpage title={m.about_title()} desc={m.about_desc()}>
	<!-- 名字与理念 -->
	<section class="grid gap-4 desk:grid-cols-2">
		<article class="rounded-2xl border border-line bg-white/86 p-5 desk:p-[26px]">
			<h2 class="mb-3 font-song text-[22px] leading-[1.4] font-bold">{m.about_name_title()}</h2>
			<p class="mb-3 text-[14px] leading-[1.75] text-muted">{m.about_name_p1()}</p>
			<p class="text-[14px] leading-[1.75] text-muted">{m.about_name_p2()}</p>
		</article>
		<article class="rounded-2xl border border-line bg-white/86 p-5 desk:p-[26px]">
			<h2 class="mb-3 font-song text-[22px] leading-[1.4] font-bold">{m.about_idea_title()}</h2>
			<p class="mb-3 text-[14px] leading-[1.75] text-muted">{m.about_idea_p1()}</p>
			<p class="text-[14px] leading-[1.75] text-muted">
				{m.about_idea_p2_a()}<strong class="font-medium text-ink">{m.about_idea_p2_b()}</strong
				>{m.about_idea_p2_c()}
			</p>
		</article>
	</section>

	<!-- 引擎流程 -->
	<section id="architecture" class="scroll-mt-3">
		<SectionHeading title={m.about_flow_title()} desc={m.about_flow_desc()} />

		<div
			class="mb-[26px] flex flex-col gap-2 max:gap-[13px] desk:mb-[15px] desk:flex-row desk:flex-wrap desk:justify-between desk:gap-3 wide:flex-nowrap wide:gap-[9px]"
		>
			{#each engineFlow as stage, i (stage.title)}
				<!-- 中文一格两行正好，西文长，允许在格子里换行 -->
				<div
					class="flex min-w-0 flex-auto flex-col items-center gap-2 max:gap-[13px] max:last:flex-[0_0_164px] desk:flex-[1_1_28%] desk:flex-row desk:gap-3 wide:flex-1 wide:gap-[9px] wide:last:flex-[0_0_153px]"
				>
					<article
						class="flex min-h-[76px] w-full flex-1 items-center gap-5 rounded-lg border border-line bg-white/86 px-5 py-[13px] max:gap-3.5 max:px-[13px] max:py-[15px] desk:min-h-[90px] desk:w-auto desk:items-start desk:gap-2 desk:px-[9px]"
					>
						<IconCircle icon={stage.icon} class="size-[43px] rounded-[19px]" />
						<div>
							<h3 class="text-[15px] leading-[1.4] desk:text-sm">{stage.title()}</h3>
							<p class="mt-[3px] text-xs leading-[1.55] text-muted desk:text-[11px]">
								{stage.lines[0]()}<br class="hidden desk:inline" />{stage.lines[1]()}
							</p>
						</div>
					</article>
					{#if i < engineFlow.length - 1}
						<ArrowRightIcon size={20} class="shrink-0 rotate-90 text-[#97a1b0] desk:rotate-0" />
					{/if}
				</div>
			{/each}
		</div>

		<div class="grid gap-4 desk:grid-cols-3">
			<article class="rounded-lg border border-line bg-white/86 p-4">
				<h3 class="mb-2 text-[15px]">{m.about_core_title()}</h3>
				<p class="text-[13px] leading-[1.7] text-muted">{m.about_core_desc()}</p>
			</article>
			<article class="rounded-lg border border-line bg-white/86 p-4">
				<h3 class="mb-2 text-[15px]">{m.about_fast_title()}</h3>
				<p class="text-[13px] leading-[1.7] text-muted">{m.about_fast_desc()}</p>
			</article>
			<article class="rounded-lg border border-line bg-white/86 p-4">
				<h3 class="mb-2 text-[15px]">{m.about_safe_title()}</h3>
				<p class="text-[13px] leading-[1.7] text-muted">{m.about_safe_desc()}</p>
			</article>
		</div>
	</section>

	<!-- 平台 -->
	<section id="platforms" class="scroll-mt-3">
		<SectionHeading title={m.about_platforms_title()} desc={m.about_platforms_desc()} />
		<div class="grid gap-3 desk:grid-cols-3">
			{#each platforms as platform (platform.name)}
				<article class="rounded-lg border border-line bg-white/86 px-4 py-3">
					<div class="flex items-center justify-between">
						<strong class="text-[15px]">{platform.name}</strong>
						<span
							class="rounded-[20px] px-2 py-[3px] text-[11px] whitespace-nowrap {platform.ready
								? 'bg-[#e3efcf] font-semibold text-[#336f33]'
								: 'bg-[#f1f2f4] text-[#84909d]'}">{platform.status()}</span
						>
					</div>
					<p class="mt-1 text-[12px] text-muted">{platform.api}</p>
				</article>
			{/each}
		</div>
	</section>

	<!-- 状态与许可 -->
	<section id="status" class="scroll-mt-3">
		<SectionHeading title={m.about_license_section_title()} desc={m.about_license_section_desc()} />
		<div class="grid gap-4 desk:grid-cols-2">
			<article class="rounded-2xl border border-line bg-white/86 p-5">
				<h3 class="mb-2 text-[15px]">{m.about_license_title()}</h3>
				<p class="mb-2 text-[13px] leading-[1.7] text-muted">
					{m.about_license_p1_a()}
					<a
						class="text-teal underline"
						href="https://github.com/qingjian-team/qingjian"
						target="_blank"
						rel="noopener">GitHub</a
					>{m.about_license_p1_b()}
				</p>
				<p class="text-[13px] leading-[1.7] text-muted">{m.about_license_p2()}</p>
			</article>
			<article class="rounded-2xl border border-line bg-white/86 p-5">
				<h3 class="mb-2 text-[15px]">{m.about_data_title()}</h3>
				<p class="mb-3 text-[13px] leading-[1.7] text-muted">{m.about_data_desc()}</p>
				<dl class="flex flex-col gap-2 text-[12px] leading-[1.6]">
					{#each dataSources as [name, source] (name)}
						<div class="grid grid-cols-[minmax(64px,auto)_1fr] gap-2">
							<dt class="font-medium text-ink">{name()}</dt>
							<dd class="text-muted">{source()}</dd>
						</div>
					{/each}
				</dl>
			</article>
		</div>
	</section>
</Subpage>
