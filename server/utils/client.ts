import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { fromIni } from '@aws-sdk/credential-providers'

const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'ap-south-1'

export const dynamoDb = new DynamoDBClient({})

export default dynamoDb