import { createError, getCookie, type H3Event } from 'h3'

// Drafts are scoped to the signed-in user; the cookie is the source of truth.
export function requireUserId(event: H3Event): string {
	const user_id = getCookie(event, 'session_username')
	if (!user_id) {
		throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
	}
	return user_id
}
