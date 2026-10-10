// 把主题仓库（qingjian-themes）同步到本仓库，供主题页渲染。
//
// 来源按这个顺序决定（与 sync-docs.mjs 一致）：
//   1. 环境变量 QINGJIAN_THEMES_SOURCE：`git` 强制从 git 拉；其他值当作本地目录路径。
//   2. 在 CI 里（CI=true）默认从 git 拉。
//   3. 本地开发：相邻目录 ../qingjian-themes 存在就直接读它，改主题不用提交就能预览。
//   4. 都没有就从 git 拉。
//
// 从 git 拉是浅克隆：
//   QINGJIAN_THEMES_REPO   仓库地址，缺省 https://github.com/qingjian-team/qingjian-themes.git
//   QINGJIAN_THEMES_REF    分支或标签，缺省 main
//
// 产物（都在 .gitignore 里）：
//   src/content/themes.json            主题列表（themes/ 与 examples/ 下的全部主题）
//   src/content/themes/<id>.md         各主题的 README
//   static/themes-assets/<id>/         preview/ 下的截图与 <id>.zip（主题文件夹，不含 preview/）
// 读不进来的主题跳过并警告；规则由主题仓库的 tools/check.py 把关，这里不重复校验。

import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	statSync,
	writeFileSync,
	cpSync
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { deflateRawSync } from 'node:zlib';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const INDEX_FILE = join(root, 'src/content/themes.json');
const README_DIR = join(root, 'src/content/themes');
const ASSETS_DIR = join(root, 'static/themes-assets');
const LOCAL_SIBLING = resolve(root, '..', 'qingjian-themes');
const REPO =
	process.env.QINGJIAN_THEMES_REPO ?? 'https://github.com/qingjian-team/qingjian-themes.git';
const REF = process.env.QINGJIAN_THEMES_REF ?? 'main';
/** 详情页「查看源文件」链到 GitHub 上的这个分支 */
const BROWSE = 'https://github.com/qingjian-team/qingjian-themes/tree/main';

function log(message) {
	console.log(`[sync-themes] ${message}`);
}

function pickSource() {
	const override = process.env.QINGJIAN_THEMES_SOURCE;
	if (override === 'git') return { kind: 'git' };
	if (override) {
		const path = resolve(root, override);
		if (!existsSync(path)) throw new Error(`QINGJIAN_THEMES_SOURCE 指向的目录不存在：${path}`);
		return { kind: 'local', path };
	}
	if (process.env.CI) return { kind: 'git' };
	if (existsSync(LOCAL_SIBLING)) return { kind: 'local', path: LOCAL_SIBLING };
	return { kind: 'git' };
}

function cloneThemes() {
	const tmp = mkdtempSync(join(tmpdir(), 'qingjian-themes-'));
	log(`从 git 拉取 ${REPO}@${REF}`);
	execFileSync('git', ['clone', '--quiet', '--depth', '1', '--branch', REF, REPO, 'repo'], {
		cwd: tmp,
		stdio: ['ignore', 'ignore', 'inherit']
	});
	return { path: join(tmp, 'repo'), cleanup: () => rmSync(tmp, { recursive: true, force: true }) };
}

/** 去掉 // 与 /* *\/ 注释和尾逗号（字符串里的不动），与主题仓库 tools/check.py 的 strip_jsonc 相同 */
function stripJsonc(text) {
	let out = '';
	for (let i = 0; i < text.length;) {
		if (text[i] === '"') {
			let j = i + 1;
			while (j < text.length && text[j] !== '"') j += text[j] === '\\' ? 2 : 1;
			out += text.slice(i, j + 1);
			i = j + 1;
		} else if (text.startsWith('//', i)) {
			const end = text.indexOf('\n', i);
			i = end < 0 ? text.length : end;
		} else if (text.startsWith('/*', i)) {
			const end = text.indexOf('*/', i + 2);
			i = end < 0 ? text.length : end + 2;
		} else {
			out += text[i++];
		}
	}
	return out.replace(/,(\s*[}\]])/g, '$1');
}

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
	let c = n;
	for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
	return c >>> 0;
});

function crc32(buffer) {
	let crc = 0xffffffff;
	for (const byte of buffer) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8);
	return (crc ^ 0xffffffff) >>> 0;
}

