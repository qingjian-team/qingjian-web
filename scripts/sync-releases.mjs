// 把主仓库发版时生成的 releases.json（版本、更新日志、各平台安装包地址与 sha256）拉到本地，供下载页渲染。
//
// 来源：
//   QINGJIAN_RELEASES_SOURCE  一个 URL 或本地文件路径；缺省是主仓库最新 Release 上的
//                             https://github.com/qingjian-team/qingjian/releases/latest/download/releases.json
//
// 下载优先用 curl（会走 shell 的 https_proxy，超时 20 秒），没有 curl 再用 Node 的 fetch（不认代理环境变量）。
// 本地开发（非 CI）时，一小时内拉过就直接用本地文件，不每次联网。
//
// 产物（在 .gitignore 里）：src/content/releases.json
// 拉不到时：本地已有上一次的产物就沿用并警告（离线开发），没有就报错（CI 不应该带着旧数据发布）。
//
// 本地开发（非 CI）还会把相邻主仓库的 CHANGELOG.md 合进来预览，与 sync-docs 拉本地文档一个道理：
// 已发布的版本用本地条目覆盖（改措辞立刻能看），还没发布的节（日期写「未发布」）加成没有安装包的预览条目。
// QINGJIAN_CHANGELOG_SOURCE 可指定别的路径；CI 不做，线上只认发版时生成的 releases.json。

import {
	copyFileSync,
	existsSync,
	mkdirSync,
	readFileSync,
	statSync,
	writeFileSync
} from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TARGET = join(root, 'src/content/releases.json');
const DEFAULT_URL =
	'https://github.com/qingjian-team/qingjian/releases/latest/download/releases.json';

function log(message) {
	console.log(`[sync-releases] ${message}`);
}

/** 结构核对：只看下载页用到的字段，缺了就当拉到的不是 releases.json */
function validate(feed) {
	if (!Array.isArray(feed?.releases) || feed.releases.length === 0) {
		throw new Error('releases.json 里没有 releases 数组');
	}
	for (const release of feed.releases) {
		for (const key of ['version', 'date', 'channel', 'notes', 'assets']) {
			if (!(key in release)) throw new Error(`版本 ${release.version ?? '?'} 缺少字段 ${key}`);
		}
	}
}

const FRESH_MS = 60 * 60 * 1000;
const TIMEOUT_MS = 20_000;

/** 下载 URL 的正文：curl 优先，退回 fetch */
async function download(url) {
	try {
		return execFileSync('curl', ['-fsSL', '--max-time', String(TIMEOUT_MS / 1000), url], {
			encoding: 'utf8',
			stdio: ['ignore', 'pipe', 'inherit']
		});
	} catch (error) {
		if (error.code !== 'ENOENT') throw error;
	}
	const response = await fetch(url, {
		redirect: 'follow',
		signal: AbortSignal.timeout(TIMEOUT_MS)
	});
	if (!response.ok) throw new Error(`HTTP ${response.status}`);
	return response.text();
}

const source = process.env.QINGJIAN_RELEASES_SOURCE ?? DEFAULT_URL;
mkdirSync(dirname(TARGET), { recursive: true });
const isUrl = /^https?:\/\//.test(source);
if (
	isUrl &&
	!process.env.CI &&
	existsSync(TARGET) &&
	Date.now() - statSync(TARGET).mtimeMs < FRESH_MS
) {
	log('本地 src/content/releases.json 一小时内拉过，直接用；要强制刷新就删掉它');
} else {
	try {
		if (isUrl) {
			log(`从 ${source} 拉取`);
			const text = await download(source);
			validate(JSON.parse(text));
			writeFileSync(TARGET, text);
		} else {
			const path = resolve(root, source);
			log(`从本地文件读取 ${path}`);
			validate(JSON.parse(readFileSync(path, 'utf8')));
			copyFileSync(path, TARGET);
		}
	} catch (error) {
		if (existsSync(TARGET)) {
			log(`拉取失败（${error.message}），沿用本地已有的 src/content/releases.json`);
		} else {
			throw error;
		}
	}
}
const feed = JSON.parse(readFileSync(TARGET, 'utf8'));

/** 解析 CHANGELOG.md：`## 版本 · 日期或未发布 · 渠道` 一节，`- ` 一条；返回 [{version, date, channel, notes}]，日期未发布为空串 */
function parseChangelog(text) {
	const sections = [];
	let current = null;
	for (const raw of text.split('\n')) {
		const line = raw.trimEnd();
		const heading = line.match(/^##\s+(\S+)\s*·\s*(\S+)\s*·\s*(\S+)\s*$/);
		if (heading) {
			const [, version, date, channel] = heading;
			current = { version, date: /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : '', channel, notes: [] };
			sections.push(current);
		} else if (current && line.startsWith('- ')) {
			current.notes.push(line.slice(2).trim());
		}
	}
	return sections;
}

const changelog = process.env.QINGJIAN_CHANGELOG_SOURCE ?? join(root, '..', 'ime', 'CHANGELOG.md');
if (!process.env.CI && existsSync(changelog)) {
	// 上一次合进去的预览条目先丢掉，按现在的 CHANGELOG 重合，删掉的节不会残留
	feed.releases = feed.releases.filter((release) => !release.preview);
	const sections = parseChangelog(readFileSync(changelog, 'utf8'));
	let replaced = 0;
	let added = 0;
	for (const section of sections) {
		const released = feed.releases.find((release) => release.version === section.version);
		if (released) {
			released.notes = section.notes;
			replaced++;
		} else {
			feed.releases.push({
				version: section.version,
				date: section.date,
				channel: section.channel,
				notes: section.notes,
				commit: '',
				built_at: '',
				toolchain: '',
				assets: [],
				preview: true
			});
			added++;
		}
	}
	writeFileSync(TARGET, `${JSON.stringify(feed, null, 2)}\n`);
	log(
		`本地预览：合入 ${changelog}，覆盖 ${replaced} 个已发布版本的更新日志，加 ${added} 个未发布版本`
	);
}
log(`${feed.releases.length} 个版本，最新 ${feed.latest} → src/content/releases.json`);
