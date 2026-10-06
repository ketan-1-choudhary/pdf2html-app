import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs'

const sqs = new SQSClient({ region: process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'ap-south-1' })

const queueUrl = process.env.SQS_PDF_SPLIT_QUEUE_URL

export async function enqueuePdfSplitJob(user_id: string, pdf_id: string, key: string, contentType?: string) {
	if (!queueUrl) {
		throw new Error('SQS_PDF_SPLIT_QUEUE_URL is not configured')
	}

	const payload = {
		user_id,
		pdf_id,
		key,
		bucket: process.env.AWS_S3_BUCKET,
		contentType: contentType || 'application/pdf',
	}

	await sqs.send(new SendMessageCommand({
		QueueUrl: queueUrl,
		MessageBody: JSON.stringify(payload),
	}))

	return payload
}
