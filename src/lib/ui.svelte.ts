/** 站点级共享状态：竹影风动开关、系统减弱动效偏好、当前弹窗。 */
class UiState {
	/** 用户手动控制的风动开关 */
	wind = $state(true);
	/** 系统 prefers-reduced-motion */
	reducedMotion = $state(false);
	/** 当前打开的弹窗标识，null 表示关闭 */
	modal = $state<string | null>(null);

	/** 只有两个条件都满足才真正播放动画 */
	get animate() {
		return this.wind && !this.reducedMotion;
	}
}

export const ui = new UiState();
