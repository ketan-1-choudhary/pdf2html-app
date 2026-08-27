import { createError, defineEventHandler, readBody, setCookie } from 'h3'
import { loginUser } from '../../services/login.service'
import type { LoginRequestBody } from '../../services/interfaces/login.interface'

export default defineEventHandler(async (event) => {
	const body = await readBody<LoginRequestBody>(event)

	try {
		const user = await loginUser(body)

		setCookie(event, 'session_username', user.user_id, {
			httpOnly: true,
			sameSite: 'lax',
			path: '/',
			maxAge: 60 * 60 * 24 * 7,
		})

		return { username: user.user_id }
	} catch (error: any) {
		console.error('[POST /api/auth/login] failed:', error)
		if (error?.statusCode) throw error
		throw createError({ statusCode: 500, statusMessage: error?.message ?? 'Unable to sign in right now' })
	}
})
