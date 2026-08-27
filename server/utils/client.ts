import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

export const dynamoDb = new DynamoDBClient({});

export default dynamoDb