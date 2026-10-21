<script lang="ts">
	import { resolve } from '$app/paths';
	import CloudSlashIcon from 'phosphor-svelte/lib/CloudSlashIcon';
	import HardDrivesIcon from 'phosphor-svelte/lib/HardDrivesIcon';
	import UserCircleMinusIcon from 'phosphor-svelte/lib/UserCircleMinusIcon';
	import IconCircle from '$lib/components/IconCircle.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import SectionHeading from '$lib/components/SectionHeading.svelte';
	import Subpage from '$lib/components/Subpage.svelte';
	import type { Entry, Text } from '$lib/data';
	import { localized } from '$lib/i18n';
	import { m } from '$lib/paraglide/messages';

	/** 三条总原则，与主仓库 README「隐私」一节一致 */
	const principles: Entry[] = [
		{
			icon: UserCircleMinusIcon,
			title: m.principle_account_title,
			desc: m.principle_account_desc
		},
		{ icon: HardDrivesIcon, title: m.principle_local_title, desc: m.principle_local_desc },
		{ icon: CloudSlashIcon, title: m.principle_cloud_title, desc: m.principle_cloud_desc }
	];

	/**
	 * 本机数据目录里的文件。「含你打的内容」按实际记录的东西写：
	 * 词级学习记的是选过的词，输入日志记的是敲的键与上屏的文字。
	 */
	const files: { name: string | Text; what: Text; typed: Text }[] = [
		{ name: 'config.toml', what: m.file_config, typed: m.typed_no },
		{ name: '.env', what: m.file_env, typed: m.typed_no },
		{ name: 'user.tsv', what: m.file_user, typed: m.typed_words },
		{ name: 'user-words.tsv', what: m.file_user_words, typed: m.typed_words },
		{ name: 'user-choices.tsv', what: m.file_user_choices, typed: m.typed_pinyin_words },
		{ name: 'user-english.tsv', what: m.file_user_english, typed: m.typed_english },
		{ name: 'user-typos.tsv', what: m.file_user_typos, typed: m.typed_syllables },
		{ name: 'user-ngram.tsv', what: m.file_user_ngram, typed: m.typed_sequences },
		{ name: m.file_glossary_name, what: m.file_user_glossary, typed: m.typed_glosses },
		{ name: 'user-vocab.tsv', what: m.file_user_vocab, typed: m.typed_vocab },
		{ name: 'usage.tsv', what: m.file_usage, typed: m.typed_no },
		{ name: 'input-log.jsonl', what: m.file_input_log, typed: m.typed_keys },
		{ name: 'dicts/', what: m.file_dicts, typed: m.typed_no }
	];

	const fileName = (name: string | Text) => (typeof name === 'string' ? name : name());
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -- 站内链接经 localized()：先 resolve()，再加语言前缀 -->

<Seo title={m.privacy_seo_title()} description={m.privacy_seo_desc()} />

