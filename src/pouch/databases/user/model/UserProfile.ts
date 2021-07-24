import PouchCollection from '../../../lib/Collection'
import {createModelHooks} from '../../../lib/hooks'
import PouchModel from '../../../lib/Model'
import db from '../db'

interface IUserProfileExtra {
	name: string
	age: number
	email: string
	tenants: {id: string, name: string}[]
	defaultTenant?: string
	otherInfo: Record<string, any>
}

export class UserProfile extends PouchModel<IUserProfileExtra> {
	static get db() {return db.handle}
	get db() {return db.handle}
	static type = 'profile'
	static indexes = []
	
	type = UserProfile.type
	name: IUserProfileExtra['name']
	age: IUserProfileExtra['age']
	email: IUserProfileExtra['email']
	tenants: IUserProfileExtra['tenants']
	defaultTenant: IUserProfileExtra['defaultTenant']
	otherInfo: IUserProfileExtra['otherInfo']
}

class UserProfileCollection extends PouchCollection<UserProfile> {
	model = UserProfile
}
export const UserProfiles = new UserProfileCollection()

export const [useUserProfile, useUserProfiles, useUserProfileS, useUserProfilesS] = createModelHooks<UserProfile>(UserProfiles)

