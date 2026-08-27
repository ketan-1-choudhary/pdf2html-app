import { createError } from 'h3'
import { randomUUID } from 'node:crypto'
import { fetchPage, fetchPdfList } from '../db/draft.fetch.data'
import { putPage, putPdf } from '../db/draft.put.data'
import type { PageEntity, PdfEntity } from './interfaces/draft.interface'

const TEMPLATE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Converted Page</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h1>Hello World</h1>
  <p>Paste your converted HTML here and edit it.</p>
</body>
</html>`

const TEMPLATE_CSS = `body {
  font-family: sans-serif;
  margin: 2rem;
}`

export async function listPdfs(user_id: string): Promise<PdfEntity[]> {
	return fetchPdfList(user_id)
}

// Creates a new PDF draft plus its single template page 1.
export async function createPdf(user_id: string, pdf_name?: string): Promise<{ pdf_id: string }> {
	const pdf_id = randomUUID()
	const name = pdf_name?.trim() || 'Untitled draft'

	await putPdf(user_id, { pdf_id, pdf_name: name })
	await putPage(user_id, { pdf_id, page_num: 1, html: TEMPLATE_HTML, css: TEMPLATE_CSS })

	return { pdf_id }
}

export async function getPage(user_id: string, pdf_id: string, page_num: number): Promise<PageEntity> {
	if (!pdf_id || !Number.isInteger(page_num) || page_num < 1) {
		throw createError({ statusCode: 400, statusMessage: 'Invalid draft or page reference' })
	}

	const page = await fetchPage(user_id, pdf_id, page_num)
	if (!page) {
		throw createError({ statusCode: 404, statusMessage: 'Draft page not found' })
	}
	return page
}

export async function savePage(user_id: string, pdf_id: string, page_num: number, html: string, css: string): Promise<PageEntity> {
	if (!pdf_id || !Number.isInteger(page_num) || page_num < 1) {
		throw createError({ statusCode: 400, statusMessage: 'Invalid draft or page reference' })
	}

	return putPage(user_id, { pdf_id, page_num, html: html ?? '', css: css ?? '' })
}
