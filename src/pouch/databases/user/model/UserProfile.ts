import { assertValid, assertValidSet, isDefinedAndNotNull } from '#src/lib/validation'
import type { IStandardFields } from '#src/pouch/lib/Database'

import PouchCollection from '../../../lib/Collection'
import {createModelHooks} from '../../../lib/hooks'
import PouchModel from '../../../lib/Model'
import db from '../db'

interface IUserProfileExtra {
	givenName: string
	surname: string
	email: string
	status: UserProfileStatusEnum
	tenants: {id: string, name: string}[]
	defaultTenant?: string
}

export class UserProfile extends PouchModel<IUserProfileExtra> {
	static get db() {return db.handle}
	get db() {return db.handle}
	static type = 'profile'
	type = UserProfile.type
	static indexes = []
	
	surname: IUserProfileExtra['surname']
	givenName: IUserProfileExtra['givenName']
	email: IUserProfileExtra['email']
	status: IUserProfileExtra['status']
	tenants: IUserProfileExtra['tenants']
	defaultTenant: IUserProfileExtra['defaultTenant']
	
	get fullName() {return `${this.givenName} ${this.surname}`}

	async validate() { 
		return assertValidSet<IStandardFields & IUserProfileExtra>(this, {
			...this.baseValidations(),
			type: assertValid('type', this.type, [], {isEqual: {expected: UserProfile.type, message: `type must be ${UserProfile.type}`}}),
			email: assertValid('email', this.email, ['isRequired', 'isString', 'isTruthy', 'isEmail'], {}, [
				await this.validateFieldIsUnique('email', 'email is not available')
			]),
			status: assertValid('status', this.status, ['isRequired', 'isNumber'], { isOneOfSet: UserProfileStatusSet }),
			surname: assertValid('surname', this.surname, ['isRequired', 'isString'], { isLongerThan: 2, isShorterThan: 30 }),
			givenName: assertValid('givenName', this.givenName, ['isRequired', 'isString'], { isLongerThan: 2, isShorterThan: 30 }),
			tenants: assertValid('tenants', this.tenants, ['isRequired', 'isArray']),
			defaultTenant: assertValid('defaultTenant', this.defaultTenant, ['isRequired', 'isString'])
		})
	}
}

class UserProfileCollection extends PouchCollection<UserProfile> {
	model = UserProfile
}
export const UserProfiles = new UserProfileCollection()

export const [useUserProfile, useUserProfiles, useUserProfileCount, useUserProfileS, useUserProfilesS, useUserProfileCountS] = createModelHooks<UserProfile>(UserProfiles)

export enum UserProfileStatusEnum {
  PENDING = 'pending',
  ACTIVE = 'active',
  BANNED = 'banned',
}
export const UserProfileStatusSet = new Set(Enum.getEnumValues(UserProfileStatusEnum))