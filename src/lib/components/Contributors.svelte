<script lang="ts">
	import type { Contributor } from '$lib/releases';

	type Props = {
		contributors: Contributor[];
		class?: string;
	};

	let { contributors, class: className = '' }: Props = $props();

	/** GitHub 按用户名直接给头像图，不用走 API；要 2 倍图显示清楚 */
	function avatar(login: string) {
		return `https://github.com/${login}.png?size=56`;
	}
</script>

<!-- 更新日志里「本版社区贡献」那一行：一排头像，悬停显示用户名与贡献内容，点开 GitHub 用户页 -->
<div class="flex flex-wrap items-center gap-2 {className}">
	<span class="text-[12px] text-muted">社区贡献</span>
	<ul class="flex flex-wrap items-center gap-1.5">
		{#each contributors as { login, note } (login)}
			<li>
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- 外部链接 -->
				<a
					href="https://github.com/{login}"
					target="_blank"
					rel="noopener"
					title={note ? `@${login} · ${note}` : `@${login}`}
					aria-label={note ? `@${login}：${note}` : `@${login}`}
					class="block rounded-full ring-2 ring-white transition-transform hover:scale-110"
				>
					<img
						src={avatar(login)}
						alt="@{login}"
						width="28"
						height="28"
						loading="lazy"
						decoding="async"
						referrerpolicy="no-referrer"
						class="size-7 rounded-full bg-[#eef3f1]"
					/>
				</a>
			</li>
		{/each}
	</ul>
</div>
