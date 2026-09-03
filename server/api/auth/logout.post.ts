import { defineEventHandler, deleteCookie } from 'h3'

export default defineEventHandler((event) => {
	deleteCookie(event, 'session_username', { path: '/' })
	return { ok: true }
})
