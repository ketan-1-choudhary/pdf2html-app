import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { fromIni } from '@aws-sdk/credential-providers'

const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || 'ap-south-1'
const bucket = process.env.AWS_S3_BUCKET || process.env.S3_BUCKET_NAME

const s3 = new S3Client({})

export async function uploadPdfObject(key: string, body: Buffer, contentType: string, metadata?: Record<string, string>) {
	if (!bucket) {
		throw new Error('S3 bucket is not configured')
	}

	return s3.send(new PutObjectCommand({
		Bucket: bucket,
		Key: key,
		Body: body,
		ContentType: contentType,
		Metadata: metadata,
	}))
}

export async function deletePdfObject(key: string) {
	if (!bucket) return
	await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))
}

export async function getPdfAssetObject(key: string) {
	if (!bucket) throw new Error('S3 bucket is not configured')
	return s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }))
}

