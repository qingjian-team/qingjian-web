import {
	baseLocale,
	deLocalizeUrl,
	getLocale,
	localizeHref,
	locales,
	type Locale
} from '$lib/paraglide/runtime';

/**
 * 站点多语言的共用部分：语言名、hreflang / og:locale、站内地址的本地化，以及按浏览器语言猜该提示哪种语言。
 * 语言只由地址决定（简体中文不带前缀，其余 /en/、/zh-hant/ 等），不按浏览器语言自动跳转。
 */

export { baseLocale, locales, type Locale };

/** 语言切换器上的名字，用各自的语言写 */
export const localeNames: Record<Locale, string> = {
	'zh-Hans': '简体中文',
	'zh-Hant': '繁體中文',
	en: 'English',
	ja: '日本語',
	es: 'Español',
	vi: 'Tiếng Việt',
	de: 'Deutsch'
};

/** og:locale 要「语言_地区」的写法 */
export const ogLocales: Record<Locale, string> = {
	'zh-Hans': 'zh_CN',
	'zh-Hant': 'zh_TW',
	en: 'en_US',
	ja: 'ja_JP',
	es: 'es_ES',
	vi: 'vi_VN',
	de: 'de_DE'
};

/** 站内地址加上当前语言的前缀；path 是 resolve() 之后的不带语言的地址 */
export function localized(path: string, locale: Locale = getLocale()): string {
	return localizeHref(path, { locale });
}

/** 去掉语言前缀后的路径，给导航高亮、规范地址与切换语言用 */
export function plainPath(url: URL): string {
	return deLocalizeUrl(url).pathname;
}

/**
 * 浏览器语言列表里第一个能对上的站点语言：繁体地区（台湾、香港、澳门）给繁体，其余中文给简体，
 * 英日西越德各给各的；第一个是别的语言（法语、韩语……）就给英语。
 */
export function suggestedLocale(languages: readonly string[]): Locale {
	const first = languages[0]?.toLowerCase();
	if (!first) return baseLocale;
	if (first.startsWith('zh')) {
		return /^zh-(hant|tw|hk|mo)\b/.test(first) ? 'zh-Hant' : 'zh-Hans';
	}
	const language = first.split('-')[0];
	return (locales as readonly string[]).includes(language) ? (language as Locale) : 'en';
}
