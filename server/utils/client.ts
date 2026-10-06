import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

const tableName = process.env.DYNAMODB_TABLE_NAME

if (!tableName) {
	throw new Error('DYNAMODB_TABLE_NAME environment variable is required')
}

export const dynamoDb = new DynamoDBClient({})
export const DYNAMODB_TABLE_NAME = tableName

export default dynamoDb