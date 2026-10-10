<script lang="ts">
	import { resolve } from '$app/paths';
	import ArrowSquareOutIcon from 'phosphor-svelte/lib/ArrowSquareOutIcon';
	import Seo from '$lib/components/Seo.svelte';
	import Subpage from '$lib/components/Subpage.svelte';
	import { themes } from '$lib/themes';

	const CONTRIBUTE = 'https://github.com/qingjian-team/qingjian-themes#提交主题';
</script>

<Seo
	title="主题"
	description="青简输入法的候选窗口主题：下载后放进数据目录的 themes 文件夹即可使用，也可以照着樱花主题写自己的主题并投稿。"
/>

<Subpage
	title="主题"
	desc="换一身候选窗口。下载后放进数据目录的 themes 文件夹，在设置里选它就能用；macOS 与 Windows 显示一致。"
>
	{#if themes.length}
		<ul class="grid gap-5 desk:grid-cols-3 sm:grid-cols-2">
			{#each themes as theme (theme.id)}
				<li>
					<a
						href={resolve('/themes/[id]', { id: theme.id })}
						class="group block overflow-hidden rounded-2xl border border-line bg-white/86 transition hover:-translate-y-0.5 hover:shadow-[0_10px_30px_#254b3514]"
					>
						<div class="aspect-[1200/630] overflow-hidden bg-[#f4f7f5]">
							{#if theme.cover}
								<img
									src={theme.cover}
									alt="{theme.name}的封面"
									loading="lazy"
									class="size-full object-cover transition duration-300 group-hover:scale-[1.02]"
								/>
							{/if}
						</div>
						<div class="p-4">
							<div class="flex items-center gap-2">
								<h2 class="font-song text-[18px] font-bold">{theme.name}</h2>
								{#if theme.example}
									<span class="rounded-full bg-[#eef5e8] px-2 py-0.5 text-[11px] text-teal"
										>内置</span
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
		<p class="text-muted">还没有主题。</p>
	{/if}

	<section class="mt-12 rounded-2xl border border-line bg-white/86 p-5 desk:p-[26px]">
		<h2 class="mb-2 font-song text-[20px] font-bold">投稿主题</h2>
		<p class="mb-4 text-[14px] leading-[1.75] text-muted">
			主题是一个文件夹：theme.json、README 与几张截图。写法见<a
				class="text-teal hover:underline"
				href={resolve('/docs/[...path]', { path: 'settings/themes' })}>使用文档「主题」页</a
			>，可以照着内置的樱花主题改，写好后向主题仓库提 PR。
		</p>
		<a
			href={CONTRIBUTE}
			target="_blank"
			rel="noopener"
			class="inline-flex items-center gap-1.5 text-[14px] font-semibold text-teal hover:underline"
			>投稿说明 <ArrowSquareOutIcon size={15} /></a
		>
	</section>
</Subpage>
