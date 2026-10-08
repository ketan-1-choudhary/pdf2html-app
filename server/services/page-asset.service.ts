import { createError } from 'h3'
import { fetchPage } from '../db/page.fetch.data'
import { validatePageAssetKey } from '../utils/page-assets'
import { getPdfAssetObject } from '../utils/s3'
import type { PageAssetStream } from './interfaces/page.interface'

const imageTypes: Record<string, string> = {
	png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
	webp: 'image/webp', gif: 'image/gif', svg: 'image/svg+xml',
}

export async function getPageAsset(userId: string, pdfId: string, page: number, key: unknown): Promise<PageAssetStream> {
	if (typeof key !== 'string') {
		throw createError({ statusCode: 400, statusMessage: 'Asset key is required' })
	}
	validatePageAssetKey(key, pdfId, page)
	if (!await fetchPage(userId, pdfId, page)) {
		throw createError({ statusCode: 404, statusMessage: 'Page not found' })
	}
	try {
		const asset = await getPdfAssetObject(key)
		if (!asset.Body) throw createError({ statusCode: 404, statusMessage: 'Asset not found' })
		const extension = key.split('.').pop()!.toLowerCase()
		return { body: asset.Body.transformToWebStream(), contentType: imageTypes[extension]! }
	} catch (error: any) {
		if (error?.statusCode) throw error
		if (error?.name === 'NoSuchKey') {
			throw createError({ statusCode: 404, statusMessage: 'Asset not found' })
		}
		console.error('[getPageAsset] S3 read failed:', error)
		throw createError({ statusCode: 500, statusMessage: 'Unable to load asset' })
	}
}