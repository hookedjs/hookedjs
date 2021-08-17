import { assertValid, assertValidSet, isDefined, isDefinedAndNotNull } from '#src/lib/validation'
import type { IStandardFields } from '#src/pouch/lib/Database'

import PouchCollection from '../../../lib/Collection'
import {createModelHooks} from '../../../lib/hooks'
import PouchModel from '../../../lib/Model'
import db from '../db'

export interface IAuthUserExtra {
	name: string
	password?: string
	password_scheme?: string
	iterations?: number
	derived_key?: string
	salt?: string
	givenName: string
	surname: string
	roles: AuthUserRoleEnum[]
	status: AuthUserStatusEnum
	bannedAt?: Date
	bannedReason?: string
	tenants: string[]
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
	givenName: IAuthUserExtra['givenName']
	surname: IAuthUserExtra['surname']
	roles: IAuthUserExtra['roles']
	status: IAuthUserExtra['status']
	bannedAt: IAuthUserExtra['bannedAt']
	bannedReason: IAuthUserExtra['bannedReason']
	tenants: IAuthUserExtra['tenants']

	get fullName() {return `${this.givenName} ${this.surname}`}

	async validate() {
		return assertValidSet<IStandardFields & IAuthUserExtra>(this, {
			...this.baseValidations(),
			_id: assertValid('_id', this._id, ['isRequired', 'isString'], { isEqual: {expected: `org.couchdb.user:${this.name}`} }),
			name: assertValid('email', this.name, ['isRequired', 'isString', 'isTruthy', 'isEmail'], {}, [
				// This doesn't work for AuthUser, because _id is computered from name :-/
				// await this.validateFieldIsUnique('name', 'email is already claimed')
			]),
			type: assertValid('type', this.type, [], {isEqual: {expected: AuthUser.type, message: `type must be ${AuthUser.type}`}}),
			password: isDefinedAndNotNull(this.password) && assertValid('password', this.password, ['isRequired', 'isString', 'isTruthy', 'isPassword']),
			password_scheme: false,
			iterations: false,
			derived_key: false,
			salt: false,
			givenName: assertValid('givenName', this.givenName, ['isRequired', 'isString'], { isLongerThan: 2, isShorterThan: 30 }),
			surname: assertValid('surname', this.surname, ['isRequired', 'isString'], { isLongerThan: 2, isShorterThan: 30 }),
			status: assertValid('status', this.status, ['isRequired'], { isOneOfSet: AuthUserStatusSet }),
			bannedAt: isDefined(this.bannedAt) && assertValid('bannedAt', this.bannedAt, ['isDate']),
			bannedReason: isDefined(this.bannedReason) && assertValid('bannedReason', this.bannedReason, ['isRequired', 'isString', 'isTruthy']),
			roles: assertValid('roles', this.roles, ['isRequired', 'isArray'], { arrayValuesAreOneOfSet: AuthUserRoleSet }),
			tenants: assertValid('tenants', this.tenants, ['isRequired', 'isArray']),
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
}
export const AuthUsers = new AuthUserCollection()

export const [useAuthUser, useAuthUsers, useAuthUserCount, useAuthUserS, useAuthUsersS, useAuthUserCountS] = createModelHooks<AuthUser>(AuthUsers)

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
	name: 'test@hookedjs.org',
	password: '',
	surname: 'test',
	givenName: 'test',
	roles: [],
	status: AuthUserStatusEnum.ACTIVE,
	tenants: [],
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