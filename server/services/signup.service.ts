import { createError } from 'h3'
import { checkUsername } from '../db/fetch.data'
import { putData } from '../db/put.data'
import { hashPassword } from '../utils/hash'
import type { SignupRequestBody, UserDataItem } from './interfaces/signup.interface'

export async function registerUser(body: SignupRequestBody) {
	if (!body.user_id || !body.password) {
		throw createError({ statusCode: 400, statusMessage: 'Username and password are required' })
	}

	if (await checkUsername(body.user_id)) {
		throw createError({ statusCode: 409, statusMessage: 'Username is already taken' })
	}

	const userData: UserDataItem = {
		user_id: body.user_id,
		type: 'USERDATA',
		passwordHash: hashPassword(body.password),
	}

	await putData(userData)

	return { user_id: userData.user_id }
}
