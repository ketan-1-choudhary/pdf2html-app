export interface SignupRequestBody {
	user_id?: string
	password?: string
}

export interface UserDataItem {
	user_id: string
	type: 'USERDATA'
	passwordHash: string
}
