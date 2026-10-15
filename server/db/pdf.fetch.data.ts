import { createError } from 'h3'
import { GetItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb'
import type { PdfEntity } from '../services/interfaces/pdf.interface'
import dynamoDb, { DYNAMODB_TABLE_NAME } from '../utils/client'
const PDF_PREFIX = 'PDFDATA#'

export async function fetchPdf(user_id: string, pdf_id: string): Promise<PdfEntity | null> {
	let response
	try {
		response = await dynamoDb.send(new GetItemCommand({
			TableName: DYNAMODB_TABLE_NAME,
			Key: {
				user_id: { S: user_id },
				type: { S: `${PDF_PREFIX}${pdf_id}` },
			},
		}))
	} catch (error) {
		console.error('[fetchPdf] DynamoDB GetItem failed:', error)
		throw createError({ statusCode: 500, statusMessage: 'Database error while loading the document', cause: error })
	}

	if (!response.Item) return null
	return {
		pdf_id,
		pdf_name: response.Item.pdf_name?.S ?? 'Untitled',
		completed_pages: Number(response.Item.completed_pages?.N ?? 0),
		total_pages: Number(response.Item.total_pages?.N ?? 0),
	}
}

// Lists the PDF entities (2-segment SKs) for a user, skipping page entities.
export async function fetchPdfList(user_id: string): Promise<PdfEntity[]> {
	let response
	try {
		response = await dynamoDb.send(new QueryCommand({
			TableName: DYNAMODB_TABLE_NAME,
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
			completed_pages: Number(item.completed_pages?.N ?? 0),
			total_pages: Number(item.total_pages?.N ?? 0),
		})
	}
	return pdfs
}
