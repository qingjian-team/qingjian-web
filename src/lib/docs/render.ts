import { Marked, type Tokens } from 'marked';

/** 页内目录的一项：正文里的二级标题 */
export type TocEntry = {
	id: string;
	text: string;
};

/** 标题的锚点 id：保留中文，空格换成连字符；文档里的 `#快捷键` 这类链接直接对得上 */
export function headingId(text: string): string {
	return text.trim().replace(/\s+/g, '-');
}

function escapeHtml(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

/** 去掉 Markdown 行内标记后的纯文本，给锚点与目录用 */
function plainText(tokens: Tokens.Generic[]): string {
	return tokens
		.map((token) =>
			'tokens' in token && token.tokens ? plainText(token.tokens) : (token.raw ?? '')
		)
		.join('')
		.replace(/[`*_]/g, '');
}

/**
 * 按键：文档里写在反引号里的按键名（`空格`、`⌥ + 1`、`Caps Lock`、`⌃⌥T`）渲染成键帽，
 * 符号用 macOS 菜单里那一套（⌘ ⌥ ⌃ ⇧ ⇪ ⌫ ⌦ ⎋ ⇥ ↩），系统字体自带，不用图标库。
 * 不像按键的反引号内容（`kubectl`、`Qingjian-<版本>.pkg`、`v1+2`）照旧当代码。
 */
type Key = { glyph?: string; label: string };

const NAMED_KEYS: Record<string, Key> = {
	空格: { label: '空格' },
	Space: { label: '空格' },
	回车: { glyph: '↩', label: '回车' },
	Enter: { glyph: '↩', label: '回车' },
	退格: { glyph: '⌫', label: '退格' },
	Delete: { glyph: '⌦', label: 'Delete' },
	Esc: { glyph: '⎋', label: 'Esc' },
	Tab: { glyph: '⇥', label: 'Tab' },
	Shift: { glyph: '⇧', label: 'Shift' },
	'Caps Lock': { glyph: '⇪', label: 'Caps Lock' },
	PageUp: { glyph: '⇞', label: 'PageUp' },
	PageDown: { glyph: '⇟', label: 'PageDown' },
	上: { glyph: '↑', label: '上' },
	下: { glyph: '↓', label: '下' },
	左: { glyph: '←', label: '左' },
	右: { glyph: '→', label: '右' },
	数字: { label: '数字' },
	字母: { label: '字母' }
};

const MODIFIERS: Record<string, string> = {
	'⌘': 'Command',
	'⌥': 'Option',
	'⌃': 'Control',
	'⇧': 'Shift',
	'⇪': 'Caps Lock'
};

/** 把一个反引号里的文本解析成按键序列；不是按键就返回 null */
export function parseKeys(text: string): Key[] | null {
	const parts = text.split(/\s*\+\s*/);
	if (parts.some((part) => part === '')) return null;
	const keys: Key[] = [];
	for (const part of parts) {
		if (NAMED_KEYS[part]) {
			keys.push(NAMED_KEYS[part]);
			continue;
		}
		// 修饰键符号串，后面可跟一个键：⇧⌥、⌃⌥T、⇧⌘G
		const combo = /^([⌘⌥⌃⇧⇪]+)([A-Za-z0-9])?$/.exec(part);
		if (combo) {
			for (const glyph of combo[1]) keys.push({ glyph, label: MODIFIERS[glyph] });
			if (combo[2]) keys.push({ label: combo[2].toUpperCase() });
			continue;
		}
		// 单个可见字符：数字、字母、`[` `]` `,` `.` `-` `'` `?` 这类
		if ([...part].length === 1 && /^[\x21-\x7e]$/.test(part)) {
			keys.push({ label: part });
			continue;
		}
		return null;
	}
	return keys.length ? keys : null;
}

function renderKeys(keys: Key[]): string {
	const caps = keys.map((key) => {
		const glyph = key.glyph ? `<span class="glyph" aria-hidden="true">${key.glyph}</span>` : '';
		return `<kbd>${glyph}${escapeHtml(key.label)}</kbd>`;
	});
	return `<span class="keys">${caps.join('<span class="plus" aria-hidden="true">+</span>')}</span>`;
}

/**
 * 把文档里的相对链接改写成站内地址：
 * - `../help/uninstall.md#锚点` → `/docs/help/uninstall#锚点`
 * - `install.md` → `/docs/<当前目录>/install`
 * - `index.md` 指向所在目录本身
 * 绝对地址、纯锚点、非 .md 的链接原样保留。
 */
export function rewriteLink(href: string, currentDir: string): string {
	if (/^(https?:|mailto:|#|\/)/.test(href)) return href;
	const [path, hash] = href.split('#');
	if (!path.endsWith('.md')) return href;
	const segments = currentDir ? currentDir.split('/') : [];
	for (const part of path.replace(/\.md$/, '').split('/')) {
		if (part === '..') segments.pop();
		else if (part !== '.' && part !== '') segments.push(part);
	}
	if (segments.at(-1) === 'index') segments.pop();
	const target = segments.length ? `/docs/${segments.join('/')}` : '/docs';
	return hash ? `${target}#${hash}` : target;
}

/** 相对路径的图片改到同步脚本放静态文件的地方 */
export function rewriteImage(src: string, currentDir: string): string {
	if (/^(https?:|data:|\/)/.test(src)) return src;
	const segments = currentDir ? currentDir.split('/') : [];
	for (const part of src.split('/')) {
		if (part === '..') segments.pop();
		else if (part !== '.' && part !== '') segments.push(part);
	}
	return `/docs-assets/${segments.join('/')}`;
}

/**
 * 渲染一页 Markdown。`currentDir` 是这页所在的目录（'' 是根），相对链接据此解析。
 * 返回 HTML 与二级标题目录。
 */
export function renderMarkdown(
	markdown: string,
	currentDir: string
): { html: string; toc: TocEntry[] } {
	const toc: TocEntry[] = [];
	const marked = new Marked({
		gfm: true,
		renderer: {
			heading({ tokens, depth }) {
				const text = plainText(tokens);
				const id = headingId(text);
				if (depth === 2) toc.push({ id, text });
				return `<h${depth} id="${id}">${this.parser.parseInline(tokens)}</h${depth}>\n`;
			},
			codespan({ text }) {
				const keys = parseKeys(text);
				return keys ? renderKeys(keys) : `<code>${escapeHtml(text)}</code>`;
			},
			link({ href, title, tokens }) {
				const target = rewriteLink(href, currentDir);
				const external = /^https?:/.test(target);
				const attrs = [
					`href="${target}"`,
					title ? `title="${escapeHtml(title)}"` : '',
					external ? 'target="_blank" rel="noopener"' : ''
				]
					.filter(Boolean)
					.join(' ');
				return `<a ${attrs}>${this.parser.parseInline(tokens)}</a>`;
			},
			image({ href, title, text }) {
				const src = rewriteImage(href, currentDir);
				return `<img src="${src}" alt="${escapeHtml(text)}"${title ? ` title="${escapeHtml(title)}"` : ''} loading="lazy" />`;
			},
			table(token) {
				// 表格包一层，窄屏可以横向滚动
				const header = `<tr>${token.header.map((cell) => `<th>${this.parser.parseInline(cell.tokens)}</th>`).join('')}</tr>`;
				const rows = token.rows
					.map(
						(row) =>
							`<tr>${row.map((cell) => `<td>${this.parser.parseInline(cell.tokens)}</td>`).join('')}</tr>`
					)
					.join('');
				return `<div class="table-wrap"><table><thead>${header}</thead><tbody>${rows}</tbody></table></div>\n`;
			}
		}
	});
	const html = marked.parse(markdown, { async: false }) as string;
	return { html, toc };
}
