import { createError } from 'h3'
import { PutItemCommand } from '@aws-sdk/client-dynamodb'
import type { PageEntity, PdfEntity } from '../services/interfaces/draft.interface'
import dynamoDb from '../utils/client'

const TABLE_NAME = 'test-pdf-to-html-demo-table'
const PDF_PREFIX = 'PDFDATA#'

export async function putPdf(user_id: string, pdf: PdfEntity): Promise<PdfEntity> {
	try {
		await dynamoDb.send(new PutItemCommand({
			TableName: TABLE_NAME,
			Item: {
				user_id: { S: user_id },
				type: { S: `${PDF_PREFIX}${pdf.pdf_id}` },
				pdf_name: { S: pdf.pdf_name },
			},
		}))
	} catch (error) {
		console.error('[putPdf] DynamoDB PutItem failed:', error)
		throw createError({
			statusCode: 500,
			statusMessage: `Database error while creating the draft: ${(error as Error).message}`,
			cause: error,
		})
	}

	return pdf
}

export async function putPage(user_id: string, page: PageEntity): Promise<PageEntity> {
	try {
		await dynamoDb.send(new PutItemCommand({
			TableName: TABLE_NAME,
			Item: {
				user_id: { S: user_id },
				type: { S: `${PDF_PREFIX}${page.pdf_id}#${page.page_num}` },
				html: { S: page.html },
				css: { S: page.css },
			},
		}))
	} catch (error) {
		console.error('[putPage] DynamoDB PutItem failed:', error)
		throw createError({
			statusCode: 500,
			statusMessage: `Database error while saving the page: ${(error as Error).message}`,
			cause: error,
		})
	}

	return page
}
