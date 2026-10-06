import { createError } from 'h3'
import { putPdf } from '../db/pdf.put.data'
import { generateId } from '../utils/id'
import { deletePdfObject, uploadPdfObject } from '../utils/s3'
import { enqueuePdfSplitJob } from '../utils/sqs'

export async function uploadPdf(user_id: string, file: { data: Buffer; filename?: string; type?: string }) {
	if (!file.data.length) {
		throw createError({ statusCode: 400, statusMessage: 'The uploaded PDF is empty' })
	}

	const pdf_id = generateId()
	const pdf_name = (file.filename?.trim() || 'Untitled PDF').replace(/\.pdf$/i, '')
	const key = `${pdf_id}/original/${pdf_name}.pdf`

	
	try {
		await putPdf(user_id, { pdf_id, pdf_name, completed_pages: 0, total_pages: 0 })
		await uploadPdfObject(key, file.data, file.type || 'application/pdf', { user_id })
		await enqueuePdfSplitJob(user_id, pdf_id, key, file.type || 'application/pdf')
	} catch (error) {
		console.error('[uploadPdf] DynamoDB write failed after S3 upload:', error)
		try {
			await deletePdfObject(key)
		} catch (cleanupError) {
			console.error('[uploadPdf] S3 cleanup failed:', cleanupError)
		}
		throw error
	}

	return { pdf_id, pdf_name, key }
}
