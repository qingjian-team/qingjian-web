<script lang="ts">
	import { resolve } from '$app/paths';
	import ArrowDownIcon from 'phosphor-svelte/lib/ArrowDownIcon';
	import ArrowRightIcon from 'phosphor-svelte/lib/ArrowRightIcon';
	import XIcon from 'phosphor-svelte/lib/XIcon';
	import Button from '$lib/components/Button.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import IconCircle from '$lib/components/IconCircle.svelte';
	import SectionHeading from '$lib/components/SectionHeading.svelte';
	import TypingDemo from '$lib/components/TypingDemo.svelte';
	import { benefits, exampleCandidates, features, nonGoals } from '$lib/data';
	import { downloadsOpen } from '$lib/releases';

	/** 候选示例当前展示的学习语言 */
	let exampleLanguage = $state<'en' | 'ja'>('en');
</script>

<Seo
	description="青简 Qingjian 是一个用 Rust 写的 macOS 拼音输入法：候选词旁边多一条你正在学的英语或日语译词，打字时顺便多认识一个词。整句输入、双拼、模糊音、拼写纠错，全部在本机完成，不上传数据。"
/>

<section class="relative">
	<div
		class="mx-auto flex w-full max-w-[1280px] flex-col px-5 pt-[25px] pb-[15px] desk:grid desk:min-h-[440px] desk:grid-cols-[44%_56%] desk:items-center desk:pt-[22px] desk:pb-9 min-[1101px]:min-h-[470px] min-[1101px]:grid-cols-[43%_57%] min-[1101px]:px-[38px]"
	>
		<div class="relative z-2 w-full pl-0 desk:w-auto desk:pl-3 min-[1101px]:pl-[30px]">
			<h1
				class="font-song text-[32px] leading-[1.35] font-bold whitespace-nowrap desk:tracking-[1px] min-[1101px]:text-[clamp(32px,3.3vw,45px)]"
			>
				输入的不只是文字。
			</h1>
			<p class="mt-4 max-w-[460px] text-[13px] leading-[1.8] text-[#60717f] min-[1101px]:text-sm">
				青简是一个用 Rust 写的拼音输入法。打字时，候选词旁边多一条你正在学的那门语言的译词。<br
					class="hidden desk:inline"
				/>不打断，不弹题，只是把它放在那里。
			</p>
			<div
				class="mt-5 text-[13px] tracking-[.5px] text-[#168679] desk:text-xs min-[1101px]:text-sm"
			>
				全在本机
				<b class="px-[6px] font-normal text-[#77a7ac] desk:px-[5px] min-[1101px]:px-[9px]">·</b>
				一次一种语言
				<b class="px-[6px] font-normal text-[#77a7ac] desk:px-[5px] min-[1101px]:px-[9px]">·</b>
				越用越顺
				<b class="px-[6px] font-normal text-[#77a7ac] desk:px-[5px] min-[1101px]:px-[9px]">·</b>
				macOS 测试版
			</div>
			<div class="mt-[25px] flex gap-[13px] desk:gap-2 min-[1101px]:gap-[13px]">
				<Button class="desk:px-4 min-[1101px]:px-[25px]" href={resolve('/download')}>
					{downloadsOpen ? '下载体验' : '即将开放下载'}
					<ArrowDownIcon size={18} />
				</Button>
				<Button class="desk:px-4 min-[1101px]:px-[22px]" variant="outline" href={resolve('/docs')}>
					查看文档 <ArrowRightIcon size={18} />
				</Button>
			</div>
			<!-- 楷体手写点缀：窄屏和宽屏显示，中间档位置不够则藏起来 -->
			<div
				class="mt-[25px] ml-[3px] block rotate-[-6deg] font-kai text-[16px] leading-[1.4] tracking-[2px] text-[#72999e] desk:hidden wide:mt-[30px] wide:block wide:text-lg"
			>
				输入的时候，<br /><span class="pl-[35px]">顺便多认识一个词。</span>
			</div>
		</div>

		<TypingDemo />
	</div>
</section>

