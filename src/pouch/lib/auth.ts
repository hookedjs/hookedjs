import { assertAttrsWithin, assertValid, assertValidSet } from '#lib/validation'
import { throwValidationErrorSet } from '#src/lib/validation'

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
	return json as unknown as {ok: boolean, name: string, roles: CouchUserRoleEnum[]}
}

export async function cookieClear() {
	const res = await fetch(`${host}/_session`, {method: 'DELETE'})
	if (!res.ok) throw new Error(`Could not clear cookie: ${res.status}`)
}


export enum CouchUserRoleEnum {
  ADMIN = '_admin',
}
export const CouchUserRoleSet = new Set(Enum.getEnumValues(CouchUserRoleEnum))

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


