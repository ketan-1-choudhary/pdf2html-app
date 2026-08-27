import { createError } from 'h3'
import { GetItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb'
import type { PageEntity, PdfEntity } from '../services/interfaces/draft.interface'
import dynamoDb from '../utils/client'

const TABLE_NAME = 'test-pdf-to-html-demo-table'
const PDF_PREFIX = 'PDFDATA#'

// Lists the PDF entities (2-segment SKs) for a user, skipping page entities.
export async function fetchPdfList(user_id: string): Promise<PdfEntity[]> {
	let response
	try {
		response = await dynamoDb.send(new QueryCommand({
			TableName: TABLE_NAME,
			KeyConditionExpression: 'user_id = :uid AND begins_with(#type, :prefix)',
			ExpressionAttributeNames: { '#type': 'type' },
			ExpressionAttributeValues: {
				':uid': { S: user_id },
				':prefix': { S: PDF_PREFIX },
			},
		}))
	} catch (error) {
		console.error('[fetchPdfList] DynamoDB Query failed:', error)
		throw createError({
			statusCode: 500,
			statusMessage: `Database error while listing drafts: ${(error as Error).message}`,
			cause: error,
		})
	}

	const items = response.Items ?? []
	const pdfs: PdfEntity[] = []
	for (const item of items) {
		const sk = item.type?.S ?? ''
		const segments = sk.slice(PDF_PREFIX.length).split('#')
		// pdf entity => `PDFDATA#<pdf_id>` has exactly one trailing segment
		if (segments.length !== 1 || !segments[0]) continue
		pdfs.push({
			pdf_id: segments[0],
			pdf_name: item.pdf_name?.S ?? 'Untitled',
		})
	}
	return pdfs
}

export async function fetchPage(user_id: string, pdf_id: string, page_num: number): Promise<PageEntity | null> {
	let response
	try {
		response = await dynamoDb.send(new GetItemCommand({
			TableName: TABLE_NAME,
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
