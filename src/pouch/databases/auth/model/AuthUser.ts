import { assertValid, assertValidSet, isDefinedAndNotNull } from '#src/lib/validation'
import type { IStandardFields } from '#src/pouch/lib/Database'

import PouchCollection from '../../../lib/Collection'
import {createModelHooks} from '../../../lib/hooks'
import PouchModel from '../../../lib/Model'
import db from '../db'

interface IAuthUserExtra {
	name: string
	password: string
	password_scheme: string
	iterations: number
	derived_key: string
	salt: string
	surname: string
	givenName: string
	roles: AuthUserRoleEnum[]
	status: AuthUserStatusEnum
}

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
	surname: IAuthUserExtra['surname']
	givenName: IAuthUserExtra['givenName']
	roles: IAuthUserExtra['roles']
	status: IAuthUserExtra['status']

	async validate() { 
		return assertValidSet<IStandardFields & IAuthUserExtra>(this, {
			...this.baseValidations(),
			_id: assertValid('_id', this._id, ['isRequired', 'isString'], { isEqual: {expected: `org.couchdb.user:${this.name}`} }),
			name: assertValid('name', this.name, ['isRequired', 'isString', 'isTruthy', 'isEmail'], {}, [
				await this.validateFieldIsUnique('name', 'email is not available')
			]),
			type: assertValid('type', this.type, [], {isEqual: {expected: AuthUser.type, message: `type must be ${AuthUser.type}`}}),
			password: isDefinedAndNotNull(this.password) && assertValid('password', this.password, ['isRequired', 'isString', 'isTruthy', 'isPassword']),
			password_scheme: isDefinedAndNotNull(this.password_scheme) && assertValid('password_scheme', this.password_scheme, ['isRequired', 'isString'], { isEqual: {expected: 'pbkdf2'} }),
			iterations: isDefinedAndNotNull(this.iterations) && assertValid('iterations', this.iterations, ['isRequired', 'isNumber'], { isEqual: {expected: 10} }),
			derived_key: isDefinedAndNotNull(this.derived_key) && assertValid('derived_key', this.derived_key, ['isRequired', 'isString'], { isLongerThan: 25, isShorterThan: 60 }),
			salt: isDefinedAndNotNull(this.salt) && assertValid('salt', this.salt, ['isRequired', 'isString'], { isLongerThan: 20, isShorterThan: 50 }),
			surname: assertValid('surname', this.surname, ['isRequired', 'isString'], { isLongerThan: 2, isShorterThan: 30 }),
			givenName: assertValid('givenName', this.givenName, ['isRequired', 'isString'], { isLongerThan: 2, isShorterThan: 30 }),
			status: assertValid('status', this.status, ['isRequired', 'isNumber'], { isOneOfSet: AuthUserStatusSet }),
			roles: assertValid('roles', this.roles, ['isRequired', 'isArray', 'isNoneEmpty'], { arrayValuesAreOneOfSet: AuthUserRoleSet }),
		})
	}
}

class AuthUserCollection extends PouchCollection<AuthUser> {
	model = AuthUser
}
export const AuthUsers = new AuthUserCollection()

export const [useAuthUser, useAuthUsers, useAuthUserS, useAuthUsersS] = createModelHooks<AuthUser>(AuthUsers)

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
