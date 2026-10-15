import { createError, defineEventHandler, getRouterParam, sendStream, setHeader } from 'h3'
import { exportPage } from '../../../../../services/export.service'
import { requireUserId } from '../../../../../utils/session'

export default defineEventHandler(async (event) => {
	const user_id = requireUserId(event)

	let archive
	try {
		archive = await exportPage(
			user_id,
			getRouterParam(event, 'pdf_id') ?? '',
			Number(getRouterParam(event, 'page_num')),
		)
	} catch (error: any) {
		console.error('[GET /api/pdf/:pdf_id/page/:page_num/export] failed:', error)
		if (error?.statusCode && error.statusCode < 500) throw error
		throw createError({ statusCode: 500, statusMessage: 'Unable to export this page right now' })
	}

	setHeader(event, 'Content-Type', 'application/zip')
	setHeader(event, 'Content-Disposition', `attachment; filename="${archive.filename}"`)
	setHeader(event, 'Cache-Control', 'private, no-store')
	return sendStream(event, archive.stream)
})
