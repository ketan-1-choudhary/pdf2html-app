import { createError, defineEventHandler, readBody } from 'h3'
import { createPdf } from '../../services/draft.service'
import { requireUserId } from '../../utils/session'
import type { CreatePdfRequestBody } from '../../services/interfaces/draft.interface'

export default defineEventHandler(async (event) => {
	const user_id = requireUserId(event)
	const body = await readBody<CreatePdfRequestBody>(event)

	try {
		const { pdf_id } = await createPdf(user_id, body?.pdf_name)
		return { pdf_id }
	} catch (error: any) {
		console.error('[POST /api/pdf] failed:', error)
		if (error?.statusCode === 401) throw error
		throw createError({ statusCode: 500, statusMessage: 'Unable to create a draft right now' })
	}
})
