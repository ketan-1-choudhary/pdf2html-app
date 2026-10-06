import { createError } from 'h3'
import { GetItemCommand } from '@aws-sdk/client-dynamodb'
import type { PageEntity } from '../services/interfaces/page.interface'
import dynamoDb, { DYNAMODB_TABLE_NAME } from '../utils/client'
const PDF_PREFIX = 'PDFDATA#'

export async function fetchPage(user_id: string, pdf_id: string, page_num: number): Promise<PageEntity | null> {
	let response
	try {
		response = await dynamoDb.send(new GetItemCommand({
			TableName: DYNAMODB_TABLE_NAME,
			Key: {
				user_id: { S: user_id },
				type: { S: `${PDF_PREFIX}${pdf_id}#${page_num}` },
			},
		}))
	} catch (error) {
		console.error('[fetchPage] DynamoDB GetItem failed:', error)
		throw createError({
			statusCode: 500,
			statusMessage: `Database error while loading the page: ${(error as Error).message}`,
			cause: error,
		})
	}

	if (!response.Item) return null

	return {
		pdf_id,
		page_num,
		html: response.Item.html?.S ?? '',
		css: response.Item.css?.S ?? '',
	}
}
