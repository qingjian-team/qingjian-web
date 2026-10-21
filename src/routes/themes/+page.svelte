<script lang="ts">
	import { resolve } from '$app/paths';
	import ArrowSquareOutIcon from 'phosphor-svelte/lib/ArrowSquareOutIcon';
	import Seo from '$lib/components/Seo.svelte';
	import Subpage from '$lib/components/Subpage.svelte';
	import { localized } from '$lib/i18n';
	import { m } from '$lib/paraglide/messages';
	import { themes } from '$lib/themes';

	const CONTRIBUTE = 'https://github.com/qingjian-team/qingjian-themes#提交主题';
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -- 站内链接经 localized()：先 resolve()，再加语言前缀 -->

<Seo title={m.themes_seo_title()} description={m.themes_seo_desc()} />

<Subpage title={m.themes_title()} desc={m.themes_desc()}>
	{#if themes.length}
		<ul class="grid gap-5 desk:grid-cols-3 sm:grid-cols-2">
			{#each themes as theme (theme.id)}
				<li>
					<a
						href={localized(resolve('/themes/[id]', { id: theme.id }))}
						class="group block overflow-hidden rounded-2xl border border-line bg-white/86 transition hover:-translate-y-0.5 hover:shadow-[0_10px_30px_#254b3514]"
					>
						<div class="aspect-[1200/630] overflow-hidden bg-[#f4f7f5]">
							{#if theme.cover}
								<img
									src={theme.cover}
									alt={m.themes_cover_alt({ name: theme.name })}
									loading="lazy"
									class="size-full object-cover transition duration-300 group-hover:scale-[1.02]"
								/>
							{/if}
						</div>
						<!-- 主题名与介绍是作者写的，原样显示 -->
						<div class="p-4" lang="zh-Hans">
							<div class="flex items-center gap-2">
								<h2 class="font-song text-[18px] font-bold">{theme.name}</h2>
								{#if theme.example}
									<span class="rounded-full bg-[#eef5e8] px-2 py-0.5 text-[11px] text-teal"
										>{m.themes_builtin()}</span
									>
								{/if}
							</div>
							<p class="mt-1.5 line-clamp-2 text-[13px] leading-[1.6] text-muted">
								{theme.description}
							</p>
							<p class="mt-2.5 text-[12px] text-[#8a9a94]">{theme.author}</p>
						</div>
					</a>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="text-muted">{m.themes_empty()}</p>
	{/if}

	<section class="mt-12 rounded-2xl border border-line bg-white/86 p-5 desk:p-[26px]">
		<h2 class="mb-2 font-song text-[20px] font-bold">{m.themes_contribute_title()}</h2>
		<p class="mb-4 text-[14px] leading-[1.75] text-muted">
			{m.themes_contribute_a()}<a
				class="text-teal hover:underline"
				href={localized(resolve('/docs/[...path]', { path: 'advanced/custom-themes' }))}
				>{m.themes_contribute_link()}</a
			>{m.themes_contribute_b()}
		</p>
		<a
			href={CONTRIBUTE}
			target="_blank"
			rel="noopener"
			class="inline-flex items-center gap-1.5 text-[14px] font-semibold text-teal hover:underline"
			>{m.themes_contribute_guide()} <ArrowSquareOutIcon size={15} /></a
		>
	</section>
</Subpage>
