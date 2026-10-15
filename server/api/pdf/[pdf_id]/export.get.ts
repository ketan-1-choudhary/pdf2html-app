import { createError, defineEventHandler, getRouterParam, sendStream, setHeader } from 'h3'
import { exportPdf } from '../../../services/export.service'
import { requireUserId } from '../../../utils/session'

export default defineEventHandler(async (event) => {
	const user_id = requireUserId(event)

	let archive
	try {
		archive = await exportPdf(user_id, getRouterParam(event, 'pdf_id') ?? '')
	} catch (error: any) {
		console.error('[GET /api/pdf/:pdf_id/export] failed:', error)
		if (error?.statusCode && error.statusCode < 500) throw error
		throw createError({ statusCode: 500, statusMessage: 'Unable to export this document right now' })
	}

	setHeader(event, 'Content-Type', 'application/zip')
	setHeader(event, 'Content-Disposition', `attachment; filename="${archive.filename}"`)
	setHeader(event, 'Cache-Control', 'private, no-store')
	return sendStream(event, archive.stream)
})
