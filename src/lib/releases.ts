import AppleLogoIcon from 'phosphor-svelte/lib/AppleLogoIcon';
import LinuxLogoIcon from 'phosphor-svelte/lib/LinuxLogoIcon';
import WindowsLogoIcon from 'phosphor-svelte/lib/WindowsLogoIcon';
import type { PhosphorIcon } from '$lib/data';
import feed from '../content/releases.json';

export type PlatformId = 'macos' | 'windows' | 'linux';

/** 一个平台的静态信息；status 与主仓库 README「平台」一节一致 */
export type Platform = {
	id: PlatformId;
	name: string;
	icon: PhosphorIcon;
	/** 系统接入的输入法框架 */
	api: string;
	/** 最低系统要求；计划中的平台留空 */
	requirement: string;
	available: boolean;
};

export const platforms: Platform[] = [
	{
		id: 'macos',
		name: 'macOS',
		icon: AppleLogoIcon,
		api: 'Input Method Kit（IMK）',
		requirement: 'macOS 13 或更新',
		available: true
	},
	{
		id: 'windows',
		name: 'Windows',
		icon: WindowsLogoIcon,
		api: 'Text Services Framework（TSF）',
		requirement: '64 位 Windows 11',
		available: true
	},
	{
		id: 'linux',
		name: 'Linux',
		icon: LinuxLogoIcon,
		api: 'IBus / Fcitx',
		requirement: '',
		available: false
	}
];

/** 发布渠道，与主仓库 CHANGELOG.md 标题里的写法一致 */
export type Channel = 'alpha' | 'beta' | 'rc' | 'stable';

const CHANNEL_LABELS: Record<Channel, string> = {
	alpha: '内测版',
	beta: '测试版',
	rc: '候选版',
	stable: '正式版'
};

/** CPU 架构，从安装包文件名里认（`-arm64.pkg` / `-x86_64.pkg`） */
export type Arch = 'arm64' | 'x86_64';

/** 一个可下载的安装包 */
export type Asset = {
	platform: PlatformId;
	/** 芯片 / 架构说明，例如 Apple Silicon */
	arch: string;
	/** 架构标识，文件名里认不出时为 null */
	cpu: Arch | null;
	/** 文件名，也是按钮上的字 */
	file: string;
	url: string;
	/** 字节数 */
	size: number;
	/** 文件的 SHA-256，给用户核对下载是否完整、是否被改过 */
	sha256: string;
};

export type Release = {
	version: string;
	/** 发布日期，ISO 格式 */
	date: string;
	channel: Channel;
	/** 更新日志，一条一句 */
	notes: string[];
	/** 打包时的提交哈希（40 位） */
	commit: string;
	/** 打包时间，ISO 格式，UTC */
	builtAt: string;
	assets: Asset[];
};

/**
 * 数据来自主仓库发版时生成的 releases.json（`scripts/sync-releases.mjs` 在构建前拉到 src/content/），
 * 版本从新到旧；页面上的「当前版本」取第一条。发新版本不用改这里。
 */
export const releases: Release[] = feed.releases.map((release) => ({
	version: release.version,
	date: release.date,
	channel: asChannel(release.channel),
	notes: release.notes,
	commit: release.commit,
	builtAt: release.built_at,
	assets: release.assets.flatMap((asset) =>
		isPlatformId(asset.platform)
			? [
					{
						platform: asset.platform,
						arch: asset.arch,
						cpu: archOfFile(asset.file),
						file: asset.file,
						url: asset.url,
						size: asset.size,
						sha256: asset.sha256
					}
				]
			: []
	)
}));

export const latest = releases[0];

/**
 * 某个平台最新的一版：各平台版本号独立（macOS 0.1.1 与 Windows 0.1.0-alpha.1 各自发布），
 * 下载页主按钮按访问者的平台取有该平台安装包的最新版本，而不是全局最新。没有就为 null。
 */
export function latestFor(platform: PlatformId): Release | null {
	return releases.find((r) => r.assets.some((a) => a.platform === platform)) ?? null;
}

