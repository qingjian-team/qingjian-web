<script lang="ts">
	import { resolve } from '$app/paths';
	import CloudSlashIcon from 'phosphor-svelte/lib/CloudSlashIcon';
	import HardDrivesIcon from 'phosphor-svelte/lib/HardDrivesIcon';
	import UserCircleMinusIcon from 'phosphor-svelte/lib/UserCircleMinusIcon';
	import IconCircle from '$lib/components/IconCircle.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import SectionHeading from '$lib/components/SectionHeading.svelte';
	import Subpage from '$lib/components/Subpage.svelte';
	import type { Entry } from '$lib/data';

	/** 三条总原则，与主仓库 README「隐私」一节一致 */
	const principles: Entry[] = [
		{
			icon: UserCircleMinusIcon,
			title: '没有账号，没有上报',
			desc: '不注册、不登录、不统计使用情况'
		},
		{ icon: HardDrivesIcon, title: '全部在本机完成', desc: '拼音转换、词库、学习、释义都不联网' },
		{ icon: CloudSlashIcon, title: '云联想缺省关闭', desc: '打开后也只发给你自己填写的服务商' }
	];

	/**
	 * 本机数据目录里的文件。「含你打的内容」按实际记录的东西写：
	 * 词级学习记的是选过的词，输入日志记的是敲的键与上屏的文字。
	 */
	const files: { name: string; what: string; typed: string }[] = [
		{ name: 'config.toml', what: '配置', typed: '否' },
		{ name: '.env', what: '云服务的密钥，填了才有；只有你这个账户能打开', typed: '否' },
		{ name: 'user.tsv', what: '每个词被选择的次数', typed: '选过的词' },
		{ name: 'user-words.tsv', what: '自动造词与云端选中的用户词', typed: '选过的词' },
		{ name: 'user-choices.tsv', what: '某段拼音下选过哪个词', typed: '拼音与选过的词' },
		{ name: 'user-english.tsv', what: '原样上屏过的英文词', typed: '英文词' },
		{
			name: 'user-typos.tsv',
			what: '接受过的敲错纠正（敲成了什么、本来要什么）',
			typed: '拼音音节'
		},
		{ name: 'user-ngram.tsv', what: '哪个词后面常接哪个词', typed: '连着打过的词' },
		{ name: 'user-glossary-<语言>.tsv', what: '云端补回来的个人释义', typed: '词与译词' },
		{ name: 'user-vocab.tsv', what: '每条译词被看到 / 上屏 / 打出的次数', typed: '译词，不含中文' },
		{ name: 'usage.tsv', what: '按天的汉字 / 词 / 上屏次数，只有数字', typed: '否' },
		{
			name: 'input-log.jsonl',
			what: '输入日志：每次上屏的键、切分、候选、选了第几个',
			typed: '敲的键与上屏的文字'
		},
		{ name: 'dicts/', what: '你导入的词库', typed: '否' }
	];
</script>

<Seo
	title="隐私"
	description="青简输入法不上传任何数据：拼音转换、词库、学习、释义全在本机。云联想缺省关闭，输入日志只写本机可随时关闭清空。本机有哪些文件、怎么删干净，这里说清楚。"
/>

<Subpage
	title="认识你，但不需要服务器认识你。"
	desc="青简不上传任何数据。拼音转换、词库、学习、释义全部在本机完成，没有账号，没有统计上报。"
