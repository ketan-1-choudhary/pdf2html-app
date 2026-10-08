import { defineEventHandler, getQuery, getRouterParam, sendStream, setHeader } from 'h3'
import { getPageAsset } from '../../../../../services/page-asset.service'
import { requireUserId } from '../../../../../utils/session'

export default defineEventHandler(async (event) => {
	const asset = await getPageAsset(
		requireUserId(event),
		getRouterParam(event, 'pdf_id') ?? '',
		Number(getRouterParam(event, 'page_num')),
		getQuery(event).key,
	)
	setHeader(event, 'Content-Type', asset.contentType)
	setHeader(event, 'Cache-Control', 'private, no-store')
	setHeader(event, 'X-Content-Type-Options', 'nosniff')
	setHeader(event, 'Content-Security-Policy', "default-src 'none'; sandbox")
	return sendStream(event, asset.body)
})