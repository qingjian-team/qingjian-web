import index from '../content/themes.json';

/**
 * 主题内容层：`scripts/sync-themes.mjs` 从主题仓库同步来的列表与各主题 README。
 * 投稿主题在前（按名字），内置主题的源文件（examples/）排在后面。
 */

export type ThemeScreenshot = {
	src: string;

	/** 文件名：vertical.png / horizontal.png / vertical-dark.png / 01-xxx.png */
	name: string;
};

export type ThemeEntry = {
	id: string;

	name: string;

	author: string;

	/** SPDX 许可证标识 */
	license: string;

	/** 一句话介绍 */
	description: string;

	version: string;

	tags: string[];

	/** 锁定的外观；null 是浅色深色都有 */
	appearance: 'light' | 'dark' | null;

	/** 内置主题的源文件：青简自带，不提供下载 */
	example: boolean;

	cover: string | null;

	screenshots: ThemeScreenshot[];

	/** 主题文件夹的 zip；内置主题为 null */
	download: string | null;

	/** GitHub 上的主题文件夹 */
	source: string;
};

export const themes: ThemeEntry[] = (index as ThemeEntry[]).toSorted(
	(a, b) => Number(a.example) - Number(b.example) || a.name.localeCompare(b.name, 'zh')
);

export function findTheme(id: string): ThemeEntry | undefined {
	return themes.find((theme) => theme.id === id);
}

const readmes = import.meta.glob('/src/content/themes/*.md', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

/** 主题的 README 原文；只在服务端（预渲染时）用 */
export function themeReadme(id: string): string {
	return readmes[`/src/content/themes/${id}.md`] ?? '';
}

/** 截图的说明文字 */
export function screenshotLabel(name: string): string {
	if (name === 'vertical.png') return '竖排';
	if (name === 'horizontal.png') return '横排';
	if (name === 'vertical-dark.png') return '深色 · 竖排';
	return name.replace(/^\d{2}-/, '').replace(/\.png$/, '');
}

/** 外观的说明文字 */
export function appearanceLabel(appearance: ThemeEntry['appearance']): string {
	if (appearance === 'light') return '只有浅色';
	if (appearance === 'dark') return '只有深色';
	return '浅色与深色';
}