<Subpage title={m.privacy_title()} desc={m.privacy_desc()}>
	<div class="grid gap-3 desk:grid-cols-3">
		{#each principles as card (card.title)}
			<article
				class="flex min-h-[76px] items-center gap-[13px] rounded-[11px] border border-[#e8f1f0] bg-white/85 px-[15px] py-[14px] shadow-[0_3px_9px_#224b4905]"
			>
				<IconCircle icon={card.icon} size={21} class="size-9 rounded-2xl" />
				<div>
					<h3 class="text-[13px]">{card.title()}</h3>
					<p class="mt-[2px] text-[11px] leading-[1.55] text-muted">{card.desc()}</p>
				</div>
			</article>
		{/each}
	</div>

	<!-- 两处会产生数据 -->
	<section id="data-sources" class="scroll-mt-3">
		<SectionHeading title={m.privacy_sources_title()} desc={m.privacy_sources_desc()} />
		<div class="grid gap-4 desk:grid-cols-2">
			<article class="rounded-2xl border border-line bg-white/86 p-5 desk:p-6">
				<div class="mb-2 flex items-center gap-2">
					<h3 class="text-[16px]">{m.privacy_cloud_title()}</h3>
					<span class="rounded-[20px] bg-[#f1f2f4] px-2 py-[2px] text-[11px] text-[#84909d]"
						>{m.privacy_cloud_badge()}</span
					>
				</div>
				<p class="mb-2 text-[13px] leading-[1.75] text-muted">
					{m.privacy_cloud_p_a()}<strong class="font-medium text-ink"
						>{m.privacy_cloud_p_b()}</strong
					>{m.privacy_cloud_p_c()}
				</p>
				<ul class="flex flex-col gap-1.5 text-[13px] leading-[1.7] text-muted">
					<li>{m.privacy_cloud_li1()}</li>
					<li>{m.privacy_cloud_li2()}</li>
					<li>{m.privacy_cloud_li3()}</li>
				</ul>
			</article>
			<article class="rounded-2xl border border-line bg-white/86 p-5 desk:p-6">
				<div class="mb-2 flex items-center gap-2">
					<h3 class="text-[16px]">{m.privacy_log_title()}</h3>
					<span class="rounded-[20px] bg-[#fff1dc] px-2 py-[2px] text-[11px] text-[#b25f00]"
						>{m.privacy_log_badge()}</span
					>
				</div>
				<p class="mb-2 text-[13px] leading-[1.75] text-muted">
					{m.privacy_log_p_a()}<strong class="font-medium text-ink">{m.privacy_log_p_b()}</strong
					>{m.privacy_log_p_c()}
				</p>
				<ul class="flex flex-col gap-1.5 text-[13px] leading-[1.7] text-muted">
					<li>{m.privacy_log_li1()}</li>
					<li>{m.privacy_log_li2()}</li>
					<li>{m.privacy_log_li3()}</li>
				</ul>
			</article>
		</div>
	</section>

	<!-- 本机文件 -->
	<section id="files" class="scroll-mt-3">
		<SectionHeading title={m.privacy_files_title()} desc={m.privacy_files_desc()} />
		<div class="overflow-x-auto rounded-lg border border-line bg-white/86">
			<table class="w-full min-w-[560px] text-left text-[13px]">
				<thead class="bg-[#f0f7f2] text-[12px] text-[#4d6b62]">
					<tr>
						<th class="px-3 py-2 font-medium">{m.privacy_col_file()}</th>
						<th class="px-3 py-2 font-medium">{m.privacy_col_content()}</th>
						<th class="px-3 py-2 font-medium">{m.privacy_col_typed()}</th>
					</tr>
				</thead>
				<tbody>
					{#each files as file (file.name)}
						<tr class="border-t border-line">
							<td class="px-3 py-2 whitespace-nowrap">
								<code class="rounded bg-[#eef3f1] px-1.5 py-0.5 text-[12px] text-ink"
									>{fileName(file.name)}</code
								>
							</td>
							<td class="px-3 py-2 leading-[1.6] text-muted">{file.what()}</td>
							<td class="px-3 py-2 text-muted">{file.typed()}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<p class="mt-3 text-[12px] leading-[1.7] text-muted">{m.privacy_files_note()}</p>
	</section>

	<!-- 日志与诊断 -->
	<section id="logs" class="scroll-mt-3">
		<SectionHeading title={m.privacy_logs_title()} desc={m.privacy_logs_desc()} />
		<div class="grid gap-4 desk:grid-cols-2">
			<article class="rounded-lg border border-line bg-white/86 p-4">
				<h3 class="mb-2 text-[15px]">{m.privacy_runlog_title()}</h3>
				<p class="text-[13px] leading-[1.7] text-muted">
					{m.privacy_runlog_a()}<strong class="font-medium text-ink">{m.privacy_runlog_b()}</strong
					>{m.privacy_runlog_c()}
				</p>
			</article>
			<article class="rounded-lg border border-line bg-white/86 p-4">
				<h3 class="mb-2 text-[15px]">{m.privacy_diag_title()}</h3>
				<p class="text-[13px] leading-[1.7] text-muted">
					{m.privacy_diag_a()}<strong class="font-medium text-ink">{m.privacy_diag_b()}</strong
					>{m.privacy_diag_c()}
				</p>
			</article>
		</div>
	</section>

	<!-- 删除 -->
	<section id="delete" class="scroll-mt-3">
		<SectionHeading title={m.privacy_delete_title()} desc={m.privacy_delete_desc()} />
		<div class="rounded-2xl border border-line bg-white/86 p-5 desk:p-6">
			<ul class="flex flex-col gap-2 text-[13px] leading-[1.7] text-muted">
				<li>{m.privacy_delete_li1()}</li>
				<li>
					{m.privacy_delete_li2_a()}
					<code class="rounded bg-[#eef3f1] px-1.5 py-0.5 text-[12px] text-ink"
						>/Library/Input Methods/Qingjian.app/Contents/Resources/uninstall.sh --purge</code
					>{m.privacy_delete_li2_b()}
					<code class="rounded bg-[#eef3f1] px-1.5 py-0.5 text-[12px] text-ink">--purge</code>
					{m.privacy_delete_li2_c()}
				</li>
				<li>
					{m.privacy_delete_li3_a()}
					<code class="rounded bg-[#eef3f1] px-1.5 py-0.5 text-[12px] text-ink">dicts/</code
					>{m.privacy_delete_li3_b()}
					<code class="rounded bg-[#eef3f1] px-1.5 py-0.5 text-[12px] text-ink">dicts/removed/</code
					>{m.privacy_delete_li3_c()}
				</li>
			</ul>
			<p class="mt-4 text-[12px] text-muted">
				{m.privacy_docs_a()}<a
					class="text-teal underline"
					href={localized(resolve('/docs/[...path]', { path: 'help/privacy' }))}
					>{m.privacy_docs_link()}</a
				>{m.privacy_docs_b()}
			</p>
		</div>
	</section>
</Subpage>
