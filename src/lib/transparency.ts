import index from '../content/transparency/index.json';

/**
 * 公开说明页的目录：`scripts/sync-transparency.mjs` 构建时从私有仓库拉来，一个仓库一件事，按日期从新到旧。
 * 没拉到任何一件时是空数组：列表页 404，页脚不出现入口。正文另在 transparency.server.ts 里按需读取。
 */
export type TransparencyEntry = {
	slug: string;
	title: string;
	date: string;
	summary: string;
	/** 这件事的文档；slug 为空的那份是 /transparency/<事件> 本身 */
	docs: { slug: string; title: string }[];
};

export const transparencyEntries: TransparencyEntry[] = index;
