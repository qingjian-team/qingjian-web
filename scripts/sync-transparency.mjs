// 公开说明页（/transparency）的内容：构建时从私有仓库拉取，本仓库不存任何正文、图片或事件名称。
// 一个私有仓库一件事；拉不到任何一件就没有这一页，页脚也不出现入口。
// 要撤下某一件：从构建环境的仓库列表里去掉它（或删掉私有仓库），再构建一次。
//
// 来源（二选一，都没有就不生成）：
//   QINGJIAN_TRANSPARENCY_SOURCES  本地目录，逗号分隔，本地预览用，例如 ../某个私有仓库的目录
//   QINGJIAN_TRANSPARENCY_REPOS    GitHub 仓库 owner/name，逗号分隔，配合 QINGJIAN_TRANSPARENCY_TOKEN（这些仓库的只读令牌）
//
// 每个私有仓库根下要有 transparency.json：
//   {
//     "slug": "地址里的名字", "title": "列表里的标题", "date": "YYYY-MM-DD", "summary": "列表里的一句话",
//     "docs": [{ "file": "说明.md", "slug": "" }, { "file": "完整记录.md", "slug": "record" }],
//     "links": { "正文里提到另一份文档的原文": "那份文档的 slug" },
//     "assets": "压缩好的图片目录（与正文里 publish/ 下的路径一一对应，扩展名 .webp）"
//   }
// 只拉 transparency.json、docs 里列的文件和 assets 目录；私有仓库里的其他东西不会被取出来。
//
// 产物（都在 .gitignore 里）：
//   src/content/transparency/index.json        各件事的标题、日期、摘要与文档列表，按日期从新到旧
//   src/content/transparency/<slug>/<doc>.md   正文，doc 为 index（slug 为空的那份）或文档的 slug
//   static/transparency-assets/<slug>/         图片；正文里的 publish/<路径>.png 改写成 /transparency-assets/<slug>/<路径>.webp

import {
	cpSync,
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT_DIR = join(root, 'src/content/transparency');
const ASSETS_DIR = join(root, 'static/transparency-assets');
const MANIFEST = 'transparency.json';

function log(message) {
	console.log(`[sync-transparency] ${message}`);
}

function list(value) {
	return (value ?? '')
		.split(',')
		.map((item) => item.trim())
		.filter(Boolean);
}

/** 先只取 transparency.json，再按它列的文件补齐，私有仓库里别的东西不落地 */
function cloneRepo(name, token) {
	const tmp = mkdtempSync(join(tmpdir(), 'qingjian-transparency-'));
	const repoDir = join(tmp, 'repo');
	// 令牌塞进 URL 只在这个子进程里出现，日志里只打印仓库名
	const url = `https://x-access-token:${token}@github.com/${name}.git`;
	const git = (args, cwd = tmp) =>
		execFileSync('git', args, { cwd, stdio: ['ignore', 'ignore', 'inherit'] });
	log(`从 git 拉取 ${name}`);
	git(['clone', '--quiet', '--depth', '1', '--filter=blob:none', '--sparse', url, 'repo']);
	git(['sparse-checkout', 'set', '--no-cone', MANIFEST], repoDir);
	const manifest = readManifest(repoDir);
	git(
		[
			'sparse-checkout',
			'set',
			'--no-cone',
			MANIFEST,
			...manifest.docs.map((doc) => doc.file),
			`${manifest.assets}/`
		],
		repoDir
	);
	return { path: repoDir, cleanup: () => rmSync(tmp, { recursive: true, force: true }) };
}

function readManifest(dir) {
	const file = join(dir, MANIFEST);
	if (!existsSync(file)) throw new Error(`${dir} 里没有 ${MANIFEST}`);
	const manifest = JSON.parse(readFileSync(file, 'utf8'));
	for (const key of ['slug', 'title', 'date', 'summary', 'docs', 'assets']) {
		if (!manifest[key]) throw new Error(`${MANIFEST} 缺 ${key}`);
	}
	if (!/^[a-z0-9-]+$/.test(manifest.slug))
		throw new Error(`slug 只能用小写字母、数字和连字符：${manifest.slug}`);
	return manifest;
}

/** 图片指向压缩好的 WebP；正文提到另一份文档的地方改成站内链接 */
function rewrite(markdown, manifest) {
	const base = `/transparency/${manifest.slug}`;
	let out = markdown.replace(
		/\]\(publish\/([^)]+)\.(png|jpe?g)\)/g,
		`](/transparency-assets/${manifest.slug}/$1.webp)`
	);
	for (const [text, slug] of Object.entries(manifest.links ?? {})) {
		out = out.replaceAll(text, `[${text}](${slug ? `${base}/${slug}` : base})`);
	}
	return out;
}

/** 把一件事写进产物，返回列表里的那一项 */
function syncOne(dir) {
	const manifest = readManifest(dir);
	const target = join(CONTENT_DIR, manifest.slug);
	mkdirSync(target, { recursive: true });
	const docs = [];
	for (const doc of manifest.docs) {
		const file = join(dir, doc.file);
		if (!existsSync(file)) throw new Error(`${manifest.slug} 里没有 ${doc.file}`);
		const body = rewrite(readFileSync(file, 'utf8'), manifest);
		writeFileSync(join(target, `${doc.slug || 'index'}.md`), body);
		const title = /^#\s+(.+)$/m.exec(body)?.[1].trim() ?? doc.file;
		docs.push({ slug: doc.slug, title });
	}
	const assets = join(dir, manifest.assets);
	if (existsSync(assets)) cpSync(assets, join(ASSETS_DIR, manifest.slug), { recursive: true });
	return {
		slug: manifest.slug,
		title: manifest.title,
		date: manifest.date,
		summary: manifest.summary,
		docs
	};
}

rmSync(CONTENT_DIR, { recursive: true, force: true });
rmSync(ASSETS_DIR, { recursive: true, force: true });
mkdirSync(CONTENT_DIR, { recursive: true });

const sources = [];
for (const dir of list(process.env.QINGJIAN_TRANSPARENCY_SOURCES)) {
	const path = resolve(root, dir);
	if (!existsSync(path)) throw new Error(`QINGJIAN_TRANSPARENCY_SOURCES 里的目录不存在：${path}`);
	log(`从本地目录读取 ${path}`);
	sources.push({ path, cleanup: () => {} });
}
const repos = list(process.env.QINGJIAN_TRANSPARENCY_REPOS);
if (repos.length) {
	const token = process.env.QINGJIAN_TRANSPARENCY_TOKEN;
	if (!token)
		throw new Error('设了 QINGJIAN_TRANSPARENCY_REPOS 但没有 QINGJIAN_TRANSPARENCY_TOKEN');
	for (const name of repos) sources.push(cloneRepo(name, token));
}

const entries = [];
try {
	for (const source of sources) entries.push(syncOne(source.path));
} finally {
	for (const source of sources) source.cleanup();
}
entries.sort((a, b) => b.date.localeCompare(a.date));
writeFileSync(join(CONTENT_DIR, 'index.json'), `${JSON.stringify(entries, null, '\t')}\n`);
log(entries.length ? `同步完成：${entries.length} 件` : '没有来源，不生成公开说明页');
