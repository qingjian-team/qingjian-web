<script lang="ts">
	import { resolve } from '$app/paths';
	import ArrowLeftIcon from 'phosphor-svelte/lib/ArrowLeftIcon';
	import ArrowRightIcon from 'phosphor-svelte/lib/ArrowRightIcon';
	import CaretRightIcon from 'phosphor-svelte/lib/CaretRightIcon';
	import LeafIcon from 'phosphor-svelte/lib/LeafIcon';
	import Seo from '$lib/components/Seo.svelte';
	import '$lib/docs/doc.css';

	let { data } = $props();

	/** 文档内的站内地址；首页是 /docs 本身 */
	const href = (slug: string) => resolve('/docs/[...path]', { path: slug });

	/** 侧栏分组默认全部展开；点箭头可以手动收起，换页时收起的状态保留 */
	let manual = $state<Record<string, boolean>>({});
	const isOpen = (group: string) => manual[group] ?? true;
	const toggle = (group: string) => {
		manual = { ...manual, [group]: !isOpen(group) };
	};

	/** 页内目录高亮的二级标题：滚动时取最后一个顶部已越过导航栏下沿的 */
	let active = $state('');

	$effect(() => {
		const OFFSET = 130;
		let frame = 0;
		const ids = data.toc.map((entry) => entry.id);
		const update = () => {
			frame = 0;
			let current = ids[0] ?? '';
			for (const id of ids) {
				const element = document.getElementById(id);
				if (element && element.getBoundingClientRect().top <= OFFSET) current = id;
			}
			const bottom = window.innerHeight + window.scrollY;
			if (ids.length && bottom >= document.documentElement.scrollHeight - 2) current = ids.at(-1)!;
			active = current;
		};
		const schedule = () => {
			if (!frame) frame = requestAnimationFrame(update);
		};
		update();
		window.addEventListener('scroll', schedule, { passive: true });
		window.addEventListener('resize', schedule);
		return () => {
			window.removeEventListener('scroll', schedule);
			window.removeEventListener('resize', schedule);
			if (frame) cancelAnimationFrame(frame);
		};
	});
</script>

<Seo
	title={data.slug ? data.meta.title : '使用文档'}
	description={data.meta.description || `青简输入法使用文档：${data.meta.title}。`}
/>

