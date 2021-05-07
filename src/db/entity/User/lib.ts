import { assertValid, assertValidSet, isDefined, isDefinedAndNotNull } from '#lib/validation'

import { BaseEntityType, BaseEntityValidations } from '../base/BaseEntity.lib'
import type { FileType } from '../lib'

export interface UserType extends BaseEntityType {
  email: string
  roles: UserRoleEnum[]
  status: UserStatusEnum
  password?: string
  passwordHash: string | null
  passwordUpdatedAt: Date
  givenName: string
  surname: string
  files: FileType[]
}

export type UserCreateOptional = Pick<UserType, 'id' | 'roles' | 'status' | 'password'>
export type UserCreateRequired = Pick<UserType, 'email' | 'givenName' | 'surname'>
export type UserCreate = UserCreateRequired & Partial<UserCreateOptional>
export type UserUpdate = Partial<UserCreate>

export enum UserRoleEnum {
  ADMIN = 0,
  EDITOR = 1,
  AUTHOR = 2,
}
export const UserRoleSet = new Set(Enum.getEnumValues(UserRoleEnum))

export enum UserStatusEnum {
  PENDING = 0,
  ACTIVE = 1,
  BANNED = 2,
}
export const UserStatusSet = new Set(Enum.getEnumValues(UserStatusEnum))

export function UserValidate(record: any) {
	assertValidSet<UserType>(record, {
		...BaseEntityValidations(record),
		email: assertValid('email', record.email, ['isRequired', 'isString', 'isTruthy', 'isEmail']),
		password: isDefinedAndNotNull(record.password) && assertValid('password', record.password, ['isString', 'isNoneEmpty', 'isPassword']),
		passwordHash: isDefinedAndNotNull(record.passwordHash) && assertValid('passwordHash', record.passwordHash, ['isString', 'isHash']),
		passwordUpdatedAt: isDefined(record.passwordUpdatedAt) && assertValid('passwordUpdatedAt', record.passwordUpdatedAt, ['isDate']),
		status: assertValid('status', record.status, ['isRequired', 'isNumber'], { isOneOfSet: UserStatusSet }),
		roles: assertValid('roles', record.roles, ['isRequired', 'isArray', 'isNoneEmpty'], { arrayValuesAreOneOfSet: UserRoleSet }),
		surname: assertValid('surname', record.surname, ['isRequired', 'isString'], { isLongerThan: 2, isShorterThan: 30 }),
		givenName: assertValid('givenName', record.givenName, ['isRequired', 'isString'], { isLongerThan: 2, isShorterThan: 30 }),
		files: false,
	})
}