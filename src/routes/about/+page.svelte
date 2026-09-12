<script lang="ts">
	import ArrowRightIcon from 'phosphor-svelte/lib/ArrowRightIcon';
	import IconCircle from '$lib/components/IconCircle.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import SectionHeading from '$lib/components/SectionHeading.svelte';
	import Subpage from '$lib/components/Subpage.svelte';
	import { engineFlow } from '$lib/data';

	/** 平台外壳的进度，与主仓库 README「平台」一节一致 */
	const platforms = [
		{ name: 'macOS', api: 'Input Method Kit（IMK）', status: '已可用，测试版' },
		{ name: 'Windows', api: 'Text Services Framework（TSF）', status: '已可用，内测版' },
		{ name: 'Linux', api: 'IBus / Fcitx', status: '计划中' }
	];

	/** 随包数据的来源与许可，与偏好设置「关于」页的清单一致 */
	const dataSources = [
		[
			'词库',
			'通用规范汉字表；现代汉语常用词表（liuxilu 校对版）；THUOCL 领域词（清华大学 NLP 实验室，MIT）；读音取自 Unihan（Unicode License v3）'
		],
		['语言模型', '中文维基百科（CC BY-SA 4.0）与 LCCC（清华大学 CoAI，MIT）语料统计'],
		['释义表', '由大语言模型（DeepSeek）离线生成，青简自建'],
		['emoji', 'Unicode CLDR annotations（Unicode License v3）'],
		['英文词表', 'ESDB / SCOWL（© Kevin Atkinson）；CSpell 词典（MIT）'],
		[
			'词汇等级',
			'CEFR-J Wordlist 1.5（Yukio Tono）；Octanove Vocabulary Profile C1/C2（CC BY-SA 4.0）；JLPT 词表（tanos.co.uk，CC BY；经 elzup/jlpt-word-list 整理，MIT）'
		]
	];
</script>

<Seo
	title="关于"
	description="青简这个名字的由来、「输入优先，学习自然发生」的想法、引擎在本机怎么把一个按键变成候选、平台进度、测试版许可与随包数据来源。"
/>

<Subpage
	title="输入优先，学习自然发生。"
	desc="青简是一个用 Rust 写的拼音输入法。它的目标不只是把拼音变成汉字，而是让输入本身成为一种轻量、持续、几乎没有额外负担的语言接触方式。"
