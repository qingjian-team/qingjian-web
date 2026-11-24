const sources = import.meta.glob('/src/content/transparency/*/*.md', {
	query: '?raw',
	import: 'default',
	eager: true
}) as Record<string, string>;

/** 取一份文档：标题是第一行的一级标题，正文是其余部分；doc 为空取那件事的主文档，没有就返回 null */
export function transparencyDoc(
	entry: string,
	doc: string
): { title: string; body: string } | null {
	const raw = sources[`/src/content/transparency/${entry}/${doc || 'index'}.md`];
	if (raw === undefined) return null;
	const match = /^#\s+(.+)\n/.exec(raw);
	return match
		? { title: match[1].trim(), body: raw.slice(match[0].length) }
		: { title: entry, body: raw };
}
