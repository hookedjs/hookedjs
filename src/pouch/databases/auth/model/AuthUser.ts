import { useInterval, useLayoutEffect, useLayoutEffectDeep, useState } from '#src/lib/hooks'
import { assertAttrsWithin, assertValid, assertValidSet, isDefined, isDefinedAndNotNull, throwForbiddenError, ValueError } from '#src/lib/validation'
import type { IStandardFields } from '#src/pouch/lib/Database'
import { AuthStore, useAuthStore } from '#src/stores'

import PouchCollection from '../../../lib/Collection'
import {createModelHooks} from '../../../lib/hooks'
import PouchModel from '../../../lib/Model'
import { readAuth } from '..'
import db from '../db'

export interface IAuthUserExtra {
	name: string
	password?: string
	password_scheme?: string
	iterations?: number
	derived_key?: string
	salt?: string
	passwordTmp?: string
	passwordTmpAt?: Date
	failedLoginAttempts?: number
	failedLoginAttemptAt?: Date
	bannedAt?: Date
	bannedReason?: string
	givenName: string
	surname: string
	roles: AuthUserRoleEnum[]
	status: AuthUserStatusEnum
	tenants: {id: string, name: string}[],
	defaultTenantId?: string
}
export interface IAuthUser extends IStandardFields, IAuthUserExtra {}

export class AuthUser extends PouchModel<IAuthUserExtra> {
	static get db() {return db.handle}
	get db() {return db.handle}
	static type = 'user'
	type = AuthUser.type
	static indexes = []


	name: IAuthUserExtra['name']
	password: IAuthUserExtra['password']
	password_scheme: IAuthUserExtra['password_scheme']
	iterations: IAuthUserExtra['iterations']
	derived_key: IAuthUserExtra['derived_key']
	salt: IAuthUserExtra['salt']
	passwordTmp: IAuthUserExtra['passwordTmp']
	passwordTmpAt: IAuthUserExtra['passwordTmpAt']
	failedLoginAttempts: IAuthUserExtra['failedLoginAttempts']
	failedLoginAttemptAt: IAuthUserExtra['failedLoginAttemptAt']
	bannedAt: IAuthUserExtra['bannedAt']
	bannedReason: IAuthUserExtra['bannedReason']
	givenName: IAuthUserExtra['givenName']
	surname: IAuthUserExtra['surname']
	roles: IAuthUserExtra['roles']
	status: IAuthUserExtra['status']
	tenants: IAuthUserExtra['tenants']
	defaultTenantId: IAuthUserExtra['defaultTenantId']

	get fullName() {return `${this.givenName} ${this.surname}`}

	// Ensure password never hangs around
	async save() {
		await super.save()
		delete this.password
		return this
	}

	async validate() {
		return assertValidSet<IStandardFields & IAuthUserExtra>(this, {
			...this.baseValidations(),
			_id: assertValid('_id', this._id, ['isRequired', 'isString'], { isEqual: {expected: `org.couchdb.user:${this.name}`} }),
			name: assertValid('name', this.name, ['isRequired', 'isString', 'isTruthy', 'isEmail'], {}, [
				// This doesn't work for AuthUser, because _id is computered from name :-/
				// await this.validateFieldIsUnique('name', 'email is already claimed')
				this.name !== this.valuesClean.name && new ValueError('email cannot be changed')
			]),
			type: assertValid('type', this.type, [], {isEqual: {expected: AuthUser.type, message: `type must be ${AuthUser.type}`}}),
			password: isDefinedAndNotNull(this.password) && assertValid('password', this.password, ['isRequired', 'isString', 'isTruthy']),
			password_scheme: false,
			iterations: false,
			derived_key: false,
			salt: false,
			passwordTmp: isDefined(this.passwordTmp) && assertValid('passwordTmp', this.passwordTmp, ['isString', 'isTruthy']),
			passwordTmpAt: isDefined(this.passwordTmpAt) && assertValid('passwordTmpAt', this.passwordTmpAt, ['isDate']),
			failedLoginAttempts: isDefined(this.failedLoginAttempts) && assertValid('failedLoginAttempts', this.failedLoginAttempts, ['isNumber']),
			failedLoginAttemptAt: isDefined(this.failedLoginAttemptAt) && assertValid('failedLoginAttemptAt', this.failedLoginAttemptAt, ['isDate']),
			givenName: assertValid('givenName', this.givenName, ['isRequired', 'isString'], { isLongerThan: 2, isShorterThan: 30 }),
			surname: assertValid('surname', this.surname, ['isRequired', 'isString'], { isLongerThan: 2, isShorterThan: 30 }),
			status: assertValid('status', this.status, ['isRequired'], { isOneOfSet: AuthUserStatusSet }),
			bannedAt: isDefined(this.bannedAt) && assertValid('bannedAt', this.bannedAt, ['isDate']),
			bannedReason: isDefined(this.bannedReason) && assertValid('bannedReason', this.bannedReason, ['isString', 'isTruthy']),
			roles: assertValid('roles', this.roles, ['isRequired', 'isArray'], { arrayValuesAreOneOfSet: AuthUserRoleSet }),
			tenants: assertValid('tenants', this.tenants, ['isRequired', 'isArray']),
			defaultTenantId: assertValid('defaultTenantId', this.defaultTenantId, ['isRequired', 'isString']),
		})
	}

