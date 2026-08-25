import { createHash } from 'node:crypto'
import { putData } from '../db/put.data'

export async function registerUser(body: {
	user_id?: string
	password?: string
}) {
	if (!body.user_id || !body.password) {
		throw new Error('user_id and password are required')
	}

	const passwordHash = createHash('sha256')
		.update(body.password)
		.digest('hex')

	return await putData({
		user_id: body.user_id,
		type: 'USERDATA',
		passwordHash,
	})
}
