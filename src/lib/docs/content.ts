import { baseLocale, locales, type Locale } from '$lib/i18n';
import { parseFrontmatter, type DocMeta } from './frontmatter';

/**
 * 文档内容层：把 `scripts/sync-docs.mjs` 同步来的 src/content/docs/**\/*.md 组织成
 * 「首页 + 分组 + 页」的树。目录结构就是站点结构，只支持一层分组（与主仓库 docs/user/README.md 的约定一致）。
 * 中文原文在根下，各语言译本在 i18n/<语言>/ 下、目录结构与原文一一对应；某页没有译本时按 fallbackChain 找替补。
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

	/** 这一页实际是哪种语言：有译本就是请求的语言，回退时是替补的语言（英文或中文） */
	locale: Locale;
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

/** 文件路径 → [语言, slug]；i18n/<语言>/ 下的是译本，其余是中文原文 */
function locate(file: string): [Locale, string] | null {
	let relative = file.slice(PREFIX.length).replace(/\.md$/, '');
	let locale: Locale = baseLocale;
	const translated = /^i18n\/([^/]+)\/(.+)$/.exec(relative);
	if (translated) {
		if (!(locales as readonly string[]).includes(translated[1])) return null;
		locale = translated[1] as Locale;
		relative = translated[2];
	}
	const slug = relative === 'index' ? '' : relative.replace(/\/index$/, '');
	return [locale, slug];
}

/** 各语言各页的原始内容：pagesBy[语言][slug] */
const pagesBy = new Map<Locale, Map<string, DocPage>>(locales.map((l) => [l, new Map()]));
for (const [file, source] of Object.entries(sources)) {
	const located = locate(file);
	if (!located) continue;
	const [locale, slug] = located;
	const group = slug.includes('/') ? slug.slice(0, slug.indexOf('/')) : slug;
	const { meta, body } = parseFrontmatter(source);
	pagesBy.get(locale)!.set(slug, { slug, group, meta, body, locale });
}

/**
 * 没有译本时按什么顺序找替补：繁体看简体原文；其余外语先看英文版（读外语的人多半读得懂英文、读不懂中文），
 * 英文也没有再看中文原文。
 */
export function fallbackChain(locale: Locale): Locale[] {
	if (locale === baseLocale || locale === 'zh-Hant' || locale === 'en')
		return [...new Set<Locale>([locale, baseLocale])];
	return [locale, 'en', baseLocale];
}

/** 一种语言的文档树：页面集合以中文原文为准（译本里多出来的页不算），每页取替补顺序里第一个有的版本 */
function build(locale: Locale) {
	const base = pagesBy.get(baseLocale)!;
	const chain = fallbackChain(locale).map((l) => pagesBy.get(l)!);
	const pages = new Map<string, DocPage>();
	for (const slug of base.keys()) pages.set(slug, chain.find((m) => m.has(slug))!.get(slug)!);

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

	const navigation = groups.map((group) => ({
		slug: group.slug,
		title: group.meta.title,
		pages: group.pages.map((page) => ({ slug: page.slug, title: page.meta.title }))
	}));

	return { pages, groups, sequence, navigation };
}

const trees = new Map(locales.map((locale) => [locale, build(locale)]));
const tree = (locale: Locale) => trees.get(locale)!;

/** 侧栏用的导航树 */
export function navigation(locale: Locale) {
	return tree(locale).navigation;
}

export function findPage(slug: string, locale: Locale = baseLocale): DocPage | null {
	return tree(locale).pages.get(slug) ?? null;
}

export function findGroup(slug: string, locale: Locale = baseLocale): DocGroup | null {
	return tree(locale).groups.find((group) => group.slug === slug) ?? null;
}

/** 所有页的 slug，预渲染入口用（各语言的页面集合相同） */
export function allSlugs(): string[] {
	return tree(baseLocale).sequence.map((page) => page.slug);
}

/** 这一页有译本的语言（含中文原文），给 hreflang 与站点地图用 */
export function translatedLocales(slug: string): Locale[] {
	return locales.filter((locale) => pagesBy.get(locale)!.has(slug));
}

/** 阅读顺序里的前后页 */
export function neighbors(
	slug: string,
	locale: Locale = baseLocale
): { previous: DocPage | null; next: DocPage | null } {
	const { sequence } = tree(locale);
	const index = sequence.findIndex((page) => page.slug === slug);
	return {
		previous: index > 0 ? sequence[index - 1] : null,
		next: index >= 0 && index < sequence.length - 1 ? sequence[index + 1] : null
	};
}
