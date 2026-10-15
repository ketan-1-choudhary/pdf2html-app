import { createError } from 'h3'
import { Zip, ZipDeflate, ZipPassThrough, strToU8 } from 'fflate'
import { fetchPdf } from '../db/pdf.fetch.data'
import { fetchPage, fetchPdfPages } from '../db/page.fetch.data'
import { validatePageAssetKey } from '../utils/page-assets'
import { getPdfAssetObject } from '../utils/s3'
import type { PageEntity } from './interfaces/page.interface'
import type { ExportArchive } from './interfaces/export.interface'

interface ZipWriter {
	text(path: string, content: string): void
	binary(path: string, data: Uint8Array): void
}

function escapeHtml(value: string) {
	return value.replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]!)
}

function slugify(name: string) {
	const slug = name.toLowerCase().replace(/\.pdf$/i, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60)
	return slug || 'document'
}

function assertValidRef(pdf_id: string, page_num?: number) {
	if (!/^[a-zA-Z0-9_-]+$/.test(pdf_id) || (page_num !== undefined && (!Number.isSafeInteger(page_num) || page_num < 1))) {
		throw createError({ statusCode: 400, statusMessage: 'Invalid document or page reference' })
	}
}

// Stored HTML references assets by raw S3 key; repoint each one at a file inside the zip.
function localizeAssets(html: string, page: PageEntity, zipDir: string, hrefPrefix: string) {
	const assets = new Map<string, string>()
	const localized = html.replace(/(<img\b[^>]*?\bsrc=")([^"]*)(")/gi, (match, start: string, src: string, end: string) => {
		let key: string
		try {
			key = validatePageAssetKey(src.replace(/&amp;/g, '&'), page.pdf_id, page.page_num)
		} catch {
			return match
		}
		const file = key.slice(key.lastIndexOf('/') + 1)
		assets.set(key, `${zipDir}/${file}`)
		return `${start}${hrefPrefix}${encodeURIComponent(file)}${end}`
	})
	return { html: localized, assets }
}

function wrapDocument(html: string, cssHref: string, title: string) {
	const headTags = [
		'<meta charset="utf-8" />',
		'<meta name="viewport" content="width=device-width, initial-scale=1" />',
		`<link rel="stylesheet" href="${cssHref}" />`,
	].join('\n')

	if (/<html[\s>]/i.test(html)) {
		const doc = /<head[^>]*>/i.test(html)
			? html.replace(/<head[^>]*>/i, m => `${m}\n${headTags}`)
			: html.replace(/<html[^>]*>/i, m => `${m}\n<head>\n${headTags}\n<title>${escapeHtml(title)}</title>\n</head>`)
		return /^\s*<!doctype/i.test(doc) ? doc : `<!doctype html>\n${doc}`
	}

	return `<!doctype html>
<html lang="en">
<head>
${headTags}
<title>${escapeHtml(title)}</title>
</head>
<body>
${html}
</body>
</html>
`
}

async function addAssets(zip: ZipWriter, assets: Map<string, string>, warnings: string[]) {
	for (const [key, path] of assets) {
		try {
			const bytes = await (await getPdfAssetObject(key)).Body?.transformToByteArray()
			if (!bytes) throw new Error('empty body')
			zip.binary(path, bytes)
		} catch (error) {
			console.error('[export] asset download failed:', key, error)
			warnings.push(`${path} could not be downloaded`)
		}
	}
}

// Streams the archive as it is built so large documents never sit fully in memory.
function createZipStream(build: (zip: ZipWriter) => Promise<void>): ReadableStream<Uint8Array> {
	return new ReadableStream<Uint8Array>({
		start(controller) {
			const zip = new Zip((err, chunk, final) => {
				if (err) return controller.error(err)
				controller.enqueue(chunk)
				if (final) controller.close()
			})
			const writer: ZipWriter = {
				text(path, content) {
					const file = new ZipDeflate(path, { level: 6 })
					zip.add(file)
					file.push(strToU8(content), true)
				},
				binary(path, data) {
					// Images are already compressed; deflating them again only costs CPU.
					const file = new ZipPassThrough(path)
					zip.add(file)
					file.push(data, true)
				},
			}
			build(writer).then(
				() => zip.end(),
				(error) => {
					console.error('[export] archive build failed:', error)
					controller.error(error)
				},
			)
		},
	})
}

