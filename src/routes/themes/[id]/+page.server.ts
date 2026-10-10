import { error } from '@sveltejs/kit';
import { renderMarkdown } from '$lib/docs/render';
import { findTheme, themeReadme, themes } from '$lib/themes';
import type { EntryGenerator, PageServerLoad } from './$types';

/** 主题详情全部预渲染：README 只在构建时渲染 */
export const prerender = true;

export const entries: EntryGenerator = () => themes.map((theme) => ({ id: theme.id }));

export const load: PageServerLoad = ({ params }) => {
	const theme = findTheme(params.id);
	if (!theme) error(404, '没有这个主题');
	// README 开头的一级标题就是主题名，页头已经有了
	const body = themeReadme(theme.id).replace(/^\s*#\s+[^\n]*\n/, '');
	const { html } = renderMarkdown(body, '', `/themes-assets/${theme.id}`);
	return { theme, html };
};
