// 把主仓库的用户文档（docs/user）同步到本仓库，供文档页渲染。
//
// 来源按这个顺序决定：
//   1. 环境变量 QINGJIAN_DOCS_SOURCE：`git` 强制从 git 拉；其他值当作本地目录路径。
//   2. 在 CI 里（CI=true）默认从 git 拉。
//   3. 本地开发：相邻目录 ../ime/docs/user（主仓库）存在就直接拷它，改文档不用提交就能预览。
//   4. 都没有就从 git 拉。
//
// 从 git 拉是稀疏浅克隆，只取 docs/user：
//   QINGJIAN_DOCS_REPO   仓库地址，缺省 https://github.com/qingjian-team/qingjian.git
//   QINGJIAN_DOCS_REF    分支、标签或提交号；缺省是 src/content/upstream.json 里记的主仓库提交（主仓库 workflow 发版 /
//                        改文档时写进来的），没有就 main
//   QINGJIAN_DOCS_TOKEN  只读令牌，仅在主仓库私有时需要（现在公开，留空即可）
//
// 产物（都在 .gitignore 里）：
//   src/content/docs/     所有 .md，目录结构原样
//   static/docs-assets/   .md 以外的文件（图片等），页面里相对路径的图片会改写到 /docs-assets/<同样的相对路径>

import {
	cpSync,
	existsSync,
	mkdirSync,
	mkdtempSync,
	readdirSync,
	readFileSync,
	rmSync,
	statSync
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DOCS_SUBDIR = 'docs/user';
const CONTENT_DIR = join(root, 'src/content/docs');
const ASSETS_DIR = join(root, 'static/docs-assets');
const LOCAL_SIBLING = resolve(root, '..', 'ime', DOCS_SUBDIR);

function log(message) {
	console.log(`[sync-docs] ${message}`);
}

/** 决定从哪里取文档，返回 { kind: 'local' | 'git', path? } */
function pickSource() {
	const override = process.env.QINGJIAN_DOCS_SOURCE;
	if (override === 'git') return { kind: 'git' };
	if (override) {
		const path = resolve(root, override);
		if (!existsSync(path)) throw new Error(`QINGJIAN_DOCS_SOURCE 指向的目录不存在：${path}`);
		return { kind: 'local', path };
	}
	if (process.env.CI) return { kind: 'git' };
	if (existsSync(LOCAL_SIBLING)) return { kind: 'local', path: LOCAL_SIBLING };
	return { kind: 'git' };
}

/** 主仓库 workflow 写进来的「文档对应哪个提交」（src/content/upstream.json 的 docs），没有或不像提交号就返回 undefined */
function upstreamDocsRef() {
	const file = join(root, 'src/content/upstream.json');
	if (!existsSync(file)) return undefined;
	try {
		const docs = JSON.parse(readFileSync(file, 'utf8')).docs;
		return typeof docs === 'string' && /^[0-9a-f]{40}$/.test(docs) ? docs : undefined;
	} catch {
		return undefined;
	}
}

/** 稀疏浅克隆主仓库，只取 docs/user，返回那个目录的路径（临时目录，用完删） */
function cloneDocs() {
	const repo = process.env.QINGJIAN_DOCS_REPO ?? 'https://github.com/qingjian-team/qingjian.git';
	const ref = process.env.QINGJIAN_DOCS_REF ?? upstreamDocsRef() ?? 'main';
	const token = process.env.QINGJIAN_DOCS_TOKEN;
	// 令牌塞进 URL 只在这个子进程里出现，日志里只打印去掉令牌的地址
	const url =
		token && repo.startsWith('https://')
			? repo.replace('https://', `https://x-access-token:${token}@`)
			: repo;
	const tmp = mkdtempSync(join(tmpdir(), 'qingjian-docs-'));
	log(`从 git 拉取 ${repo}@${ref} 的 ${DOCS_SUBDIR}`);
	const git = (args, cwd = tmp) =>
		execFileSync('git', args, { cwd, stdio: ['ignore', 'ignore', 'inherit'] });
	const repoDir = join(tmp, 'repo');
	if (/^[0-9a-f]{40}$/.test(ref)) {
		// 提交号不能当 --branch 用：空仓库里按号浅取（GitHub 允许取可达的任意提交）
		mkdirSync(repoDir);
		git(['init', '--quiet'], repoDir);
		git(['remote', 'add', 'origin', url], repoDir);
		git(['sparse-checkout', 'set', '--no-cone', DOCS_SUBDIR], repoDir);
		git(['fetch', '--quiet', '--depth', '1', '--filter=blob:none', 'origin', ref], repoDir);
		git(['checkout', '--quiet', 'FETCH_HEAD'], repoDir);
	} else {
		git([
			'clone',
			'--quiet',
			'--depth',
			'1',
			'--filter=blob:none',
			'--sparse',
			'--branch',
			ref,
			url,
			'repo'
		]);
		git(['sparse-checkout', 'set', '--no-cone', DOCS_SUBDIR], repoDir);
	}
	const path = join(tmp, 'repo', DOCS_SUBDIR);
	if (!existsSync(path)) throw new Error(`仓库里没有 ${DOCS_SUBDIR}`);
	return { path, cleanup: () => rmSync(tmp, { recursive: true, force: true }) };
}

/** 递归拷贝：.md 进 content，其余进 assets；README.md 是维护约定不渲染 */
function copyTree(source) {
	rmSync(CONTENT_DIR, { recursive: true, force: true });
	rmSync(ASSETS_DIR, { recursive: true, force: true });
	let pages = 0;
	let assets = 0;
	const walk = (dir) => {
		for (const name of readdirSync(dir)) {
			const full = join(dir, name);
			const rel = relative(source, full);
			if (statSync(full).isDirectory()) {
				walk(full);
			} else if (name.endsWith('.md')) {
				if (rel === 'README.md') continue;
				const target = join(CONTENT_DIR, rel);
				mkdirSync(dirname(target), { recursive: true });
				cpSync(full, target);
				pages += 1;
			} else if (!name.startsWith('.')) {
				const target = join(ASSETS_DIR, rel);
				mkdirSync(dirname(target), { recursive: true });
				cpSync(full, target);
				assets += 1;
			}
		}
	};
	mkdirSync(CONTENT_DIR, { recursive: true });
	walk(source);
	return { pages, assets };
}

const source = pickSource();
let cleanup = () => {};
let path;
if (source.kind === 'local') {
	path = source.path;
	log(`从本地目录读取 ${path}`);
} else {
	({ path, cleanup } = cloneDocs());
}
try {
	const { pages, assets } = copyTree(path);
	log(`同步完成：${pages} 页，${assets} 个附件 → src/content/docs, static/docs-assets`);
} finally {
	cleanup();
}