	async ban(reason: IAuthUserExtra['bannedReason']) {
		this.status = AuthUserStatusEnum.BANNED
		this.bannedAt = new Date()
		this.bannedReason = reason
		await this.save()
	}
}

class AuthUserCollection extends PouchCollection<AuthUser> {
	model = AuthUser

	current: AuthUser | undefined = undefined
	async getCurrent() {
		const name = readAuth()?.name ?? throwForbiddenError()
		this.current = await this.get(`org.couchdb.user:${name}`)
		return this.current
	}
}
export const AuthUsers = new AuthUserCollection()

export const [useAuthUser, useAuthUsers, useAuthUserCount, useAuthUserS, useAuthUsersS, useAuthUserCountS] = createModelHooks<AuthUser>(AuthUsers)

export function useCurrentUser() {
	const [auth] = useAuthStore()
	const isAdmin = auth.roles.includes(AuthUserRoleEnum.ADMIN)
	const [user, setUser] = useState(isAdmin ? adminUser : AuthUsers.current)
	useLayoutEffectDeep(() => {onAuthChange()}, [auth])
	return user!

	async function onAuthChange() {
		setUser(isAdmin ? adminUser : await AuthUsers.getCurrent())
	}
}

export enum AuthUserRoleEnum {
  ADMIN = '_admin',
}
export const AuthUserRoleSet = new Set(Enum.getEnumValues(AuthUserRoleEnum))

export enum AuthUserStatusEnum {
  PENDING = 'pending',
  ACTIVE = 'active',
  BANNED = 'banned',
}
export const AuthUserStatusSet = new Set(Enum.getEnumValues(AuthUserStatusEnum))

export const AuthUserExampleCreateFields: IAuthUserExtra = {
	name: 'sallyfields@hookedjs.org',
	password: 'Password8',
	bannedAt: undefined,
	bannedReason: undefined,
	surname: 'Sally',
	givenName: 'Fields',
	roles: [],
	status: AuthUserStatusEnum.ACTIVE,
	tenants: [],
	defaultTenantId: undefined,
}

export const AuthUserExampleFields: IAuthUser = {
	...PouchModel.mockStandardFields,
	...AuthUserExampleCreateFields,
	password_scheme: 'pbkdf2',
	iterations: 10,
	derived_key: 'test',
	salt: 'test',
}

export const AuthUserExample = new AuthUser(AuthUserExampleFields)

export const AuthUserFieldsEnum = Enum.getEnumFromClassInstance(AuthUserExample)

export class LoginProps {
	name = ''
	password = ''
	constructor(props: any) {
		assertAttrsWithin(props, this)
		assertValidSet<LoginProps>(props, {
			name: assertValid('name', props.name, ['isDefined', 'isString', 'isEmail']),
			password: assertValid('password', props.password, ['isDefined', 'isTruthy']),
		})
		Object.assign(this, props)
	}
}
export const LoginPropsExample = new LoginProps(Object.pick(AuthUserExampleCreateFields, ['name', 'password']))
export const LoginPropsEnum = Enum.getEnumFromClassInstance(LoginPropsExample)

export class PasswordTmpProps {
	name = ''
	constructor(props: any) {
		assertAttrsWithin(props, this)
		assertValidSet<PasswordTmpProps>(props, {
			name: assertValid('name', props.name, ['isDefined', 'isString', 'isEmail']),
		})
		Object.assign(this, props)
	}
}
export const PasswordTmpPropsExample = new PasswordTmpProps(Object.pick(AuthUserExampleCreateFields, ['name']))
export const PasswordTmpPropsEnum = Enum.getEnumFromClassInstance(PasswordTmpPropsExample)

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
			password: assertValid('password', props.password, ['isRequired', 'isString', 'isPassword']),
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


const adminUser: AuthUser = new AuthUser({
	_id: 'admin',
	_rev: '',
	type: AuthUser.type,
	version: 0,
	name: 'admin@hookedjs.org',
	createdAt: new Date(),
	updatedAt: new Date(),
	givenName: 'Admin',
	surname: 'Admin',
	roles: [AuthUserRoleEnum.ADMIN],
	status: AuthUserStatusEnum.ACTIVE,
	tenants: [],
	password: undefined,
	password_scheme: undefined,
	iterations: undefined,
	derived_key: undefined,
	salt: undefined,
	defaultTenantId: undefined,
	bannedAt: undefined,
	bannedReason: undefined,
})