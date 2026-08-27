import { createError } from 'h3'
import { fetchUser } from '../db/fetch.data'
import { hashPassword } from '../utils/hash'
import type { LoginRequestBody } from './interfaces/login.interface'

export async function loginUser(body: LoginRequestBody) {
	if (!body.user_id || !body.password) {
		throw createError({ statusCode: 400, statusMessage: 'Username and password are required' })
	}

	const user = await fetchUser(body.user_id)

	// Same message for missing user and wrong password to avoid leaking which usernames exist.
	if (!user || user.passwordHash !== hashPassword(body.password)) {
		throw createError({ statusCode: 401, statusMessage: 'Invalid username or password' })
	}

	return { user_id: user.user_id }
}
