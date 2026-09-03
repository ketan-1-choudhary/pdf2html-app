import { createError, defineEventHandler, getRouterParam } from 'h3'
import { getPage } from '../../../../services/draft.service'
import { requireUserId } from '../../../../utils/session'

export default defineEventHandler(async (event) => {
	const user_id = requireUserId(event)
	const pdf_id = getRouterParam(event, 'pdf_id') ?? ''
	const page_num = Number(getRouterParam(event, 'page_num'))

	try {
		const page = await getPage(user_id, pdf_id, page_num)
		return { pdf_id: page.pdf_id, page_num: page.page_num, html: page.html, css: page.css }
	} catch (error: any) {
		console.error('[GET /api/pdf/:pdf_id/page/:page_num] failed:', error)
		if (error?.statusCode && error.statusCode < 500) throw error
		throw createError({ statusCode: 500, statusMessage: 'Unable to load this page right now' })
	}
})
