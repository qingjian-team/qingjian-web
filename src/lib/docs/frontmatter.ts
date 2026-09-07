/** 一页文档的元信息，来自 Markdown 顶部的 frontmatter（见主仓库 docs/user/README.md 的约定） */
export type DocMeta = {
	/** 页面标题，也是侧栏里的名字 */
	title: string;

	/** 同级排序，小的在前 */
	order: number;

	/** 搜索引擎摘要与分享卡片用的一句话；分组的 index.md 可以没有 */
	description: string;
};

/**
 * 解析最简单的 frontmatter：`---` 包起来的 `key: value` 行。
 * 文档约定只用 title / order / description 三个键，不需要完整的 YAML。
 */
export function parseFrontmatter(source: string): { meta: DocMeta; body: string } {
	const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(source);
	const fields: Record<string, string> = {};
	if (match) {
		for (const line of match[1].split(/\r?\n/)) {
			const colon = line.indexOf(':');
			if (colon < 0) continue;
			const key = line.slice(0, colon).trim();
			let value = line.slice(colon + 1).trim();
			// 去掉 YAML 风格的引号
			if (/^(['"]).*\1$/.test(value)) value = value.slice(1, -1);
			fields[key] = value;
		}
	}
	const order = Number.parseInt(fields.order ?? '', 10);
	return {
		meta: {
			title: fields.title ?? '',
			order: Number.isNaN(order) ? 999 : order,
			description: fields.description ?? ''
		},
		body: match ? source.slice(match[0].length) : source
	};
}
