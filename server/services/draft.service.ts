import { createError } from 'h3'
import { fetchPage } from '../db/page.fetch.data'
import { updatePage } from '../db/page.put.data'
import type { PageEntity } from './interfaces/page.interface'
import { transformPageHtml } from '../utils/page-assets'

export async function getPage(user_id: string, pdf_id: string, page_num: number): Promise<PageEntity> {
	if (!pdf_id || !Number.isInteger(page_num) || page_num < 1) {
		throw createError({ statusCode: 400, statusMessage: 'Invalid draft or page reference' })
	}

	const page = await fetchPage(user_id, pdf_id, page_num)
	if (!page) {
		throw createError({ statusCode: 404, statusMessage: 'Draft page not found' })
	}
	return { ...page, html: transformPageHtml(page.html, pdf_id, page_num, true) }
}

export async function savePage(user_id: string, pdf_id: string, page_num: number, html: string, css: string): Promise<PageEntity> {
	if (!pdf_id || !Number.isInteger(page_num) || page_num < 1) {
		throw createError({ statusCode: 400, statusMessage: 'Invalid draft or page reference' })
	}

	return updatePage(user_id, {
		pdf_id,
		page_num,
		html: transformPageHtml(html ?? '', pdf_id, page_num, false),
		css: css ?? '',
	})
}
