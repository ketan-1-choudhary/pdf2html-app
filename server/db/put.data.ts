import { createError } from 'h3'
import { ConditionalCheckFailedException, PutItemCommand } from '@aws-sdk/client-dynamodb'
import type { UserDataItem } from '../services/interfaces/signup.interface'
import dynamoDb from '../utils/client'

const TABLE_NAME = 'test-pdf-to-html-demo-table'

export async function putData(item: UserDataItem): Promise<UserDataItem> {
	try {
		await dynamoDb.send(new PutItemCommand({
			TableName: TABLE_NAME,
			Item: {
				user_id: { S: item.user_id },
				type: { S: item.type },
				passwordHash: { S: item.passwordHash },
			},
			ConditionExpression: 'attribute_not_exists(user_id) AND attribute_not_exists(#type)',
			ExpressionAttributeNames: {
				'#type': 'type',
			},
		}))
	} catch (error) {
		console.error('[putData] DynamoDB PutItem failed:', error)
		if (error instanceof ConditionalCheckFailedException) {
			throw createError({ statusCode: 409, statusMessage: 'A user record with this key already exists', cause: error })
		}
		throw createError({
			statusCode: 500,
			statusMessage: `Database error while saving the user record: ${(error as Error).message}`,
			cause: error,
		})
	}

	return item
}

