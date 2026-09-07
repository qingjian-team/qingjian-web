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
log(`${feed.releases.length} 个版本，最新 ${feed.latest} → src/content/releases.json`);
