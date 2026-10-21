import BookOpenIcon from 'phosphor-svelte/lib/BookOpenIcon';
import BrainIcon from 'phosphor-svelte/lib/BrainIcon';
import ChartBarIcon from 'phosphor-svelte/lib/ChartBarIcon';
import CloudIcon from 'phosphor-svelte/lib/CloudIcon';
import HighlighterIcon from 'phosphor-svelte/lib/HighlighterIcon';
import KeyboardIcon from 'phosphor-svelte/lib/KeyboardIcon';
import LeafIcon from 'phosphor-svelte/lib/LeafIcon';
import ListIcon from 'phosphor-svelte/lib/ListIcon';
import TextAaIcon from 'phosphor-svelte/lib/TextAaIcon';
import TranslateIcon from 'phosphor-svelte/lib/TranslateIcon';
import UserIcon from 'phosphor-svelte/lib/UserIcon';
import { m } from '$lib/paraglide/messages';

/** phosphor-svelte 图标组件类型，从任一图标推导 */
export type PhosphorIcon = typeof LeafIcon;

/** 文案是消息函数：渲染时调用才拿得到当前请求的语言，模块加载时调用会定死成一种语言 */
export type Text = () => string;

export type Entry = {
	icon: PhosphorIcon;
	title: Text;
	desc: Text;
};

/** 导航项：一项对应一个真实页面，path 交给 resolve() 解析 */
export const navLinks = [
	{ label: m.nav_home, path: '/' },
	{ label: m.nav_docs, path: '/docs' },
	{ label: m.nav_themes, path: '/themes' },
	{ label: m.nav_download, path: '/download' },
	{ label: m.nav_privacy, path: '/privacy' },
	{ label: m.nav_about, path: '/about' }
] as const;

/** 导航项是否对应当前页：首页只认根路径，其他项连同它下面的子页（/docs/xxx 也算在「文档」里）；pathname 是去掉语言前缀的 */
export function isCurrentPath(pathname: string, path: string): boolean {
	if (path === '/') return pathname === '/';
	return pathname === path || pathname.startsWith(`${path}/`);
}

/** 首页四个卖点条 */
export const benefits: Entry[] = [
	{ icon: LeafIcon, title: m.benefit_local_title, desc: m.benefit_local_desc },
	{ icon: TranslateIcon, title: m.benefit_gloss_title, desc: m.benefit_gloss_desc },
	{ icon: HighlighterIcon, title: m.benefit_fresh_title, desc: m.benefit_fresh_desc },
	{ icon: UserIcon, title: m.benefit_better_title, desc: m.benefit_better_desc }
];

/** 首页功能卡片 */
export const features: Entry[] = [
	{ icon: KeyboardIcon, title: m.feature_input_title, desc: m.feature_input_desc },
	{ icon: TranslateIcon, title: m.feature_gloss_title, desc: m.feature_gloss_desc },
	{ icon: BrainIcon, title: m.feature_personal_title, desc: m.feature_personal_desc },
	{ icon: CloudIcon, title: m.feature_cloud_title, desc: m.feature_cloud_desc }
];

/** 首页「不打算做什么」 */
export const nonGoals: Text[] = [
	m.nongoal_languages,
	m.nongoal_quiz,
	m.nongoal_force,
	m.nongoal_ui,
	m.nongoal_speed
];

/**
 * 首页候选示例：敲 kaifa 时的前五个候选，CLI 对英语 / 日语两种学习语言的真实输出。
 * fresh 标出画成橙色的生词那一行。
 */
export const exampleCandidates: Record<
	'en' | 'ja',
	{ label: Text; rows: { word: string; gloss: string; fresh?: boolean }[] }
> = {
	en: {
		label: m.home_example_en,
		rows: [
			{ word: '开发', gloss: 'v. develop · v. exploit' },
			{ word: '开放', gloss: 'v. open · v. liberalize' },
			{ word: '开饭', gloss: 'v. serve meal', fresh: true },
			{ word: '开方', gloss: 'v. extract root' },
			{ word: '开发者', gloss: 'n. developer' }
		]
	},
	ja: {
		label: m.home_example_ja,
		rows: [
			{ word: '开发', gloss: 'v. 開発(かいはつ)する' },
			{ word: '开放', gloss: 'v. 開放(かいほう)する' },
			{ word: '开饭', gloss: 'v. 食事(しょくじ)を始(はじ)める', fresh: true },
			{ word: '开方', gloss: 'v. 開平(かいへい)する' },
			{ word: '开发者', gloss: 'n. 開発者(かいはつしゃ)' }
		]
	}
};

/** 关于页的引擎流程，每格两行说明 */
export const engineFlow: { icon: PhosphorIcon; title: Text; lines: [Text, Text] }[] = [
	{ icon: TextAaIcon, title: m.flow_segment_title, lines: [m.flow_segment_1, m.flow_segment_2] },
	{ icon: BookOpenIcon, title: m.flow_lookup_title, lines: [m.flow_lookup_1, m.flow_lookup_2] },
	{ icon: ListIcon, title: m.flow_sentence_title, lines: [m.flow_sentence_1, m.flow_sentence_2] },
	{ icon: ChartBarIcon, title: m.flow_rank_title, lines: [m.flow_rank_1, m.flow_rank_2] },
	{ icon: TranslateIcon, title: m.flow_gloss_title, lines: [m.flow_gloss_1, m.flow_gloss_2] }
];
