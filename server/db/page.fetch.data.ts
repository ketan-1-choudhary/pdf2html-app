import { createError } from 'h3'
import { GetItemCommand, QueryCommand, type AttributeValue } from '@aws-sdk/client-dynamodb'
import type { PageEntity } from '../services/interfaces/page.interface'
import dynamoDb, { DYNAMODB_TABLE_NAME } from '../utils/client'
const PDF_PREFIX = 'PDFDATA#'

// All page entities of one PDF, ordered by page number. Paginates past the 1 MB Query limit.
export async function fetchPdfPages(user_id: string, pdf_id: string): Promise<PageEntity[]> {
	const prefix = `${PDF_PREFIX}${pdf_id}#`
	const pages: PageEntity[] = []
	let startKey: Record<string, AttributeValue> | undefined

	do {
		let response
		try {
			response = await dynamoDb.send(new QueryCommand({
				TableName: DYNAMODB_TABLE_NAME,
				KeyConditionExpression: 'user_id = :uid AND begins_with(#type, :prefix)',
				ExpressionAttributeNames: { '#type': 'type' },
				ExpressionAttributeValues: { ':uid': { S: user_id }, ':prefix': { S: prefix } },
				ExclusiveStartKey: startKey,
			}))
		} catch (error) {
			console.error('[fetchPdfPages] DynamoDB Query failed:', error)
			throw createError({ statusCode: 500, statusMessage: 'Database error while loading pages', cause: error })
		}

		for (const item of response.Items ?? []) {
			const page_num = Number((item.type?.S ?? '').slice(prefix.length))
			if (!Number.isSafeInteger(page_num) || page_num < 1) continue
			pages.push({ pdf_id, page_num, html: item.html?.S ?? '', css: item.css?.S ?? '' })
		}
		startKey = response.LastEvaluatedKey
	} while (startKey)

	return pages.sort((a, b) => a.page_num - b.page_num)
}

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
