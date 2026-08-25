
import { createError, defineEventHandler, readBody } from 'h3'



export default defineEventHandler(async (event) => {
	const body = await readBody<{
		user_id?: string
		password?: string
	}>(event)

	if (!body.user_id || !body.password) {
		throw createError({
			statusCode: 400,
			statusMessage: 'user_id and password are required',
		})
	}

	

	return { user_id: body.user_id, type: 'USERDATA' }
})
