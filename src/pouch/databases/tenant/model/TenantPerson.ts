import PouchCollection from '../../../lib/Collection'
import {createModelHooks} from '../../../lib/hooks'
import PouchModel from '../../../lib/Model'
import db from '../db'

interface ITenantPersonExtra {
	name: string
	email: string
	age: number
	roles: TenantUserRoleEnum[]
	otherInfo: Record<string, any>
}

export class TenantPerson extends PouchModel<ITenantPersonExtra> {
	static get db() {return db.handle}
	get db() {return db.handle}
	static type = 'person'
	type = TenantPerson.type
	static indexes = ['email']

	name: ITenantPersonExtra['name']
	email: ITenantPersonExtra['email']
	age: ITenantPersonExtra['age']
	roles: ITenantPersonExtra['roles']
	otherInfo: ITenantPersonExtra['otherInfo']
}

class TenantPersonCollection extends PouchCollection<TenantPerson> {
	model = TenantPerson
}
export const TenantPersons = new TenantPersonCollection()

export const [useTenantPerson, useTenantPersons, useTenantPersonS, useTenantPersonsS] = createModelHooks<TenantPerson>(TenantPersons)


// import { assertValid, assertValidSet, isDefined, isDefinedAndNotNull } from '#lib/validation'


// export type UserCreateOptional = Pick<UserType, 'id' | 'roles' | 'status' | 'password'>
// export type UserCreateRequired = Pick<UserType, 'email' | 'givenName' | 'surname'>
// export type UserCreate = UserCreateRequired & Partial<UserCreateOptional>
// export type UserUpdate = Partial<UserCreate>

export enum TenantUserRoleEnum {
  ADMIN = 'admin',
  // STAFF = 'staff',
}
export const TenantUserRoleSet = new Set(Enum.getEnumValues(TenantUserRoleEnum))

export enum UserStatusEnum {
  PENDING = 'pending',
  ACTIVE = 'active',
  BANNED = 'banned',
}
export const UserStatusSet = new Set(Enum.getEnumValues(UserStatusEnum))

// export function UserValidate(record: any) {
// 	assertValidSet<UserType>(record, {
// 		...BaseEntityValidations(record),
// 		email: assertValid('email', record.email, ['isRequired', 'isString', 'isTruthy', 'isEmail']),
// 		password: isDefinedAndNotNull(record.password) && assertValid('password', record.password, ['isString', 'isNoneEmpty', 'isPassword']),
// 		passwordHash: isDefinedAndNotNull(record.passwordHash) && assertValid('passwordHash', record.passwordHash, ['isString', 'isHash']),
// 		passwordUpdatedAt: isDefined(record.passwordUpdatedAt) && assertValid('passwordUpdatedAt', record.passwordUpdatedAt, ['isDate']),
// 		status: assertValid('status', record.status, ['isRequired', 'isNumber'], { isOneOfSet: UserStatusSet }),
// 		roles: assertValid('roles', record.roles, ['isRequired', 'isArray', 'isNoneEmpty'], { arrayValuesAreOneOfSet: DbUserRoleSet }),
// 		surname: assertValid('surname', record.surname, ['isRequired', 'isString'], { isLongerThan: 2, isShorterThan: 30 }),
// 		givenName: assertValid('givenName', record.givenName, ['isRequired', 'isString'], { isLongerThan: 2, isShorterThan: 30 }),
// 		files: false,
// 	})
// }