>
	<div class="grid gap-3 desk:grid-cols-3">
		{#each principles as card (card.title)}
			<article
				class="flex min-h-[76px] items-center gap-[13px] rounded-[11px] border border-[#e8f1f0] bg-white/85 px-[15px] py-[14px] shadow-[0_3px_9px_#224b4905]"
			>
				<IconCircle icon={card.icon} size={21} class="size-9 rounded-2xl" />
				<div>
					<h3 class="text-[13px]">{card.title}</h3>
					<p class="mt-[2px] text-[11px] leading-[1.55] text-muted">{card.desc}</p>
				</div>
			</article>
		{/each}
	</div>

	<!-- 两处会产生数据 -->
	<section id="data-sources" class="scroll-mt-3">
		<SectionHeading
			title="有两处会产生数据，都在你手里"
			desc="一处缺省关，一处缺省开，都能一键关掉。"
		/>
		<div class="grid gap-4 desk:grid-cols-2">
			<article class="rounded-2xl border border-line bg-white/86 p-5 desk:p-6">
				<div class="mb-2 flex items-center gap-2">
					<h3 class="text-[16px]">云联想 / 翻译选中文字</h3>
					<span class="rounded-[20px] bg-[#f1f2f4] px-2 py-[2px] text-[11px] text-[#84909d]"
						>缺省关闭</span
					>
				</div>
				<p class="mb-2 text-[13px] leading-[1.75] text-muted">
					打开后，组句时的拼音、光标前后各几十个字的上下文、本机给出的候选，会发给你自己在偏好设置「云服务」页填写的
					AI 服务商（缺省 DeepSeek，也可以填任何 OpenAI 兼容接口）。数据直接从你的电脑发到服务商，<strong
						class="font-medium text-ink">不经过青简</strong
					>：青简没有自己的服务器。
				</p>
				<ul class="flex flex-col gap-1.5 text-[13px] leading-[1.7] text-muted">
					<li>密码框（Secure Input）里绝不发送。</li>
					<li>
						开着时，随包释义表没有译词的词在你打出它之后会单独发一次，只有那个词；回来的译词存进本机的个人释义表，可以手改。
					</li>
					<li>菜单栏「中 / 英」后带 ☁︎ 表示联想开着。关掉「云服务」页的开关就不再发任何请求。</li>
				</ul>
			</article>
			<article class="rounded-2xl border border-line bg-white/86 p-5 desk:p-6">
				<div class="mb-2 flex items-center gap-2">
					<h3 class="text-[16px]">输入日志</h3>
					<span class="rounded-[20px] bg-[#fff1dc] px-2 py-[2px] text-[11px] text-[#b25f00]"
						>测试版缺省开启</span
					>
				</div>
				<p class="mb-2 text-[13px] leading-[1.75] text-muted">
					每次上屏在本机记一行：敲的键、切分、看到的前几个候选、选了第几个。只有敲的键与上屏的文字，不含应用里的上下文。它只写在这台电脑的数据目录里，用于离线回归评测和你自己的个人模型，<strong
						class="font-medium text-ink">不会自动发给任何人</strong
					>。
				</p>
				<ul class="flex flex-col gap-1.5 text-[13px] leading-[1.7] text-muted">
					<li>关掉：偏好设置「高级」页取消勾选「记录输入日志」。</li>
					<li>清空：同一页的「清空输入日志」。</li>
					<li>测试时如果愿意把这个文件发给作者，对改进排序帮助很大，但完全自愿。</li>
				</ul>
			</article>
		</div>
	</section>

	<!-- 本机文件 -->
	<section id="files" class="scroll-mt-3">
		<SectionHeading
			title="本机上有哪些文件"
			desc="都在「~/Library/Application Support/Qingjian/」，纯文本，随时可以打开看。"
		/>
		<div class="overflow-x-auto rounded-lg border border-line bg-white/86">
			<table class="w-full min-w-[560px] text-left text-[13px]">
				<thead class="bg-[#f0f7f2] text-[12px] text-[#4d6b62]">
					<tr>
						<th class="px-3 py-2 font-medium">文件</th>
						<th class="px-3 py-2 font-medium">内容</th>
						<th class="px-3 py-2 font-medium">含你打的内容</th>
					</tr>
				</thead>
				<tbody>
					{#each files as file (file.name)}
						<tr class="border-t border-line">
							<td class="px-3 py-2 whitespace-nowrap">
								<code class="rounded bg-[#eef3f1] px-1.5 py-0.5 text-[12px] text-ink"
									>{file.name}</code
								>
							</td>
							<td class="px-3 py-2 leading-[1.6] text-muted">{file.what}</td>
							<td class="px-3 py-2 whitespace-nowrap text-muted">{file.typed}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<p class="mt-3 text-[12px] leading-[1.7] text-muted">
			偏好设置「统计」页显示的字数与词汇数来自 usage.tsv 与
			user-vocab.tsv，与输入日志无关：日志关掉或清空，统计还在。这些文件每次都是整个换新的，输入法哪怕中途崩溃也不会留下写了一半的文件。
		</p>
	</section>

	<!-- 日志与诊断 -->
	<section id="logs" class="scroll-mt-3">
		<SectionHeading title="日志与诊断信息" desc="排查问题要的东西，也不多拿。" />
		<div class="grid gap-4 desk:grid-cols-2">
			<article class="rounded-lg border border-line bg-white/86 p-4">
				<h3 class="mb-2 text-[15px]">运行日志</h3>
				<p class="text-[13px] leading-[1.7] text-muted">
					在「~/Library/Logs/Qingjian/」，按天分文件只留 7 天。缺省级别<strong
						class="font-medium text-ink">不记你敲了什么</strong
					>；只有在「高级」页打开「详细日志」才逐键记录，用于排查问题，查完记得关。
				</p>
			</article>
			<article class="rounded-lg border border-line bg-white/86 p-4">
				<h3 class="mb-2 text-[15px]">复制诊断信息</h3>
				<p class="text-[13px] leading-[1.7] text-muted">
					「关于」页的这个按钮把版本、系统、加载的数据、配置原文和日志目录写进剪贴板，由你决定发不发；发给作者能更快定位问题。<strong
						class="font-medium text-ink">云服务的密钥会被抹掉</strong
					>。
				</p>
			</article>
		</div>
	</section>

	<!-- 删除 -->
	<section id="delete" class="scroll-mt-3">
		<SectionHeading title="想删干净" desc="所有数据都是本机文件，删了就没了，没有云端副本。" />
		<div class="rounded-2xl border border-line bg-white/86 p-5 desk:p-6">
			<ul class="flex flex-col gap-2 text-[13px] leading-[1.7] text-muted">
				<li>只清输入日志：偏好设置「高级」页「清空输入日志」。</li>
				<li>
					连输入法带数据一起删：运行 <code
						class="rounded bg-[#eef3f1] px-1.5 py-0.5 text-[12px] text-ink"
						>/Library/Input Methods/Qingjian.app/Contents/Resources/uninstall.sh --purge</code
					>。不加
					<code class="rounded bg-[#eef3f1] px-1.5 py-0.5 text-[12px] text-ink">--purge</code> 只卸载输入法、保留学习数据。
				</li>
				<li>
					导入过的词库在数据目录 <code
						class="rounded bg-[#eef3f1] px-1.5 py-0.5 text-[12px] text-ink">dicts/</code
					>，偏好设置里「移除」只是挪到
					<code class="rounded bg-[#eef3f1] px-1.5 py-0.5 text-[12px] text-ink">dicts/removed/</code
					>，要真删自己清那个目录。
				</li>
			</ul>
			<p class="mt-4 text-[12px] text-muted">
				安装与数据位置的说明见<a
					class="text-teal underline"
					href={resolve('/docs/[...path]', { path: 'help/data-and-logs' })}>文档</a
				>。
			</p>
		</div>
	</section>
</Subpage>
