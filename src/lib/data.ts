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

/** phosphor-svelte 图标组件类型，从任一图标推导 */
export type PhosphorIcon = typeof LeafIcon;

export type Entry = {
	icon: PhosphorIcon;
	title: string;
	desc: string;
};

/** 导航项：一项对应一个真实页面，path 交给 resolve() 解析 */
export const navLinks = [
	{ label: '首页', path: '/' },
	{ label: '文档', path: '/docs' },
	{ label: '下载', path: '/download' },
	{ label: '隐私', path: '/privacy' },
	{ label: '关于', path: '/about' }
] as const;

/** 导航项是否对应当前页：首页只认根路径，其他项连同它下面的子页（/docs/xxx 也算在「文档」里） */
export function isCurrentPath(pathname: string, path: string): boolean {
	if (path === '/') return pathname === '/';
	return pathname === path || pathname.startsWith(`${path}/`);
}

/** 首页四个卖点条 */
export const benefits: Entry[] = [
	{ icon: LeafIcon, title: '全在本机', desc: '拼音、词库、学习、释义都不联网' },
	{ icon: TranslateIcon, title: '候选旁的译词', desc: '词性 + 英语或日语，一次一种' },
	{ icon: HighlighterIcon, title: '生词标橙', desc: '没见过几次的译词画橙色，看熟就消失' },
	{ icon: UserIcon, title: '越用越顺', desc: '词频、个人 n-gram、敲错表都在本机学' }
];

/** 首页功能卡片 */
export const features: Entry[] = [
	{
		icon: KeyboardIcon,
		title: '先是一个好用的输入法',
		desc: '整句转换、简拼、拼写纠错、模糊音、双拼、英文模式、emoji。输入效率不为学习让路。'
	},
	{
		icon: TranslateIcon,
		title: '词性 + 译词，一个候选一条',
		desc: '随包释义表覆盖整个词库，英语或日语可选，日语按汉字注假名。不并列多种语言。'
	},
	{
		icon: BrainIcon,
		title: '越用越像自己',
		desc: '选过的词、连着选的词序列、接受过的敲错纠正都在本机记下来，整句转换与排序据此调整。'
	},
	{
		icon: CloudIcon,
		title: '可选的云联想，缺省关',
		desc: '打开后组句时向你自己填的 AI 服务商要词与整句补全，还能问字、翻译选中文字。'
	}
];

/** 首页「不打算做什么」 */
export const nonGoals = [
	'在候选框塞入五六种语言',
	'每输入几个词就弹出测试',
	'强制用户背单词',
	'用复杂 UI 干扰正常输入',
	'为了学习功能牺牲输入效率'
];

/**
 * 首页候选示例：敲 kaifa 时的前五个候选，CLI 对英语 / 日语两种学习语言的真实输出。
 * fresh 标出画成橙色的生词那一行。
 */
export const exampleCandidates: Record<
	'en' | 'ja',
	{ label: string; rows: { word: string; gloss: string; fresh?: boolean }[] }
> = {
	en: {
		label: '学英语',
		rows: [
			{ word: '开发', gloss: 'v. develop · v. exploit' },
			{ word: '开放', gloss: 'v. open · v. liberalize' },
			{ word: '开饭', gloss: 'v. serve meal', fresh: true },
			{ word: '开方', gloss: 'v. extract root' },
			{ word: '开发者', gloss: 'n. developer' }
		]
	},
	ja: {
		label: '学日语',
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
export const engineFlow: { icon: PhosphorIcon; title: string; lines: [string, string] }[] = [
	{ icon: TextAaIcon, title: '拼音切分', lines: ['全拼 / 简拼 / 双拼', '模糊音与敲错纠正'] },
	{ icon: BookOpenIcon, title: '词库查询', lines: ['自建基础词库 8.7 万条', '随包领域词库 11 本'] },
	{ icon: ListIcon, title: '整句转换', lines: ['词图 + bigram Viterbi', '词图内带敲错边'] },
	{ icon: ChartBarIcon, title: '排序与学习', lines: ['个人 n-gram 插值', '选择次数、自动造词'] },
	{ icon: TranslateIcon, title: '释义标注', lines: ['本地释义表查词', '译词后补不阻塞'] }
];
