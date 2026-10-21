import { allSlugs, translatedLocales } from '$lib/docs/content';
import { localized, locales, type Locale } from '$lib/i18n';
import { themes } from '$lib/themes';

/** 站点地图在构建时生成：固定页 + 全部文档页 + 全部主题页，每页列出各语言版本 */
export const prerender = true;

const SITE = 'https://qingjian.app';

type Entry = {
	path: string;
	priority: string;
	changefreq: string;
	translations?: readonly Locale[];
};

const fixed: Entry[] = [
	{ path: '/', priority: '1.0', changefreq: 'weekly' },
	{ path: '/download', priority: '0.9', changefreq: 'weekly' },
	{ path: '/docs', priority: '0.8', changefreq: 'monthly' },
	{ path: '/themes', priority: '0.7', changefreq: 'weekly' },
	{ path: '/about', priority: '0.6', changefreq: 'monthly' },
	{ path: '/privacy', priority: '0.5', changefreq: 'monthly' }
];

export function GET() {
	const docs = allSlugs()
		.filter((slug) => slug)
		.map((slug): Entry => ({
			path: `/docs/${slug}`,
			priority: '0.7',
			changefreq: 'monthly',
			// 文档只列有译本的语言；没译的语言版本显示替补版本，规范地址指向替补版本
			translations: translatedLocales(slug)
		}));
	const themePages = themes.map((theme): Entry => ({
		path: `/themes/${theme.id}`,
		priority: '0.6',
		changefreq: 'monthly'
	}));
	const urls = [...fixed, ...docs, ...themePages]
		.flatMap(({ path, priority, changefreq, translations = locales }) => {
			// 每个语言版本一条 <url>，各自列出全部语言的对应地址（hreflang），搜索引擎按这个把它们归成一组
			const alternates = translations
				.map(
					(locale) =>
						`\t\t<xhtml:link rel="alternate" hreflang="${locale}" href="${SITE}${localized(path, locale)}"/>`
				)
				.join('\n');
			return translations.map(
				(locale) =>
					`\t<url>\n\t\t<loc>${SITE}${localized(path, locale)}</loc>\n${alternates}\n\t\t<changefreq>${changefreq}</changefreq>\n\t\t<priority>${priority}</priority>\n\t</url>`
			);
		})
		.join('\n');
	const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`;
	return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
}
