import { error } from '@sveltejs/kit';
import { allSlugs, findGroup, findPage, navigation, neighbors } from '$lib/docs/content';
import { renderMarkdown } from '$lib/docs/render';
import { localized } from '$lib/i18n';
import type { EntryGenerator, PageServerLoad } from './$types';

/** 文档全部预渲染成静态页：Markdown 与渲染器只在构建时跑，线上不动 */
export const prerender = true;

export const entries: EntryGenerator = () => allSlugs().map((slug) => ({ path: slug }));

export const load: PageServerLoad = ({ params }) => {
	const slug = params.path ?? '';
	const page = findPage(slug);
	if (!page) error(404, '没有这一页文档');

	const currentDir = slug.includes('/') ? slug.slice(0, slug.lastIndexOf('/')) : slug;
	const rendered = renderMarkdown(page.body, page.slug === page.group ? slug : currentDir);
	// 正文里的站内链接跟着当前语言走，读英文版的人点进别的文档页还是英文版
	const prefix = localized('/').replace(/\/$/, '');
	const html = prefix
		? rendered.html.replaceAll('href="/docs', `href="${prefix}/docs`)
		: rendered.html;
	const { toc } = rendered;
	const group = slug ? findGroup(page.group) : null;
	const { previous, next } = neighbors(slug);
	const brief = (item: typeof previous) =>
		item ? { slug: item.slug, title: item.meta.title } : null;

	return {
		slug,
		meta: page.meta,
		html,
		toc,
		navigation,
		/** 所在分组，首页没有 */
		group: group ? { slug: group.slug, title: group.meta.title } : null,
		/** 分组页列出组内各页 */
		children:
			group && group.slug === slug
				? group.pages.map((child) => ({
						slug: child.slug,
						title: child.meta.title,
						description: child.meta.description
					}))
				: [],
		previous: brief(previous),
		next: brief(next)
	};
};
