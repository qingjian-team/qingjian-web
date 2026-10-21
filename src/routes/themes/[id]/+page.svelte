<script lang="ts">
	import { resolve } from '$app/paths';
	import ArrowLeftIcon from 'phosphor-svelte/lib/ArrowLeftIcon';
	import ArrowSquareOutIcon from 'phosphor-svelte/lib/ArrowSquareOutIcon';
	import DownloadSimpleIcon from 'phosphor-svelte/lib/DownloadSimpleIcon';
	import Button from '$lib/components/Button.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { localized } from '$lib/i18n';
	import { m } from '$lib/paraglide/messages';
	import { appearanceLabel, screenshotLabel } from '$lib/themes';
	import '$lib/docs/doc.css';

	let { data } = $props();
	const theme = $derived(data.theme);
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -- 站内链接经 localized()：先 resolve()，再加语言前缀 -->

<Seo
	title={m.theme_seo_title({ name: theme.name })}
	description={m.theme_seo_desc({ description: theme.description, author: theme.author })}
	image={theme.cover ?? undefined}
/>

<div class="wrap min-h-[65vh] py-[30px] pb-[45px] desk:py-[50px] desk:pb-20">
	<a
		href={localized(resolve('/themes'))}
		class="mb-6 inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-teal"
		><ArrowLeftIcon size={14} /> {m.theme_back()}</a
	>

	<div class="grid gap-8 desk:grid-cols-[minmax(0,1fr)_300px]">
		<div class="min-w-0">
			<div class="flex flex-wrap items-center gap-3">
				<h1 class="font-song text-[30px] leading-[1.4] font-bold desk:text-[38px]">{theme.name}</h1>
				{#if theme.example}
					<span class="rounded-full bg-[#eef5e8] px-2.5 py-0.5 text-[12px] text-teal"
						>{m.themes_builtin()}</span
					>
				{/if}
			</div>
			<p class="mt-2 text-base leading-[1.6] text-muted">{theme.description}</p>

			<div class="mt-7 grid gap-5">
				{#each theme.screenshots as shot (shot.name)}
					<figure>
						<img
							src={shot.src}
							alt="{theme.name} · {screenshotLabel(shot.name)}"
							class="mx-auto max-h-[560px] w-auto max-w-full rounded-xl"
						/>
						<figcaption class="mt-2 text-center text-[12px] text-[#8a9a94]">
							{screenshotLabel(shot.name)}
						</figcaption>
					</figure>
				{/each}
			</div>

			{#if data.html}
				<div class="doc mt-10 rounded-2xl border border-line bg-white/86 p-5 desk:p-[30px]">
					<!-- eslint-disable-next-line svelte/no-at-html-tags -- 主题仓库的 README，构建时渲染 -->
					{@html data.html}
				</div>
			{/if}
		</div>

		<aside class="desk:sticky desk:top-[100px] desk:self-start">
			<div class="rounded-2xl border border-line bg-white/86 p-5">
				{#if theme.download}
					<Button href={theme.download} download class="w-full">
						<DownloadSimpleIcon size={17} />
						{m.theme_download()}
					</Button>
					<p class="mt-3 text-[12px] leading-[1.7] text-muted">
						{m.theme_install_a()} <code>{theme.id}</code>
						{m.theme_install_b()} <code>themes</code>
						{m.theme_install_c()}
					</p>
				{:else}
					<p class="text-[13px] leading-[1.7] text-muted">
						{m.theme_builtin_note({ name: theme.name })}
					</p>
				{/if}

				<dl class="mt-5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-[13px]">
					<dt class="text-[#8a9a94]">{m.theme_author()}</dt>
					<dd>{theme.author}</dd>
					<dt class="text-[#8a9a94]">{m.theme_version()}</dt>
					<dd>{theme.version}</dd>
					<dt class="text-[#8a9a94]">{m.theme_appearance()}</dt>
					<dd>{appearanceLabel(theme.appearance)}</dd>
					<dt class="text-[#8a9a94]">{m.theme_license()}</dt>
					<dd>{theme.license}</dd>
				</dl>

				{#if theme.tags.length}
					<ul class="mt-4 flex flex-wrap gap-1.5">
						{#each theme.tags as tag (tag)}
							<li class="rounded-full border border-line px-2.5 py-0.5 text-[12px] text-muted">
								{tag}
							</li>
						{/each}
					</ul>
				{/if}

				<a
					href={theme.source}
					target="_blank"
					rel="noopener"
					class="mt-5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-teal hover:underline"
					>{m.theme_source()} <ArrowSquareOutIcon size={14} /></a
				>
			</div>
		</aside>
	</div>
</div>
