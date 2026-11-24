/**
 * 公开说明正文里的截图改成缩略图墙：只由图片组成的段落换成 .tp-gallery，每张图包成带说明文字的 figure，
 * 缩略图用 thumbs/ 下的小图，原图地址放在 data-full 里给灯箱用。说明文字取自图片的 alt。
 */
export function galleryHtml(html: string): string {
	return html.replace(/<p>((?:\s*<img [^>]*>\s*)+)<\/p>/g, (_, images: string) => {
		const figures = [...images.matchAll(/<img ([^>]*)>/g)].map(([, attrs]) => {
			const src = /src="([^"]+)"/.exec(attrs)?.[1] ?? '';
			const alt = /alt="([^"]*)"/.exec(attrs)?.[1] ?? '';
			const thumb = src.replace(/^(\/transparency-assets\/[^/]+)\//, '$1/thumbs/');
			return (
				`<figure class="tp-fig"><button type="button" class="tp-thumb" data-full="${src}" aria-label="查看大图：${alt}">` +
				`<img src="${thumb}" alt="${alt}" loading="lazy" /></button>` +
				(alt ? `<figcaption>${alt}</figcaption>` : '') +
				`</figure>`
			);
		});
		return `<div class="tp-gallery">${figures.join('')}</div>`;
	});
}
