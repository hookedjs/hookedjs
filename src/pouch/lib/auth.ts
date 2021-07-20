import { throwValidationErrorSet } from '#src/lib/validation'

import type { DbUserRoleEnum } from './auth.lib'
import { destroyDatabases, initDatabases } from './state'

const host = 'https://localhost:3000/db'

export async function login(username: string, password: string) {
	const auth = await cookieAuth(username, password)
		.catch(e => throwValidationErrorSet({}, 'email and/or password invalid'))
	localStorage.setItem('auth', JSON.stringify(auth))
	await initDatabases()
	return auth
}

export async function logout() {
	await cookieClear()
	await destroyDatabases()
	localStorage.removeItem('auth')
}

export function readAuth() {
	const auth = localStorage.getItem('auth')
	return auth ? JSON.parse(auth) : null
}

export async function cookieAuth(username: string, password: string) {
	const res = await fetch(`${host}/_session`, {
		method: 'POST',
		body: JSON.stringify({name: username, password}),
		credentials: 'include',
		headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
	})
	if (!res.ok) throw new Error(`Could not login: ${res.status}`)
	const json = await res.json()
	return json as unknown as {ok: boolean, name: string, roles: DbUserRoleEnum[]}
}

export async function cookieClear() {
	const res = await fetch(`${host}/_session`, {method: 'DELETE'})
	if (!res.ok) throw new Error(`Could not clear cookie: ${res.status}`)
}

