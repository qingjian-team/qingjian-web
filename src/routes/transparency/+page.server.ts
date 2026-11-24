import { error } from '@sveltejs/kit';
import { transparencyEntries } from '$lib/transparency';
import type { PageServerLoad } from './$types';

/** 有内容时预渲染；没有时不预渲染，访问直接 404 */
export const prerender = transparencyEntries.length > 0;

export const load: PageServerLoad = () => {
	if (!transparencyEntries.length) error(404, '没有这一页');
	return { entries: transparencyEntries };
};
