// 公开说明页（/transparency）的内容：构建时从私有仓库拉取，本仓库不存任何正文、图片或事件名称。
// 一个私有仓库一件事；拉不到任何一件就没有这一页，页脚也不出现入口。
// 要撤下某一件：从构建环境的仓库列表里去掉它（或删掉私有仓库、撤销令牌），再构建一次；拉不到的会被跳过，不会让构建失败。
//
// 来源（二选一，都没有就不生成）：
//   QINGJIAN_TRANSPARENCY_SOURCES  本地目录，逗号分隔，本地预览用，例如 ../某个私有仓库的目录
//   QINGJIAN_TRANSPARENCY_REPOS    GitHub 仓库 owner/name，逗号分隔，配合 QINGJIAN_TRANSPARENCY_TOKEN
//                                  （fine-grained 令牌，只给这些仓库的 Contents 只读）；经 GitHub API 只下载需要的文件
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

/** 用 GitHub API 取一个文件的原始内容；出错只报状态码，不带令牌 */
async function githubRaw(name, token, path) {
	const response = await fetch(
		`https://api.github.com/repos/${name}/contents/${path.split('/').map(encodeURIComponent).join('/')}`,
		{
			headers: {
				Accept: 'application/vnd.github.raw+json',
				Authorization: `Bearer ${token}`,
				'User-Agent': 'qingjian-web-build',
				'X-GitHub-Api-Version': '2022-11-28'
			}
		}
	);
	if (!response.ok) throw new Error(`${path}：HTTP ${response.status}`);
	return Buffer.from(await response.arrayBuffer());
}

/** 先取 transparency.json，再按它列的文档和图片目录逐个下载；私有仓库里别的东西不落地 */
async function fetchRepo(name, token) {
	log(`从 GitHub 拉取 ${name}`);
	const tmp = mkdtempSync(join(tmpdir(), 'qingjian-transparency-'));
	const cleanup = () => rmSync(tmp, { recursive: true, force: true });
	try {
		const save = async (path) => {
			const target = join(tmp, path);
			mkdirSync(dirname(target), { recursive: true });
			writeFileSync(target, await githubRaw(name, token, path));
		};
		await save(MANIFEST);
		const manifest = readManifest(tmp);
		const tree = await githubJson(name, token, 'git/trees/HEAD?recursive=1');
		const prefix = `${manifest.assets}/`;
		const assets = tree.tree
			.filter((item) => item.type === 'blob' && item.path.startsWith(prefix))
			.map((item) => item.path);
		const files = [...manifest.docs.map((doc) => doc.file), ...assets];
		// 并发几个一起下，图片上百张时也不慢
		for (let i = 0; i < files.length; i += 8) {
			await Promise.all(files.slice(i, i + 8).map(save));
		}
		return { path: tmp, cleanup };
	} catch (error) {
		cleanup();
		throw error;
	}
}

async function githubJson(name, token, path) {
	const response = await fetch(`https://api.github.com/repos/${name}/${path}`, {
		headers: {
			Accept: 'application/vnd.github+json',
			Authorization: `Bearer ${token}`,
			'User-Agent': 'qingjian-web-build',
			'X-GitHub-Api-Version': '2022-11-28'
		}
	});
	if (!response.ok) throw new Error(`${path}：HTTP ${response.status}`);
	return response.json();
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
	for (const name of repos) {
		// 拉不到（令牌过期或被撤销、仓库删了）只跳过这一件，不让整站构建失败
		try {
			sources.push(await fetchRepo(name, token));
		} catch (error) {
			log(`拉取 ${name} 失败，跳过（${error instanceof Error ? error.message : '未知错误'}）`);
		}
	}
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
