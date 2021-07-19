import { loadingDb } from '#src/pouch/lib/Database'

import PouchCollection from '../../../lib/Collection'
import {createModelHooks} from '../../../lib/hooks'
import PouchModel from '../../../lib/Model'
import db from '../db'

interface IUserProfileExtra {
	name: string
	age: number
	email: string
	tenants: {slug: string, name: string}[]
	defaultTenant?: string
	otherInfo: Record<string, any>
}

export class UserProfile extends PouchModel<IUserProfileExtra> {
	static get db() {return db.handle}
	get db() {return db.handle}
	static type = 'profile'
	type = UserProfile.type
	name: IUserProfileExtra['name']
	age: IUserProfileExtra['age']
	email: IUserProfileExtra['email']
	tenants: IUserProfileExtra['tenants'] = []
	defaultTenant: IUserProfileExtra['defaultTenant']
	otherInfo: IUserProfileExtra['otherInfo'] = {}
}

class UserProfileCollection extends PouchCollection<UserProfile> {
	model = UserProfile
}
export const UserProfiles = new UserProfileCollection()

export const [useUserProfile, useUserProfileS] = createModelHooks<UserProfile>(UserProfiles)



async function test() {
	let profile = new UserProfile({
		name: 'John',
		age: 25,
	})
	profile = await profile.save()
	console.log(profile._rev ? 'Save success' : 'Save failed')
	const listener = profile.subscribe(doc => console.log(doc.name === 'John2' ? 'Subscribe works!' : 'Subscribe Failed.'))
	profile.name = 'John2'
	await profile.save()
	await Promise.sleep(1000)
	await listener.cancel()
	profile.name = 'John' // If cancel failed, this will cause error.
	await profile.delete()
	console.log(profile.deletedAt ? 'Delete success' : 'Delete failed')
	// await profile.deletePermanent()
	// console.log(profile._id ? 'Delete permanenet failed' : 'Delete permanent succeeded!')

	const collection = new UserProfileCollection()
	await profile.save()
	profile = await collection.get(profile._id)
	console.log(profile._rev && profile.save ? 'Get Success' : 'Get failed')
	profile = await collection.findOne({selector: {_id: {$in: [profile._id]}}})
	console.log(profile._rev && profile.save ? 'Find Success' : 'Find failed')
}
// test()