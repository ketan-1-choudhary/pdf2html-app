import { createError } from 'h3'
import sanitizeHtml from 'sanitize-html'

export function pageAssetEndpoint(pdfId: string, page: number) {
	if (!/^[a-zA-Z0-9_-]+$/.test(pdfId) || !Number.isSafeInteger(page) || page < 1) {
		throw createError({ statusCode: 400, statusMessage: 'Invalid page reference' })
	}
	return `/api/pdf/${encodeURIComponent(pdfId)}/page/${page}/asset`
}

export function validatePageAssetKey(key: string, pdfId: string, page: number) {
	pageAssetEndpoint(pdfId, page)
	const prefix = (process.env.S3_PREFIX || '').replace(/^\/+/, '')
	const assetPrefix = `${prefix}${pdfId}/pages/${page}/assets/files/`
	const filename = key.startsWith(assetPrefix) ? key.slice(assetPrefix.length) : ''
	if (!filename || /[/\\\u0000-\u001f\u007f?#%]/.test(filename) || !/\.(png|jpe?g|webp|gif|svg)$/i.test(filename)) {
		throw createError({ statusCode: 400, statusMessage: 'Invalid page asset key' })
	}
	return key
}

function canonicalImageKey(source: string, pdfId: string, page: number) {
	const endpoint = pageAssetEndpoint(pdfId, page)
	if (source.startsWith('/')) {
		const url = new URL(source, 'https://page-assets.invalid')
		const keys = url.searchParams.getAll('key')
		if (url.origin !== 'https://page-assets.invalid' || url.pathname !== endpoint || url.hash ||
			keys.length !== 1 || [...url.searchParams.keys()].some(name => name !== 'key')) {
			throw createError({ statusCode: 400, statusMessage: 'Invalid page asset URL' })
		}
		return validatePageAssetKey(keys[0]!, pdfId, page)
	}
	return validatePageAssetKey(source, pdfId, page)
}

export function transformPageHtml(content: string, pdfId: string, page: number, forPreview: boolean) {
	const endpoint = pageAssetEndpoint(pdfId, page)
	return sanitizeHtml(content, {
		allowedTags: [...sanitizeHtml.defaults.allowedTags, 'html', 'head', 'body', 'title', 'style', 'img'],
		allowVulnerableTags: true,
		allowedAttributes: {
			'*': ['id', 'class', 'style', 'title', 'role', 'aria-*'],
			a: ['href', 'name', 'target', 'rel'],
			img: ['src', 'alt', 'width', 'height', 'loading'],
			td: ['colspan', 'rowspan'],
			th: ['colspan', 'rowspan', 'scope'],
		},
		allowedSchemes: ['http', 'https', 'mailto'],
		allowProtocolRelative: false,
		transformTags: {
			img: (tagName, attributes) => {
				if (!attributes.src) return { tagName, attribs: attributes }
				const key = canonicalImageKey(attributes.src, pdfId, page)
				return {
					tagName,
					attribs: { ...attributes, src: forPreview ? `${endpoint}?key=${encodeURIComponent(key)}` : key },
				}
			},
		},
	})
}