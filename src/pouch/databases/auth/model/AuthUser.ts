import { nanoid } from 'nanoid'

import { useLayoutEffectDeep, useState } from '#src/lib/hooks'
import { assertAttrsWithin, assertValid, assertValidSet, isDefined, isDefinedAndNotNull, throwForbiddenError, ValueError } from '#src/lib/validation'
import type { IStandardFields } from '#src/pouch/lib/Database'
import { useAuthStore } from '#src/stores'

import PouchCollection from '../../../lib/Collection'
import {createModelHooks} from '../../../lib/hooks'
import PouchModel from '../../../lib/Model'
import { TenantPersonRoleEnum, TenantPersons, TenantPersonStatusEnum } from '../../tenant'
import { initTenantDbApi, tenantDbPrefix } from '../../tenant/state'
import { readAuth } from '..'
import db from '../db'

export type IAuthUserExtra = {
	name: string
	roles: AuthUserRoleEnum[]
	password?: string
	password_scheme?: string
	iterations?: number
	derived_key?: string
	salt?: string
	passwordTmp?: string
	passwordTmpAt?: Date
	passwordTmpFailCount?: number
	bannedAt?: Date
	bannedReason?: string
	givenName: string
	surname: string
	status: AuthUserStatusEnum
	tenants: {id: string, name: string}[],
	defaultTenantId?: string
}
export interface IAuthUser extends IStandardFields, IAuthUserExtra {}
export interface IAuthUserCreate extends Partial<IStandardFields>, IAuthUserExtra {}

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
	passwordTmpFailCount: IAuthUserExtra['passwordTmpFailCount']
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
		// Ensure _id always matches name
		this._id = `org.couchdb.user:${this.name}`
		await super.save()
		// refresh to ensure password is replaced by derived_key,salt,iterations
		await this.refresh()
		return this
	}

	async validate() {
		return assertValidSet<IStandardFields & IAuthUserExtra>(this.values, {
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
			passwordTmpFailCount: isDefined(this.passwordTmpFailCount) && assertValid('passwordTmpFailCount', this.passwordTmpFailCount, ['isNumber']),
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

class AuthUserCollection extends PouchCollection<AuthUser, IAuthUserCreate> {
	model = AuthUser

	get(id: string) {
		return super.get(this.autoPrefixId(id))
	}

	autoPrefixId(id: string) {
		const prefixed = id.startsWith('org.couchdb.user:')
			? id
			: `org.couchdb.user:${id}`
		return prefixed
	}

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
	const [user, setUser] = useState(isAdmin ? adminAuthUserStub : AuthUsers.current)
	useLayoutEffectDeep(() => {onAuthChange()}, [auth])
	return user!

	async function onAuthChange() {
		setUser(isAdmin ? adminAuthUserStub : await AuthUsers.getCurrent())
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

export const AuthUserExampleCreateFields: IAuthUserCreate = {
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
		props.name = props.name.toLowerCase()
		Object.assign(this, props)
	}
}
export const LoginPropsExample = new LoginProps(Object.pick(AuthUserExampleCreateFields, ['name', 'password']))
export const LoginPropsEnum = Enum.getEnumFromClassInstance(LoginPropsExample)

export class PasswordRequestProps {
	name = ''
	constructor(props: any) {
		assertAttrsWithin(props, this)
		assertValidSet<PasswordRequestProps>(props, {
			name: assertValid('name', props.name, ['isDefined', 'isString', 'isEmail']),
		})
		props.name = props.name.toLowerCase()
		Object.assign(this, props)
	}
}
export const PasswordRequestPropsExample = new PasswordRequestProps(Object.pick(AuthUserExampleCreateFields, ['name']))
export const PasswordRequestPropsEnum = Enum.getEnumFromClassInstance(PasswordRequestPropsExample)

export class RegisterProps {
	name = ''
	givenName = ''
	surname = ''
	acceptedTerms = false
	constructor(props: any) {
		assertAttrsWithin(props, this)
		assertValidSet<RegisterProps>(props, {
			name: assertValid('name', props.name, ['isDefined', 'isString', 'isEmail']),
			givenName: assertValid('givenName', props.givenName, ['isDefined', 'isString'], { isLongerThan: 2, isShorterThan: 30 }),
			surname: assertValid('surname', props.surname, ['isDefined', 'isString'], { isLongerThan: 2, isShorterThan: 30 }),
			acceptedTerms: assertValid('acceptedTerms', props.acceptedTerms, ['isDefined', 'isBoolean', 'isTruthy']),
		})
		props.name = props.name.toLowerCase()
		Object.assign(this, props)
	}
}
export const RegisterPropsExample = new RegisterProps({
	...Object.pick(AuthUserExampleCreateFields, ['name', 'givenName', 'surname']),
	acceptedTerms: true,
})
export const RegisterPropsEnum = Enum.getEnumFromClassInstance(RegisterPropsExample)


export const adminAuthUserStub: AuthUser = new AuthUser({
	_id: 'admin',
	_rev: '',
	type: AuthUser.type,
	version: 0,
	name: 'admin@hookedjs.org',
	createdAt: new Date(),
	updatedAt: new Date(),
	roles: [AuthUserRoleEnum.ADMIN],
	password: undefined,
	password_scheme: undefined,
	iterations: undefined,
	derived_key: undefined,
	salt: undefined,
	givenName: 'Admin',
	surname: 'Admin',
	status: AuthUserStatusEnum.ACTIVE,
	tenants: [],
	defaultTenantId: undefined,
	bannedAt: undefined,
	bannedReason: undefined,
})