import { isOffline, waitForOnline } from '#lib/network'
import { assertAttrsWithin, assertValid, assertValidSet, throwFormValidationErrorSet } from '#lib/validation'

import Database, { loadingDb } from '../../lib/Database'
import { destroyDatabases, initDatabases } from '../../lib/state'
import db from './db'
import { AuthUser, AuthUserExampleCreateFields, AuthUserRoleEnum, AuthUsers } from './model/AuthUser'

export async function initAuthDb() {
	destroyAuthDb()
	const auth = readAuth()
	if (auth?.roles?.includes(AuthUserRoleEnum.ADMIN)) {
		if (isOffline()) {
			db.handle = new Database('_users')
			await db.handle.indexModels([AuthUser])
			waitForOnline().then(initAuthDb)
		}
		else {
			db.handle = new Database('_users', db.host)
			await db.handle.sync()
			await db.handle.indexModels([AuthUser])
		}
	}
	else {
		if (isOffline()) {
			db.handle = new Database('_users', undefined, {skipSetup: true})
		}
		else {
			db.handle = new Database('_users', db.host, {remoteOnly: true, skipSetup: true})
		}
		if (auth.name) {
			await AuthUsers.getCurrent()
		}
	}
}

export function destroyAuthDb() {
	if (db.handle._db !== db.handle._remote) db.handle.destroy()
	db.handle = loadingDb
}

const host = 'https://localhost:3000/db'

export interface Auth {ok: boolean, name: string, roles: AuthUserRoleEnum[]}

export async function login(username: string, password: string) {
	const auth = await cookieAuth(username, password)
		.catch(e => throwFormValidationErrorSet({username, password}, 'email and/or password invalid'))
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
	return auth ? JSON.parse(auth) : {}
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
		name = ''
		password = ''
		constructor(props: any) {
			assertAttrsWithin(props, this)
			assertValidSet<LoginProps>(props, {
				name: assertValid('name', props.name, ['isDefined', 'isString', 'isEmail']),
				password: assertValid('password', props.password, ['isDefined', 'isString', 'isPassword']),
			})
			Object.assign(this, props)
		}
}
export const LoginPropsExample = new LoginProps(Object.pick(AuthUserExampleCreateFields, ['name', 'password']))
export const LoginPropsEnum = Enum.getEnumFromClassInstance(LoginPropsExample)


export class RegisterProps {
		name = ''
		password = ''
		givenName = ''
		surname = ''
		acceptedTerms = false
		constructor(props: any) {
			assertAttrsWithin(props, this)
			assertValidSet<RegisterProps>(props, {
				name: assertValid('name', props.name, ['isDefined', 'isString', 'isEmail']),
				password: assertValid('password', props.password, ['isDefined', 'isString', 'isNoneEmpty', 'isPassword']),
				givenName: assertValid('givenName', props.givenName, ['isDefined', 'isString'], { isLongerThan: 2, isShorterThan: 30 }),
				surname: assertValid('surname', props.surname, ['isDefined', 'isString'], { isLongerThan: 2, isShorterThan: 30 }),
				acceptedTerms: assertValid('acceptedTerms', props.acceptedTerms, ['isDefined', 'isBoolean', 'isTruthy']),
			})
			Object.assign(this, props)
		}
}
export const RegisterPropsExample = new RegisterProps({
	...Object.pick(AuthUserExampleCreateFields, ['name', 'password', 'givenName', 'surname']),
	acceptedTerms: true,
})
export const RegisterPropsEnum = Enum.getEnumFromClassInstance(RegisterPropsExample)