/** 把 files（[zip 里的路径, 内容]）写成 zip：deflate 压缩，时间戳固定，同样的内容每次产出同样的字节 */
function zip(files) {
	const locals = [];
	const centrals = [];
	let offset = 0;
	for (const [name, data] of files) {
		const path = Buffer.from(name, 'utf8');
		const packed = deflateRawSync(data);
		const crc = crc32(data);
		// 版本 20、UTF-8 文件名（标志位 11）、deflate、DOS 时间 1980-01-01
		const common = [20, 0x0800, 8, 0, 0x21, crc, packed.length, data.length, path.length];
		const local = Buffer.alloc(30);
		local.writeUInt32LE(0x04034b50, 0);
		[4, 6, 8, 10, 12].forEach((at, i) => local.writeUInt16LE(common[i], at));
		local.writeUInt32LE(crc, 14);
		local.writeUInt32LE(packed.length, 18);
		local.writeUInt32LE(data.length, 22);
		local.writeUInt16LE(path.length, 26);
		locals.push(local, path, packed);
		const central = Buffer.alloc(46);
		central.writeUInt32LE(0x02014b50, 0);
		central.writeUInt16LE(20, 4);
		[6, 8, 10, 12, 14].forEach((at, i) => central.writeUInt16LE(common[i], at));
		central.writeUInt32LE(crc, 16);
		central.writeUInt32LE(packed.length, 20);
		central.writeUInt32LE(data.length, 24);
		central.writeUInt16LE(path.length, 28);
		central.writeUInt32LE(offset, 42);
		centrals.push(central, path);
		offset += 30 + path.length + packed.length;
	}
	const directory = Buffer.concat(centrals);
	const end = Buffer.alloc(22);
	end.writeUInt32LE(0x06054b50, 0);
	end.writeUInt16LE(files.length, 8);
	end.writeUInt16LE(files.length, 10);
	end.writeUInt32LE(directory.length, 12);
	end.writeUInt32LE(offset, 16);
	return Buffer.concat([...locals, directory, end]);
}

/** 主题文件夹里除 preview/ 以外的文件，路径带上 <id>/ 前缀（解压出来就是能放进 themes/ 的文件夹） */
function themeFiles(dir, id) {
	const files = [];
	const walk = (current) => {
		for (const name of readdirSync(current).sort()) {
			if (name.startsWith('.')) continue;
			const full = join(current, name);
			const rel = relative(dir, full);
			if (rel === 'preview') continue;
			if (statSync(full).isDirectory()) walk(full);
			else files.push([`${id}/${rel.split('\\').join('/')}`, readFileSync(full)]);
		}
	};
	walk(dir);
	return files;
}

/** 截图顺序：竖排、横排、深色竖排，然后按文件名（01-、02-…） */
const SCREENSHOT_ORDER = ['vertical.png', 'horizontal.png', 'vertical-dark.png'];

function readTheme(dir, example) {
	const id = dir.split(/[/\\]/).at(-1);
	const meta = JSON.parse(stripJsonc(readFileSync(join(dir, 'theme.json'), 'utf8'))).meta ?? {};
	if (meta.id !== id) throw new Error(`meta.id（${meta.id}）与目录名不同`);
	const previewDir = join(dir, 'preview');
	const previews = existsSync(previewDir)
		? readdirSync(previewDir).filter((f) => f.endsWith('.png'))
		: [];
	const rank = (name) => {
		const at = SCREENSHOT_ORDER.indexOf(name);
		return at < 0 ? SCREENSHOT_ORDER.length : at;
	};
	const screenshots = previews
		.filter((name) => name !== 'cover.png')
		.sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));

	const assets = join(ASSETS_DIR, id);
	mkdirSync(assets, { recursive: true });
	for (const name of previews) cpSync(join(previewDir, name), join(assets, name));
	writeFileSync(join(assets, `${id}.zip`), zip(themeFiles(dir, id)));
	const readme = join(dir, 'README.md');
	if (existsSync(readme)) cpSync(readme, join(README_DIR, `${id}.md`));

	const base = `/themes-assets/${id}`;
	const folder = example ? 'examples' : 'themes';
	return {
		id,
		name: meta.name ?? id,
		author: meta.author ?? '',
		license: meta.license ?? '',
		description: meta.description ?? '',
		version: meta.version ?? '',
		tags: Array.isArray(meta.tags) ? meta.tags : [],
		appearance: meta.appearance ?? null,
		example,
		cover: previews.includes('cover.png') ? `${base}/cover.png` : null,
		screenshots: screenshots.map((name) => ({ src: `${base}/${name}`, name })),
		download: example ? null : `${base}/${id}.zip`,
		source: `${BROWSE}/${folder}/${id}`
	};
}

function sync(source) {
	rmSync(README_DIR, { recursive: true, force: true });
	rmSync(ASSETS_DIR, { recursive: true, force: true });
	mkdirSync(README_DIR, { recursive: true });
	const themes = [];
	for (const [folder, example] of [
		['themes', false],
		['examples', true]
	]) {
		const parent = join(source, folder);
		if (!existsSync(parent)) continue;
		for (const name of readdirSync(parent).sort()) {
			const dir = join(parent, name);
			if (!statSync(dir).isDirectory() || !existsSync(join(dir, 'theme.json'))) continue;
			try {
				themes.push(readTheme(dir, example));
			} catch (error) {
				log(`跳过 ${folder}/${name}：${error.message}`);
			}
		}
	}
	mkdirSync(dirname(INDEX_FILE), { recursive: true });
	writeFileSync(INDEX_FILE, `${JSON.stringify(themes, null, '\t')}\n`);
	return themes.length;
}

const source = pickSource();
let cleanup = () => {};
let path;
if (source.kind === 'local') {
	path = source.path;
	log(`从本地目录读取 ${path}`);
} else {
	({ path, cleanup } = cloneThemes());
}
try {
	const count = sync(path);
	log(`同步完成：${count} 个主题 → src/content/themes.json, static/themes-assets`);
} finally {
	cleanup();
}
