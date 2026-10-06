import { createError } from 'h3'
import { PutItemCommand } from '@aws-sdk/client-dynamodb'
import type { PageEntity } from '../services/interfaces/page.interface'
import dynamoDb, { DYNAMODB_TABLE_NAME } from '../utils/client'
const PDF_PREFIX = 'PDFDATA#'

export async function putPage(user_id: string, page: PageEntity): Promise<PageEntity> {
	try {
		await dynamoDb.send(new PutItemCommand({
			TableName: DYNAMODB_TABLE_NAME,
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
