import { fetchPdfList } from '../db/pdf.fetch.data'
import { putPdf } from '../db/pdf.put.data'
import { putPage } from '../db/page.put.data'
import { generateId } from '../utils/id'
import type { PdfEntity } from './interfaces/pdf.interface'

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
	const pdf_id = generateId()
	const name = pdf_name?.trim() || 'Untitled draft'

  await putPdf(user_id, { pdf_id, pdf_name: name, completed_pages: 0, total_pages: 0 })
	await putPage(user_id, { pdf_id, page_num: 1, html: TEMPLATE_HTML, css: TEMPLATE_CSS })

	return { pdf_id }
}
