import { parseFrontmatter, type DocMeta } from './frontmatter';

/**
 * 文档内容层：把 `scripts/sync-docs.mjs` 同步来的 src/content/docs/**\/*.md 组织成
 * 「首页 + 分组 + 页」的树。目录结构就是站点结构，只支持一层分组（与主仓库 docs/user/README.md 的约定一致）。
 * 只在服务端（预渲染时）用，Markdown 原文不进客户端包。
 */

export type DocPage = {
	/** 站内路径，不含 /docs 前缀：'' 是首页，'getting-started' 是分组页，'getting-started/install' 是正文页 */
	slug: string;

	/** 所在分组的 slug；首页与分组页自己是 '' / 分组 slug */
	group: string;

	meta: DocMeta;

	/** 去掉 frontmatter 的 Markdown 正文 */
	body: string;
};

export type DocGroup = {
	slug: string;

	meta: DocMeta;

	/** 分组下的正文页，按 order 排好 */
	pages: DocPage[];
};

const PREFIX = '/src/content/docs/';

const sources = import.meta.glob('/src/content/docs/**/*.md', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

const byOrder = (a: { meta: DocMeta }, b: { meta: DocMeta }) =>
	a.meta.order - b.meta.order || a.meta.title.localeCompare(b.meta.title, 'zh');

function build() {
	const pages = new Map<string, DocPage>();
	for (const [file, source] of Object.entries(sources)) {
		const relative = file.slice(PREFIX.length).replace(/\.md$/, '');
		const slug = relative === 'index' ? '' : relative.replace(/\/index$/, '');
		const group = slug.includes('/') ? slug.slice(0, slug.indexOf('/')) : slug;
		const { meta, body } = parseFrontmatter(source);
		pages.set(slug, { slug, group, meta, body });
	}

	const home = pages.get('') ?? null;
	const groups: DocGroup[] = [...pages.values()]
		.filter((page) => page.slug && !page.slug.includes('/'))
		.map((index) => ({
			slug: index.slug,
			meta: index.meta,
			pages: [...pages.values()]
				.filter((page) => page.group === index.slug && page.slug !== index.slug)
				.sort(byOrder)
		}))
		.sort(byOrder);

	// 阅读顺序：首页、每个分组的分组页、分组下各页；上一页 / 下一页按它走
	const sequence: DocPage[] = [];
	if (home) sequence.push(home);
	for (const group of groups) {
		const index = pages.get(group.slug);
		if (index) sequence.push(index);
		sequence.push(...group.pages);
	}

	return { pages, home, groups, sequence };
}

const tree = build();

/** 侧栏用的导航树 */
export const navigation = tree.groups.map((group) => ({
	slug: group.slug,
	title: group.meta.title,
	pages: group.pages.map((page) => ({ slug: page.slug, title: page.meta.title }))
}));

export const home = tree.home;

export function findPage(slug: string): DocPage | null {
	return tree.pages.get(slug) ?? null;
}

export function findGroup(slug: string): DocGroup | null {
	return tree.groups.find((group) => group.slug === slug) ?? null;
}

/** 所有页的 slug，预渲染入口用 */
export function allSlugs(): string[] {
	return tree.sequence.map((page) => page.slug);
}

/** 阅读顺序里的前后页 */
export function neighbors(slug: string): { previous: DocPage | null; next: DocPage | null } {
	const index = tree.sequence.findIndex((page) => page.slug === slug);
	return {
		previous: index > 0 ? tree.sequence[index - 1] : null,
		next: index >= 0 && index < tree.sequence.length - 1 ? tree.sequence[index + 1] : null
	};
}
