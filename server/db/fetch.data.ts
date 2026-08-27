import { createError } from 'h3'
import { GetItemCommand } from '@aws-sdk/client-dynamodb'
import type { UserDataItem } from '../services/interfaces/signup.interface'
import dynamoDb from '../utils/client'

const TABLE_NAME = 'test-pdf-to-html-demo-table'

export async function fetchUser(user_id: string): Promise<UserDataItem | null> {
	let response
	try {
		response = await dynamoDb.send(new GetItemCommand({
			TableName: TABLE_NAME,
			Key: {
				user_id: { S: user_id },
				type: { S: 'USERDATA' },
			},
		}))
	} catch (error) {
		console.error('[fetchUser] DynamoDB GetItem failed:', error)
		throw createError({
			statusCode: 500,
			statusMessage: `Database error while fetching the user record: ${(error as Error).message}`,
			cause: error,
		})
	}

	if (!response.Item) return null

	return {
		user_id: response.Item.user_id.S!,
		type: 'USERDATA',
		passwordHash: response.Item.passwordHash.S!,
	}
}

export async function checkUsername(user_id: string): Promise<boolean> {
	const user = await fetchUser(user_id)
	return user !== null
}

