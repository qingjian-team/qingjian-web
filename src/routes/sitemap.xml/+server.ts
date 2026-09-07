import { allSlugs } from '$lib/docs/content';

/** 站点地图在构建时生成：固定页 + 全部文档页 */
export const prerender = true;

const SITE = 'https://qingjian.app';

const fixed: { path: string; priority: string; changefreq: string }[] = [
	{ path: '/', priority: '1.0', changefreq: 'weekly' },
	{ path: '/download', priority: '0.9', changefreq: 'weekly' },
	{ path: '/docs', priority: '0.8', changefreq: 'monthly' },
	{ path: '/about', priority: '0.6', changefreq: 'monthly' },
	{ path: '/privacy', priority: '0.5', changefreq: 'monthly' }
];

export function GET() {
	const docs = allSlugs()
		.filter((slug) => slug)
		.map((slug) => ({ path: `/docs/${slug}`, priority: '0.7', changefreq: 'monthly' }));
	const urls = [...fixed, ...docs]
		.map(
			({ path, priority, changefreq }) =>
				`\t<url>\n\t\t<loc>${SITE}${path}</loc>\n\t\t<changefreq>${changefreq}</changefreq>\n\t\t<priority>${priority}</priority>\n\t</url>`
		)
		.join('\n');
	const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
	return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
}
