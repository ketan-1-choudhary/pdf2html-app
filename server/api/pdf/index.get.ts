import { createError, defineEventHandler } from 'h3'
import { listPdfs } from '../../services/draft.service'
import { requireUserId } from '../../utils/session'

export default defineEventHandler(async (event) => {
	const user_id = requireUserId(event)

	try {
		const drafts = await listPdfs(user_id)
		return { drafts }
	} catch (error: any) {
		console.error('[GET /api/pdf] failed:', error)
		if (error?.statusCode === 401) throw error
		throw createError({ statusCode: 500, statusMessage: 'Unable to load your drafts right now' })
	}
})
