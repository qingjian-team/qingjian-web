<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import Seo from '$lib/components/Seo.svelte';
	import Subpage from '$lib/components/Subpage.svelte';
</script>

<Seo title="页面不存在" description="这个地址下没有内容。" />

<Subpage
	title="{page.status} · {page.status === 404 ? '页面不存在' : '出了点问题'}"
	desc="这个地址下没有内容，从首页重新开始吧。"
>
	<a class="text-teal" href={resolve('/')}>返回首页</a>
</Subpage>
