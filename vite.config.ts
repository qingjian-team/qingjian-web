import tailwindcss from '@tailwindcss/vite';
import adapter from '@sveltejs/adapter-cloudflare';
import { sveltekit } from '@sveltejs/kit/vite';
import { paraglideVitePlugin } from '@inlang/paraglide-js';
import { defineConfig } from 'vite';

/** 中文（简体）不带前缀，其余语言带 /<前缀>/；繁体用小写的 zh-hant，地址里不出现大写 */
const LOCALE_PREFIXES: [string, string][] = [
	['zh-Hant', 'zh-hant'],
	['en', 'en'],
	['ja', 'ja'],
	['es', 'es'],
	['vi', 'vi'],
	['de', 'de']
];
const ORIGIN = ':protocol://:domain(.*)::port?';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter()
		}),
		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide',
			emitTsDeclarations: true,
			// 语言只看地址：不读 cookie、不按浏览器语言自动跳转，浏览器语言只用来在页顶提示切换
			strategy: ['url', 'baseLocale'],
			urlPatterns: [
				{
					pattern: `${ORIGIN}/:path(.*)?`,
					localized: [
						...LOCALE_PREFIXES.map(
							([locale, prefix]) => [locale, `${ORIGIN}/${prefix}/:path(.*)?`] as [string, string]
						),
						['zh-Hans', `${ORIGIN}/:path(.*)?`]
					]
				}
			]
		})
	]
});
