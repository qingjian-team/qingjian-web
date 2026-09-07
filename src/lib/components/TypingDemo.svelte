<script lang="ts">
	import CloudIcon from 'phosphor-svelte/lib/CloudIcon';
	import { ui } from '$lib/ui.svelte';

	/** 逐键敲的字母；拼音行显示时由引擎自动补 `'` 切分 */
	const LETTERS = 'qingjian';
	const STEPS = 17;

	/**
	 * 候选窗口的一行，与 macOS 壳 `candidates/row.rs` 的 Row 同构：
	 * 序号、候选词、右侧 annotation 片段（词性淡、译词深、生词橙）。
	 */
	type Tone = 'gloss' | 'fresh' | 'faint';
	type Row = { text: string; annotation: [string, Tone][] };

	/** 把 CLI 打印的「词性. 译词 · 词性. 译词」拆成与输入法一样的分段 */
	function row(text: string, senses = '', fresh = false): Row {
		if (!senses) return { text, annotation: [] };
		const annotation: [string, Tone][] = [];
		senses.split(' · ').forEach((sense, i) => {
			if (i > 0) annotation.push([' · ', 'faint']);
			const match = /^([a-z]+\.) (.+)$/.exec(sense);
			if (match) {
				annotation.push([`${match[1]} `, 'faint']);
				annotation.push([match[2], fresh ? 'fresh' : 'gloss']);
			} else {
				annotation.push([sense, 'gloss']);
			}
		});
		return { text, annotation };
	}

	/**
	 * 候选按已敲的字母长度切换，一页 9 条（输入法缺省每页数）。内容是 CLI 对同一串前缀的真实输出
	 * （`qingjian-cli --limit 9 q qi qin qing qingj qingji qingjia qingjian`，学习语言英语）；
	 * 最后一档的 青简 是作者机器上连着选过 青 + 简 之后自动记下的用户词，invitation 标成还没看熟的生词。
	 */
	function candidatesFor(length: number): Row[] {
		if (length <= 1)
			return [
				row('去', 'v. go'),
				row('Q', 'n. Q'),
				row('其', 'pron. its · pron. his'),
				row('求', 'v. beg · v. request'),
				row('请', 'v. please · v. invite'),
				row('将', 'adv. will'),
				row('卡', 'n. card'),
				row('前', 'n. front · n. before'),
				row('全', 'adj. whole · adj. all')
			];
		if (length <= 2)
			return [
				row('其', 'pron. its · pron. his'),
				row('起', 'v. rise'),
				row('七', 'num. seven'),
				row('齐', 'adj. neat · adj. uniform'),
				row('期', 'n. period'),
				row('奇', 'adj. strange · adj. odd'),
				row('气', 'n. gas · n. air'),
				row('骑', 'v. ride'),
				row('器', 'n. vessel · n. device')
			];
		if (length <= 3)
			return [
				row('亲', 'adj. dear · adj. close'),
				row('秦', 'n. Qin'),
				row('琴', 'n. qin · n. zither'),
				row('钦'),
				row('勤', 'adj. diligent'),
				row('寝', 'v. sleep · v. lie down'),
				row('沁', 'v. seep'),
				row('芹', 'n. celery'),
				row('覃')
			];
		if (length <= 4)
			return [
				row('请', 'v. please · v. invite'),
				row('亲', 'adj. dear · adj. close'),
				row('清', 'adj. clear'),
				row('青', 'adj. blue · adj. green'),
				row('🍏', '青'),
				row('轻', 'adj. light'),
				row('情', 'n. feeling · n. love'),
				row('庆', 'v. celebrate'),
				row('晴', 'adj. clear · adj. sunny')
			];
		if (length <= 5)
			return [
				row('请叫', 'v. ask to call'),
				row('请假', 'v. ask for leave'),
				row('请教', 'v. consult · v. ask'),
				row('情节', 'n. plot'),
				row('🪥', '情节'),
				row('清军', 'n. Qing army'),
				row('清洁', 'v. clean'),
				row('情景', 'n. scene'),
				row('青椒', 'n. green pepper')
			];
		if (length <= 6)
			return [
				row('情急', 'adj. urgent · adj. desperate'),
				row('清寂', 'adj. quiet and desolate'),
				row('请叫', 'v. ask to call'),
				row('请假', 'v. ask for leave'),
				row('请教', 'v. consult · v. ask'),
				row('情节', 'n. plot'),
				row('清洁', 'v. clean'),
				row('情景', 'n. scene'),
				row('青椒', 'n. green pepper')
			];
		if (length <= 7)
			return [
				row('请假', 'v. ask for leave'),
				row('亲家', 'n. in-law'),
				row('请叫', 'v. ask to call'),
				row('请教', 'v. consult · v. ask'),
				row('青椒', 'n. green pepper'),
				row('🫑', '青椒'),
				row('清江', 'n. clear river'),
				row('清剿', 'v. suppress · v. wipe out'),
				row('请柬', 'n. invitation', true)
			];
		// 最后一页照作者机器上的真机截图：带用户词 青简、英文候选 qingjian 与领域词库里的词
		return [
			row('青简'),
			row('请柬', 'n. invitation'),
			row('qingjian'),
			row('清涧', 'n. Qingjian'),
			row('轻贱', 'adj. cheap · adj. lowly'),
			row('清江', 'n. clear river'),
			row('青鳉', 'n. Japanese rice fish'),
			row('清涧新村', 'n. Qingjian New Village'),
			row('清江路', 'n. Qingjiang Road')
		];
	}

	/**
	 * annotation 各档颜色，对应 macOS 壳 `theme.rs`：
	 * gloss = secondaryLabelColor，faint = tertiaryLabelColor，fresh = systemOrange。
	 */
	const toneClass: Record<Tone, string> = {
		gloss: 'text-[#6e6e73]',
		faint: 'text-[#aeaeb2]',
		fresh: 'text-[#ff9500]'
	};

	let step = $state(0);

	$effect(() => {
		if (ui.reducedMotion) return;
		const timer = setInterval(() => (step = (step + 1) % STEPS), 420);
		return () => clearInterval(timer);
	});

	// 已敲出的字母；step 前两拍留给「起手」，之后逐字母显现
	const typed = $derived(LETTERS.slice(0, Math.min(Math.max(step - 2, 0), LETTERS.length)));
	// 拼音行按音节切分显示：qing 之后自动带 '
	const preedit = $derived(typed.length > 4 ? `${typed.slice(0, 4)}'${typed.slice(4)}` : typed);
	const composing = $derived(step >= 3 && step <= 11);
	const committed = $derived(step >= 12);
	const rows = $derived(candidatesFor(typed.length));
	// 敲完停一拍之后云端整句补全才到（真机是停键 300 ms 后请求），画在拼音右侧
	const cloudSentence = $derived(step === 11 ? '请柬已经发出去了。' : '');
