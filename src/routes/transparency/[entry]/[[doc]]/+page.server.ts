import { error } from '@sveltejs/kit';
import { renderMarkdown } from '$lib/docs/render';
import { transparencyEntries } from '$lib/transparency';
import { galleryHtml } from '$lib/transparency-gallery';
import { transparencyDoc } from '$lib/transparency.server';
import type { EntryGenerator, PageServerLoad } from './$types';

/** 有内容时整页预渲染；没有时不预渲染，访问直接 404 */
export const prerender = transparencyEntries.length > 0;

export const entries: EntryGenerator = () =>
	transparencyEntries.flatMap((entry) =>
		entry.docs.map((doc) => ({ entry: entry.slug, doc: doc.slug || undefined }))
	);

export const load: PageServerLoad = ({ params }) => {
	const entry = transparencyEntries.find((item) => item.slug === params.entry);
	const page = entry ? transparencyDoc(entry.slug, params.doc ?? '') : null;
	if (!entry || !page) error(404, '没有这一页');
	const { html } = renderMarkdown(page.body, '');
	return {
		entry: entry.slug,
		doc: params.doc ?? '',
		title: page.title,
		html: galleryHtml(html),
		docs: entry.docs
	};
};
