import { assertValid, assertValidSet } from '#src/lib/validation'
import type { IStandardFields } from '#src/pouch/lib/Database'

import PouchCollection from '../../../lib/Collection'
import {createModelHooks} from '../../../lib/hooks'
import PouchModel from '../../../lib/Model'
import db from '../db'

interface ITenantPersonExtra {
	surname: string
	givenName: string
	email: string
	roles: TenantPersonRoleEnum[]
	status: TenantPersonStatusEnum
}

export class TenantPerson extends PouchModel<ITenantPersonExtra> {
	static get db() {return db.handle}
	get db() {return db.handle}
	static type = 'person'
	type = TenantPerson.type
	static indexes = ['email']

	surname: ITenantPersonExtra['surname']
	givenName: ITenantPersonExtra['givenName']
	email: ITenantPersonExtra['email']
	roles: ITenantPersonExtra['roles']
	status: ITenantPersonExtra['status']

	async validate() { 
		return assertValidSet<IStandardFields & ITenantPersonExtra>(this, {
			...this.baseValidations(),
			type: assertValid('type', this.type, [], {isEqual: {expected: TenantPerson.type, message: `type must be ${TenantPerson.type}`}}),
			email: assertValid('email', this.email, ['isRequired', 'isString', 'isTruthy', 'isEmail'], {}, [
				await this.validateFieldIsUnique('email', 'email is not available')
			]),
			status: assertValid('status', this.status, ['isRequired', 'isNumber'], { isOneOfSet: TenantPersonStatusSet }),
			roles: assertValid('roles', this.roles, ['isRequired', 'isArray', 'isNoneEmpty'], { arrayValuesAreOneOfSet: TenantPersonRoleSet }),
			surname: assertValid('surname', this.surname, ['isRequired', 'isString'], { isLongerThan: 2, isShorterThan: 30 }),
			givenName: assertValid('givenName', this.givenName, ['isRequired', 'isString'], { isLongerThan: 2, isShorterThan: 30 }),
		})
	}
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

export enum TenantPersonRoleEnum {
  ADMIN = 'admin',
  // STAFF = 'staff',
}
export const TenantPersonRoleSet = new Set(Enum.getEnumValues(TenantPersonRoleEnum))

export enum TenantPersonStatusEnum {
  PENDING = 'pending',
  ACTIVE = 'active',
  BANNED = 'banned',
}
export const TenantPersonStatusSet = new Set(Enum.getEnumValues(TenantPersonStatusEnum))
