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
		requirement: '',
		available: false
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

/** 一个可下载的安装包 */
export type Asset = {
	platform: PlatformId;
	/** 芯片 / 架构说明，例如 Apple Silicon */
	arch: string;
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
