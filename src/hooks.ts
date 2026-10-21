import type { Reroute } from '@sveltejs/kit';
import { deLocalizeUrl } from '$lib/paraglide/runtime';

/** /en/download 这类带语言前缀的地址落到同一个路由上 */
export const reroute: Reroute = (request) => deLocalizeUrl(request.url).pathname;
