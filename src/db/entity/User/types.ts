import type { BaseEntityType } from '../base/BaseEntityTypes'
import type { FileType } from '../types'

export interface UserType extends BaseEntityType {
  email: string
	rolesJson: string
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