export async function exportPage(user_id: string, pdf_id: string, page_num: number): Promise<ExportArchive> {
	assertValidRef(pdf_id, page_num)
	const [page, pdf] = await Promise.all([fetchPage(user_id, pdf_id, page_num), fetchPdf(user_id, pdf_id)])
	if (!page) throw createError({ statusCode: 404, statusMessage: 'Page not found' })

	const name = pdf?.pdf_name ?? 'document'
	const { html, assets } = localizeAssets(page.html, page, 'assets', 'assets/')

	return {
		filename: `${slugify(name)}-page-${page_num}.zip`,
		stream: createZipStream(async (zip) => {
			const warnings: string[] = []
			zip.text('index.html', wrapDocument(html, 'style.css', `${name} — Page ${page_num}`))
			zip.text('style.css', page.css)
			await addAssets(zip, assets, warnings)
			if (warnings.length) zip.text('export-warnings.txt', warnings.join('\n'))
		}),
	}
}

export async function exportPdf(user_id: string, pdf_id: string): Promise<ExportArchive> {
	assertValidRef(pdf_id)
	const pdf = await fetchPdf(user_id, pdf_id)
	if (!pdf) throw createError({ statusCode: 404, statusMessage: 'Document not found' })
	if (!pdf.total_pages || pdf.completed_pages < pdf.total_pages) {
		throw createError({ statusCode: 409, statusMessage: 'This document is still converting. Export is available once every page is ready.' })
	}

	const pages = await fetchPdfPages(user_id, pdf_id)
	if (pages.length < pdf.total_pages) {
		throw createError({ statusCode: 409, statusMessage: 'Some pages of this document are missing.' })
	}

	const prepared = pages.map((page) => {
		const dir = `page-${page.page_num}`
		const { html, assets } = localizeAssets(page.html, page, `assets/${dir}`, `../assets/${dir}/`)
		return { page, dir, html, assets }
	})

	const contents = prepared
		.map(({ page, dir }) => `    <li><a href="pages/${dir}.html">Page ${page.page_num}</a></li>`)
		.join('\n')
	const title = escapeHtml(pdf.pdf_name)
	const indexHtml = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
<style>
  body { margin: 0; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; color: #18181b; background: #fafaf7; }
  main { max-width: 40rem; margin: 0 auto; padding: 3rem 1.25rem; }
  h1 { margin: 0 0 1.5rem; font-size: 1.75rem; }
  ol { margin: 0; padding: 0; list-style: none; display: grid; gap: .5rem; }
  a { display: block; padding: .75rem 1rem; border: 1px solid #e4e4dc; border-radius: .75rem; background: #fff; color: #0f766e; text-decoration: none; }
  a:hover, a:focus-visible { border-color: #14b8a6; }
</style>
</head>
<body>
<main>
  <h1>${title}</h1>
  <ol>
${contents}
  </ol>
</main>
</body>
</html>
`

	return {
		filename: `${slugify(pdf.pdf_name)}.zip`,
		stream: createZipStream(async (zip) => {
			const warnings: string[] = []
			zip.text('index.html', indexHtml)
			for (const { page, dir, html, assets } of prepared) {
				zip.text(`pages/${dir}.html`, wrapDocument(html, `${dir}.css`, `${pdf.pdf_name} — Page ${page.page_num}`))
				zip.text(`pages/${dir}.css`, page.css)
				await addAssets(zip, assets, warnings)
			}
			if (warnings.length) zip.text('export-warnings.txt', warnings.join('\n'))
		}),
	}
}
