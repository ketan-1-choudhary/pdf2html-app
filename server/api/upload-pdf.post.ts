import { createError, defineEventHandler, readMultipartFormData } from 'h3'
import { uploadPdf } from '../services/pdf-upload.service'
import { requireUserId } from '../utils/session'

export default defineEventHandler(async (event) => {
	const user_id = requireUserId(event)

	try {
		const parts = await readMultipartFormData(event)
		const pdf = parts?.find((part) => part.name === 'pdf')

		if (!pdf?.data) {
			throw createError({ statusCode: 400, statusMessage: 'Please select a PDF to upload' })
		}

		if (pdf.type && pdf.type !== 'application/pdf') {
			throw createError({ statusCode: 400, statusMessage: 'Only PDF files can be uploaded' })
		}

		const result = await uploadPdf(user_id, {
			data: pdf.data,
			filename: pdf.filename,
			type: pdf.type,
		})

		return { pdf_id: result.pdf_id, pdf_name: result.pdf_name }
	} catch (error: any) {
		console.error('[POST /api/upload-pdf] failed:', error)
		if (error?.statusCode) throw error
		throw createError({ statusCode: 500, statusMessage: 'Unable to upload the PDF right now' })
	}
})
