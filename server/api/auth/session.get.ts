import { createError, defineEventHandler, getCookie } from 'h3'

export default defineEventHandler((event) => {
	const username = getCookie(event, 'session_username')

	if (!username) {
		throw createError({
			statusCode: 401,
			statusMessage: 'Not authenticated',
		})
	}

	return { username }
})