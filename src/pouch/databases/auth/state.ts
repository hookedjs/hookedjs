import { assertAttrsWithin, assertValid, assertValidSet, throwValidationErrorSet } from '#lib/validation'

import Database, { loadingDb } from '../../lib/Database'
import { destroyDatabases, initDatabases } from '../../lib/state'
import db from './db'
import { AuthUser, AuthUserRoleEnum } from './model/AuthUser'

export async function initAuthDb() {
	destroyAuthDb()
	const auth = readAuth()
	if (auth && auth.roles.includes(AuthUserRoleEnum.ADMIN)) {
		db.handle = new Database('_users', db.host)
		await db.handle.sync()
		await db.handle.indexModels([AuthUser])
	}
}

export function destroyAuthDb() {
	db.handle.destroy()
	db.handle = loadingDb
}

const host = 'https://localhost:3000/db'

export interface Auth {ok: boolean, name: string, roles: AuthUserRoleEnum[]}

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

export function readAuth(): Auth {
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
	return json as unknown as Auth
}

export async function cookieClear() {
	const res = await fetch(`${host}/_session`, {method: 'DELETE'})
	if (!res.ok) throw new Error(`Could not clear cookie: ${res.status}`)
}

export class LoginProps {
		email = ''
		password = ''
		constructor(props: any) {
			assertAttrsWithin(props, this)
			assertValidSet<LoginProps>(props, {
				email: assertValid('email', props.email, ['isDefined', 'isString', 'isEmail']),
				password: assertValid('password', props.password, ['isDefined', 'isString', 'isNoneEmpty']),
			})
			Object.assign(this, props)
		}
}
export const LoginPropsExample = new LoginProps({
	email: 'tenant@hookedjs.org',
	password: 'password',
})
export const LoginPropsEnum = Enum.getEnumFromClassInstance(LoginPropsExample)


export class RegisterProps {
		email = ''
		password = ''
		givenName = ''
		surname = ''
		acceptedTerms = false
		constructor(props: any) {
			assertAttrsWithin(props, this)
			assertValidSet<RegisterProps>(props, {
				email: assertValid('email', props.email, ['isDefined', 'isString', 'isEmail']),
				password: assertValid('password', props.password, ['isDefined', 'isString', 'isNoneEmpty', 'isPassword']),
				givenName: assertValid('givenName', props.givenName, ['isDefined', 'isString', 'isNoneEmpty']),
				surname: assertValid('surname', props.surname, ['isDefined', 'isString', 'isNoneEmpty']),
				acceptedTerms: assertValid('acceptedTerms', props.acceptedTerms, ['isDefined', 'isBoolean', 'isTruthy']),
			})
			Object.assign(this, props)
		}
}
export const RegisterPropsExample = new RegisterProps({
	email: 'admin@example.com',
	password: 'Password8',
	givenName: 'Sally',
	surname: 'Fields',
	acceptedTerms: true,
})
export const RegisterPropsEnum = Enum.getEnumFromClassInstance(RegisterPropsExample)