</script>

<!--
	演示只画两样东西：应用里正在打的那一行（拼音以 marked text 形式带点线），和候选窗口。
	候选窗口按 macOS 壳 theme.rs 的缺省主题等比放大 1.15 倍（字号 16 / 12 / 11，内边距 8，行内留白 4，列距 8，圆角 8）：
	windowBackgroundColor 底、rgba(0,122,255,.16) 高亮、序号与词性三级灰、译词二级灰、生词 systemOrange，
	译词列左对齐在最长候选词之后，页码在右下。高度固定，窗口收起时布局不跳。
-->
<div
	class="relative mx-auto h-[430px] w-full max-w-[440px] text-[#262626] desk:h-[450px]"
	role="img"
	aria-label="用青简打 qingjian 时的候选窗口演示"
>
	<!-- 应用里的一行文字 -->
	<div
		class="rounded-[12px] border border-[#dfe6e4] bg-white px-[18px] py-[12px] text-[19px] leading-[1.6] shadow-[0_2px_10px_#1a766410]"
	>
		<p>输入的时候，顺便多认识一个词。</p>
		<p>
			你好，{#if committed}青简。{:else if composing}<span
					class="border-b border-dotted border-[#555]">{preedit}</span
				>{/if}<i
				class="inline-block h-[22px] w-[2px] animate-caret bg-[#333] align-middle motion-reduce:animate-none"
			></i>
		</p>
	</div>

	{#if composing}
		<div
			class="absolute top-[92px] left-[64px] rounded-[10px] bg-white p-[9px] text-[#1d1d1f] shadow-[0_12px_32px_#00000024,0_0_0_1px_#0000001f]"
		>
			<!-- 拼音行：切分好的拼音 + 我们自己画的光标；右侧是云端整句补全（云朵 + 青色句子，Tab 接受） -->
			<div class="flex items-center px-[5px] py-[4px] text-[14px] leading-[1.25] text-[#6e6e73]">
				<span class="whitespace-nowrap">{preedit}</span>
				<i class="ml-px inline-block h-[17px] w-px bg-[#1d1d1f]"></i>
				{#if cloudSentence}
					<span
						class="ml-[14px] inline-flex items-center gap-[5px] whitespace-nowrap text-[#30b0c7]"
					>
						<CloudIcon size={15} />{cloudSentence}
					</span>
				{/if}
			</div>
			<!-- 三列网格：格子撑满整行（高亮才是完整一条），小字底对齐到候选词基线附近，与壳的 small_offset 同义 -->
			<div class="grid grid-cols-[auto_auto_auto]">
				{#each rows as item, i (item.text)}
					<div class="contents">
						<span
							class="flex items-end pt-[5px] pr-[9px] pb-[6px] pl-[9px] text-[13px] leading-[1.15] text-[#aeaeb2] {i ===
							0
								? 'rounded-l-[7px] bg-[#007aff29]'
								: ''}">{i + 1}</span
						>
						<span
							class="flex items-end py-[5px] pr-[9px] text-[18px] leading-[1.15] whitespace-nowrap {i ===
							0
								? 'bg-[#007aff29]'
								: ''}">{item.text}</span
						>
						<span
							class="flex items-end pt-[5px] pr-[9px] pb-[6px] text-[14px] leading-[1.15] whitespace-nowrap {i ===
							0
								? 'rounded-r-[7px] bg-[#007aff29]'
								: ''}"
						>
							<!-- 片段放在同一个行内容器里，词性后面的空格才不会被 flex 吞掉 -->
							<span>
								{#each item.annotation as [segment, tone], s (s)}<span class={toneClass[tone]}
										>{segment}</span
									>{/each}
							</span>
						</span>
					</div>
				{/each}
			</div>
			<div class="pt-[4px] pr-[5px] text-right text-[13px] leading-[1.15] text-[#aeaeb2]">1/21</div>
		</div>
	{/if}
</div>