<div class="wrap min-h-[65vh] py-[30px] pb-[45px] desk:py-[50px] desk:pb-20">
	<!-- 三栏各自指定列位置，不靠自动放置：两列时右栏藏起来，否则它会被挤到下一行压在左栏上 -->
	<div
		class="grid gap-8 max:grid-cols-[200px_minmax(0,1fr)_170px] wide:grid-cols-[200px_minmax(0,1fr)]"
	>
		<!-- 左：文档目录树。sticky 且自己滚动，与正文互不牵连 -->
		<nav
			aria-label="文档目录"
			class="wide:sticky wide:top-[100px] wide:col-start-1 wide:row-start-1 wide:max-h-[calc(100vh-130px)] wide:self-start wide:overflow-y-auto wide:pr-2 wide:pb-6"
		>
			<a
				class="mb-3 block text-[13px] font-semibold tracking-[1px] {data.slug === ''
					? 'text-teal'
					: 'text-ink hover:text-teal'}"
				href={href('')}
				aria-current={data.slug === '' ? 'page' : undefined}>使用文档</a
			>
			<ul class="flex flex-wrap gap-x-5 gap-y-2 text-[13px] wide:flex-col wide:gap-y-1">
				{#each data.navigation as group (group.slug)}
					{@const open = isOpen(group.slug)}
					<li>
						<div class="flex items-center gap-1">
							<button
								class="grid size-5 place-items-center rounded text-[#8a9a94] hover:text-teal"
								aria-expanded={open}
								aria-label="{open ? '收起' : '展开'}{group.title}"
								onclick={() => toggle(group.slug)}
							>
								<CaretRightIcon
									size={11}
									weight="bold"
									class="transition-transform {open ? 'rotate-90' : ''}"
								/>
							</button>
							<a
								class="py-1 text-[13px] font-medium {data.slug === group.slug
									? 'text-teal'
									: 'text-ink hover:text-teal'}"
								href={href(group.slug)}
								aria-current={data.slug === group.slug ? 'page' : undefined}>{group.title}</a
							>
						</div>
						{#if open}
							<ul class="mb-1 ml-[9px] flex flex-col gap-y-1.5 border-l border-line pl-3">
								{#each group.pages as page (page.slug)}
									{@const current = data.slug === page.slug}
									<li class="relative">
										{#if current}
											<span
												class="pointer-events-none absolute top-[3px] bottom-[3px] -left-[13px] w-[2px] rounded-full bamboo-joint-y"
												aria-hidden="true"
											></span>
										{/if}
										<a
											class="block py-[2px] transition-colors hover:text-teal {current
												? 'text-teal'
												: 'text-muted'}"
											href={href(page.slug)}
											aria-current={current ? 'page' : undefined}>{page.title}</a
										>
									</li>
								{/each}
							</ul>
						{/if}
					</li>
				{/each}
			</ul>
		</nav>

		<!-- 中：正文。只画页名，不画上面的分组名（侧栏已经高亮） -->
		<article class="min-w-0 wide:col-start-2 wide:row-start-1">
			<h1 class="mb-2 font-song text-[28px] leading-[1.4] font-bold desk:text-[32px]">
				{data.meta.title}
			</h1>
			{#if data.meta.description}
				<p class="mb-6 text-[14px] leading-[1.7] text-muted">{data.meta.description}</p>
			{:else}
				<div class="mb-6"></div>
			{/if}

			<div class="doc rounded-2xl border border-line bg-white/86 p-5 desk:p-[30px]">
				<!-- eslint-disable-next-line svelte/no-at-html-tags -- 正文是主仓库 docs/user 的 Markdown 在构建时渲染的，不含用户输入 -->
				{@html data.html}

				{#if data.children.length}
					<ul class="not-doc mt-2 grid gap-3 desk:grid-cols-2">
						{#each data.children as child (child.slug)}
							<li>
								<a
									class="block h-full rounded-lg border border-line bg-white px-4 py-3 transition-colors hover:border-[#abd7d0]"
									href={href(child.slug)}
								>
									<strong class="text-[15px] font-medium text-ink">{child.title}</strong>
									{#if child.description}
										<span class="mt-1 block text-[12px] leading-[1.6] text-muted"
											>{child.description}</span
										>
									{/if}
								</a>
							</li>
						{/each}
					</ul>
				{/if}
			</div>

			<!-- 上一页 / 下一页 -->
			<nav aria-label="翻页" class="mt-6 grid gap-3 text-[13px] desk:grid-cols-2">
				{#if data.previous}
					<a
						class="flex items-center gap-2 rounded-lg border border-line bg-white/86 px-4 py-3 text-muted transition-colors hover:text-teal"
						href={href(data.previous.slug)}
					>
						<ArrowLeftIcon size={15} />
						<span
							><span class="block text-[11px] text-[#9aa5b1]">上一页</span>{data.previous
								.title}</span
						>
					</a>
				{:else}
					<span></span>
				{/if}
				{#if data.next}
					<a
						class="flex items-center justify-end gap-2 rounded-lg border border-line bg-white/86 px-4 py-3 text-right text-muted transition-colors hover:text-teal"
						href={href(data.next.slug)}
					>
						<span
							><span class="block text-[11px] text-[#9aa5b1]">下一页</span>{data.next.title}</span
						>
						<ArrowRightIcon size={15} />
					</a>
				{/if}
			</nav>
		</article>

		<!-- 右：本页的二级标题，随滚动高亮；只在最宽一档出现 -->
		{#if data.toc.length}
			<nav
				aria-label="本页目录"
				class="hidden max:sticky max:top-[100px] max:col-start-3 max:row-start-1 max:block max:self-start"
			>
				<span class="mb-3 block text-[11px] font-semibold tracking-[1.5px] text-[#4d6b62]"
					>本页</span
				>
				<ul class="flex flex-col gap-2 text-[12px]">
					{#each data.toc as entry (entry.id)}
						{@const current = active === entry.id}
						<li>
							<a
								class="inline-flex items-center gap-1.5 transition-colors hover:text-teal {current
									? 'text-teal'
									: 'text-muted'}"
								href="#{entry.id}"
								aria-current={current ? 'location' : undefined}
							>
								<LeafIcon
									size={12}
									weight={current ? 'fill' : 'regular'}
									class="shrink-0 {current ? 'opacity-100' : 'opacity-35'}"
								/>
								{entry.text}
							</a>
						</li>
					{/each}
				</ul>
			</nav>
		{/if}
	</div>
</div>