>
	<!-- 名字与理念 -->
	<section class="grid gap-4 desk:grid-cols-2">
		<article class="rounded-2xl border border-line bg-white/86 p-5 desk:p-[26px]">
			<h2 class="mb-3 font-song text-[22px] leading-[1.4] font-bold">为什么叫「青简」</h2>
			<p class="mb-3 text-[14px] leading-[1.75] text-muted">
				「简」是古代记录文字的载体，竹木成简，文字成书。「青简」也常用来指代书籍、典籍与文字记录。
			</p>
			<p class="text-[14px] leading-[1.75] text-muted">
				这个名字保留了中文书写文化的意味，又不把输入法未来支持的语言限制死。青简首先面向中文使用者，但不准备永远只做中文输入法。
			</p>
		</article>
		<article class="rounded-2xl border border-line bg-white/86 p-5 desk:p-[26px]">
			<h2 class="mb-3 font-song text-[22px] leading-[1.4] font-bold">核心想法</h2>
			<p class="mb-3 text-[14px] leading-[1.75] text-muted">
				聊天、写代码、搜索、记笔记、写文档、发邮件，大量时间其实都花在输入文字上。如果这些每天发生几百次的输入动作本身就能顺便给一点语言反馈，学习就从「专门腾时间」变成日常的一部分。
			</p>
			<p class="text-[14px] leading-[1.75] text-muted">
				输入的时候，顺便多认识一个词。不打断，不弹题，不强迫记忆，只是把译词悄悄放在那里。<strong
					class="font-medium text-ink">一次只学一种语言</strong
				>：候选旁边只有一条译词，不会同时塞进英语、日语、韩语、德语。
			</p>
		</article>
	</section>

	<!-- 引擎流程 -->
	<section id="architecture" class="scroll-mt-3">
		<SectionHeading
			title="一个按键在引擎里走过的路"
			desc="下面每一步都在本机完成，不联网。云联想是独立于这条链路之外的可选补充。"
		/>

		<div
			class="mb-[26px] flex flex-col gap-2 max:gap-[13px] desk:mb-[15px] desk:flex-row desk:flex-wrap desk:justify-between desk:gap-3 wide:flex-nowrap wide:gap-[9px]"
		>
			{#each engineFlow as stage, i (stage.title)}
				<div
					class="flex min-w-0 flex-auto flex-col items-center gap-2 max:gap-[13px] max:last:flex-[0_0_164px] desk:flex-[1_1_28%] desk:flex-row desk:gap-3 wide:flex-1 wide:gap-[9px] wide:last:flex-[0_0_153px]"
				>
					<article
						class="flex min-h-[76px] w-full flex-1 items-center gap-5 rounded-lg border border-line bg-white/86 px-5 py-[13px] max:gap-3.5 max:px-[13px] max:py-[15px] desk:min-h-[90px] desk:w-auto desk:items-start desk:gap-2 desk:px-[9px]"
					>
						<IconCircle icon={stage.icon} class="size-[43px] rounded-[19px]" />
						<div>
							<h3 class="text-[15px] leading-[1.4] desk:text-sm">{stage.title}</h3>
							<p
								class="mt-[3px] text-xs leading-[1.55] text-muted desk:text-[11px] desk:whitespace-nowrap"
							>
								{stage.lines[0]}<br class="hidden desk:inline" />{stage.lines[1]}
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
				<h3 class="mb-2 text-[15px]">平台只是壳，Core 才是青简</h3>
				<p class="text-[13px] leading-[1.7] text-muted">
					词库、拼音解析、候选生成、排序、学习、释义全在平台无关的核心里。macOS、Windows、Linux
					的外壳只做两件事：把系统按键翻译成核心的输入，把核心返回的候选画到窗口。换掉 IMK 换成
					TSF，核心一行不用改。
				</p>
			</article>
			<article class="rounded-lg border border-line bg-white/86 p-4">
				<h3 class="mb-2 text-[15px]">译词不阻塞输入</h3>
				<p class="text-[13px] leading-[1.7] text-muted">
					释义走本地查表，候选先返回、译词后补画。任何为学习功能增加的延迟、弹窗、界面干扰都算设计错误。逐键耗时的目标是
					10 毫秒以内，实测多数按键在 1 到 3 毫秒。
				</p>
			</article>
			<article class="rounded-lg border border-line bg-white/86 p-4">
				<h3 class="mb-2 text-[15px]">崩溃不丢</h3>
				<p class="text-[13px] leading-[1.7] text-muted">
					学习数据与配置都先写临时文件、同步到磁盘再改名，任何时刻磁盘上要么是旧文件要么是新文件。坏掉的行跳过不影响启动。输入法进程里的意外错误被拦在回调边界，正在打的字母原样交给应用。
				</p>
			</article>
		</div>
	</section>

	<!-- 平台 -->
	<section id="platforms" class="scroll-mt-3">
		<SectionHeading title="平台" desc="核心引擎平台无关，开发顺序是 macOS 优先。" />
		<div class="grid gap-3 desk:grid-cols-3">
			{#each platforms as platform (platform.name)}
				<article class="rounded-lg border border-line bg-white/86 px-4 py-3">
					<div class="flex items-center justify-between">
						<strong class="text-[15px]">{platform.name}</strong>
						<span
							class="rounded-[20px] px-2 py-[3px] text-[11px] whitespace-nowrap {platform.status.startsWith(
								'已'
							)
								? 'bg-[#c9f7e3] font-semibold text-[#008568]'
								: 'bg-[#f1f2f4] text-[#84909d]'}">{platform.status}</span
						>
					</div>
					<p class="mt-1 text-[12px] text-muted">{platform.api}</p>
				</article>
			{/each}
		</div>
	</section>

	<!-- 状态与许可 -->
	<section id="status" class="scroll-mt-3">
		<SectionHeading
			title="状态与许可"
			desc="macOS 测试版与 Windows 内测版都已开放下载，安装包暂无开发者签名；代码已开源。"
		/>
		<div class="grid gap-4 desk:grid-cols-2">
			<article class="rounded-2xl border border-line bg-white/86 p-5">
				<h3 class="mb-2 text-[15px]">许可</h3>
				<p class="mb-2 text-[13px] leading-[1.7] text-muted">
					代码以 GPL-3.0-or-later
					开源：可以自由使用、修改与再分发，修改后分发须同样开源。「青简」名字与 logo
					不在授权范围内。源码在 <a
						class="text-teal underline"
						href="https://github.com/qingjian-team/qingjian"
						target="_blank"
						rel="noopener">GitHub</a
					>。
				</p>
				<p class="text-[13px] leading-[1.7] text-muted">
					青简在官方渠道免费。若你为获得它向他人付费，你被骗了。
				</p>
			</article>
			<article class="rounded-2xl border border-line bg-white/86 p-5">
				<h3 class="mb-2 text-[15px]">随包数据的来源</h3>
				<p class="mb-3 text-[13px] leading-[1.7] text-muted">
					各自遵循来源的许可证，偏好设置「关于」页也列了这份清单。
				</p>
				<dl class="flex flex-col gap-2 text-[12px] leading-[1.6]">
					{#each dataSources as [name, source] (name)}
						<div class="grid grid-cols-[64px_1fr] gap-2">
							<dt class="font-medium text-ink">{name}</dt>
							<dd class="text-muted">{source}</dd>
						</div>
					{/each}
				</dl>
			</article>
		</div>
	</section>
</Subpage>
