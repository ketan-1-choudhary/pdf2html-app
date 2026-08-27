import { createError, defineEventHandler, readBody, setCookie } from 'h3'
import { registerUser } from '../../services/signup.service'
import type { SignupRequestBody } from '../../services/interfaces/signup.interface'

export default defineEventHandler(async (event) => {
	const body = await readBody<SignupRequestBody>(event)

	try {
		const user = await registerUser(body)

		setCookie(event, 'session_username', user.user_id, {
			httpOnly: true,
			sameSite: 'lax',
			path: '/',
			maxAge: 60 * 60 * 24 * 7,
		})

		return { username: user.user_id }
	} catch (error: any) {
		console.error('[POST /api/auth/signup] failed:', error)
		if (error?.statusCode) throw error
		throw createError({ statusCode: 500, statusMessage: error?.message ?? 'Unable to create account right now' })
	}
})