<div class="wrap">
	<!-- 四个卖点条 -->
	<section
		class="mt-[18px] grid grid-cols-2 gap-x-1 gap-y-[18px] rounded-[14px] bg-[#f0f7f2d9] py-[15px] desk:mt-3 desk:gap-[18px] desk:p-[18px] wide:h-[72px] wide:grid-cols-4 wide:items-center wide:gap-0 wide:p-0"
	>
		{#each benefits as benefit, i (benefit.title)}
			<div class="relative flex items-center gap-2 px-3 desk:gap-2.5 desk:px-[14px] wide:gap-4">
				<!-- 桌面版用竖线分隔，第一格和平板第三格不画 -->
				{#if i > 0}
					<span
						class="absolute left-0 hidden h-[35px] w-px bg-line wide:block {i === 2
							? 'hidden wide:block'
							: ''}"
					></span>
				{/if}
				<IconCircle
					icon={benefit.icon}
					class="size-[35px] rounded-[16px] desk:size-[45px] desk:rounded-[20px]"
				/>
				<div>
					<strong class="text-xs desk:text-sm">{benefit.title}</strong>
					<p
						class="mt-[2px] max-w-[110px] text-[9px] leading-[1.55] text-muted desk:max-w-none desk:text-[11px] desk:whitespace-nowrap min-[1061px]:text-[11px]"
					>
						{benefit.desc}
					</p>
				</div>
			</div>
		{/each}
	</section>

	<section id="features" class="scroll-mt-3">
		<SectionHeading
			title="输入法首先必须是一个好用的输入法"
			desc="语言学习建立在这个前提之上。如果你需要想「我现在是在打字还是在背单词」，那就是青简设计错了。"
		/>
		<div class="grid grid-cols-2 gap-3 wide:grid-cols-4">
			{#each features as feature (feature.title)}
				<article
					class="min-h-[208px] rounded-lg border border-line bg-white/86 p-3.5 shadow-[0_2px_9px_#1a766408] max:h-auto max:min-h-[190px] desk:min-h-[180px] desk:px-[17px] desk:pt-3 desk:pb-[15px] wide:h-[183px] wide:min-h-[183px]"
				>
					<IconCircle icon={feature.icon} />
					<h3 class="mt-2.5 mb-[7px] text-sm leading-[1.4] desk:text-[15.5px] desk:leading-[1.3]">
						{feature.title}
					</h3>
					<p class="text-xs leading-[1.65] text-muted desk:text-[13.5px] desk:leading-[1.4]">
						{feature.desc}
					</p>
				</article>
			{/each}
		</div>
	</section>

	<!-- 候选窗口长什么样：敲 kaifa 的前五个候选，切换学习语言看同一列译词的变化 -->
	<section id="example" class="scroll-mt-3">
		<SectionHeading
			title="候选词是主体，译词只是较小、较浅的辅助"
			desc="主要语言中文，敲 kaifa 看到的候选。学习语言在偏好设置里选，一次只有一种。"
		/>
		<div class="mx-auto max-w-[560px] rounded-lg border border-line bg-white/86 p-4 desk:p-5">
			<div class="mb-3 flex items-center justify-between">
				<div class="text-[13px] text-[#777]">kai'fa</div>
				<div
					role="tablist"
					aria-label="学习语言"
					class="flex gap-1 rounded-full bg-[#eef3f1] p-[3px]"
				>
					{#each Object.entries(exampleCandidates) as [id, option] (id)}
						<button
							role="tab"
							aria-selected={exampleLanguage === id}
							class="rounded-full px-3 py-1 text-[12px] transition-colors {exampleLanguage === id
								? 'bg-white font-medium text-teal shadow-[0_1px_3px_#1a766414]'
								: 'text-muted hover:text-teal'}"
							onclick={() => (exampleLanguage = id as 'en' | 'ja')}
						>
							{option.label}
						</button>
					{/each}
				</div>
			</div>
			<ol class="flex flex-col gap-[3px]">
				{#each exampleCandidates[exampleLanguage].rows as row, i (row.word)}
					<li
						class="flex items-center gap-3 rounded-md px-2 py-[5px] {i === 0 ? 'bg-[#dce9ff]' : ''}"
					>
						<small class="w-3 text-xs text-[#aaa]">{i + 1}</small>
						<strong class="text-[17px] font-medium">{row.word}</strong>
						<span class="ml-auto text-[13px] {row.fresh ? 'text-[#d97a1a]' : 'text-[#888]'}"
							>{row.gloss}</span
						>
					</li>
				{/each}
			</ol>
			<p class="mt-3 text-[11px] leading-[1.6] text-muted">
				橙色的是生词：这条译词在你上屏时出现在候选窗口里的次数还不到三轮。看熟了自动变回灰色，不加图标、不弹提示。日语译词按汉字段注平假名。
			</p>
		</div>
	</section>

	<section id="non-goals" class="scroll-mt-3">
		<SectionHeading title="不打算做什么" desc="青简暂时不准备成为一个「大而全」的语言学习软件。" />
		<ul class="mx-auto grid max-w-[760px] grid-cols-1 gap-2 desk:grid-cols-2">
			{#each nonGoals as item (item)}
				<li
					class="flex items-center gap-3 rounded-lg border border-line bg-white/86 px-4 py-3 text-[13px] desk:text-sm"
				>
					<XIcon size={16} class="shrink-0 text-[#c2513f]" />
					{item}
				</li>
			{/each}
		</ul>
	</section>
</div>
