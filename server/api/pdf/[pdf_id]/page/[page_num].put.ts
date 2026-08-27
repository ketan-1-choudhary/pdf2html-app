import { createError, defineEventHandler, getRouterParam, readBody } from 'h3'
import { savePage } from '../../../../../services/draft.service'
import { requireUserId } from '../../../../../utils/session'
import type { SavePageRequestBody } from '../../../../../services/interfaces/draft.interface'

export default defineEventHandler(async (event) => {
	const user_id = requireUserId(event)
	const pdf_id = getRouterParam(event, 'pdf_id') ?? ''
	const page_num = Number(getRouterParam(event, 'page_num'))
	const body = await readBody<SavePageRequestBody>(event)

	try {
		const page = await savePage(user_id, pdf_id, page_num, body?.html ?? '', body?.css ?? '')
		return { pdf_id: page.pdf_id, page_num: page.page_num }
	} catch (error: any) {
		console.error('[PUT /api/pdf/:pdf_id/page/:page_num] failed:', error)
		if (error?.statusCode && error.statusCode < 500) throw error
		throw createError({ statusCode: 500, statusMessage: 'Unable to save this page right now' })
	}
})