/** 首次打开没有正式签名时的放行方法，按平台 */
export const unsignedHints: Record<PlatformId, string> = {
	macos: '测试版没有 Apple 开发者签名，首次打开要到「系统设置 → 隐私与安全性」点「仍要打开」。',
	windows: '测试版没有代码签名，SmartScreen 拦截时点「更多信息 → 仍要运行」。',
	linux: ''
};

/**
 * 下载是否已公开。关着时下载页显示「即将开放」，只保留版本号、更新日志与平台一览，不列安装包；
 * 开着时主按钮与「全部版本」表都从 releases.json 来。
 */
export const downloadsOpen = true;

export function channelLabel(channel: Channel): string {
	return CHANNEL_LABELS[channel];
}

/** 提交哈希前 7 位 */
export function shortCommit(commit: string): string {
	return commit.slice(0, 7);
}

/** 字节数显示成 MB，保留一位小数 */
export function formatSize(bytes: number): string {
	return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** ISO 时间显示成 `2026-09-07 08:38 UTC` */
export function formatBuiltAt(iso: string): string {
	return iso ? `${iso.slice(0, 10)} ${iso.slice(11, 16)} UTC` : '';
}

function archOfFile(file: string): Arch | null {
	if (/[-_.]arm64\b/.test(file)) return 'arm64';
	if (/[-_.]x86_64\b/.test(file)) return 'x86_64';
	return null;
}

function isPlatformId(value: string): value is PlatformId {
	return value === 'macos' || value === 'windows' || value === 'linux';
}

function asChannel(value: string): Channel {
	return value in CHANNEL_LABELS ? (value as Channel) : 'beta';
}

/** 从浏览器 UA 猜访问者的系统；服务端渲染时没有 navigator，返回 null */
export function detectPlatform(): PlatformId | null {
	if (typeof navigator === 'undefined') return null;
	const hint = (
		(navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform ??
		navigator.userAgent
	).toLowerCase();
	if (hint.includes('mac')) return 'macos';
	if (hint.includes('win')) return 'windows';
	if (hint.includes('linux') || hint.includes('x11')) return 'linux';
	return null;
}

/**
 * 猜访问者的 CPU 架构。UA 里没有这个信息（Safari 在 Apple Silicon 上报的也是 Intel），所以：
 * - Chromium 系问 Client Hints 的 architecture；
 * - 其他浏览器看 WebGL 报的显卡名，Apple M 系列 / Apple GPU 是 Apple Silicon，Intel / AMD 是 Intel 机器。
 * 都拿不到返回 null，页面按 Apple Silicon 给（2020 年后的 Mac 都是），旁边留 Intel 版的链接。
 */
export async function detectArch(): Promise<Arch | null> {
	if (typeof navigator === 'undefined') return null;
	const hints = (
		navigator as Navigator & {
			userAgentData?: {
				getHighEntropyValues?: (k: string[]) => Promise<{ architecture?: string }>;
			};
		}
	).userAgentData;
	if (hints?.getHighEntropyValues) {
		try {
			const { architecture } = await hints.getHighEntropyValues(['architecture']);
			if (architecture === 'arm') return 'arm64';
			if (architecture === 'x86') return 'x86_64';
		} catch {
			// 浏览器不给就走下面
		}
	}
	try {
		const gl = document.createElement('canvas').getContext('webgl');
		if (!gl) return null;
		const info = gl.getExtension('WEBGL_debug_renderer_info');
		const renderer: unknown = info
			? gl.getParameter(info.UNMASKED_RENDERER_WEBGL)
			: gl.getParameter(gl.RENDERER);
		if (typeof renderer !== 'string') return null;
		if (/apple (m\d|gpu)/i.test(renderer)) return 'arm64';
		if (/intel|amd|radeon|nvidia/i.test(renderer)) return 'x86_64';
	} catch {
		// WebGL 被禁用等情况
	}
	return null;
}
