<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import Seo from '$lib/components/Seo.svelte';
	import Subpage from '$lib/components/Subpage.svelte';
	import { localized } from '$lib/i18n';
	import { m } from '$lib/paraglide/messages';
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -- 站内链接经 localized()：先 resolve()，再加语言前缀 -->

<Seo title={m.err_not_found()} description={m.err_seo_desc()} />

<Subpage
	title="{page.status} · {page.status === 404 ? m.err_not_found() : m.err_generic()}"
	desc={m.err_desc()}
>
	<a class="text-teal" href={localized(resolve('/'))}>{m.err_back()}</a>
</Subpage>
