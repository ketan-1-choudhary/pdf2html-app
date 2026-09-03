import { DynamoDBClient } from '@aws-sdk/client-dynamodb'

// Region from env (AWS_REGION/AWS_DEFAULT_REGION) so it works across environments; fallback for local dev.
export const dynamoDb = new DynamoDBClient({
	region: process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'us-west-2',
});

export default dynamoDb