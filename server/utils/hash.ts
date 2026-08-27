import { createHash } from 'node:crypto'

// Single source of truth so signup and login always hash the same way.
export function hashPassword(password: string): string {
	return createHash('sha256').update(password).digest('hex')
}
