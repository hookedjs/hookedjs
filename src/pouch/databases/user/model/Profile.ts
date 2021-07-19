import { loadingDb } from '#src/pouch/lib/Database'

import PouchCollection from '../../../lib/Collection'
import {createModelHooks} from '../../../lib/hooks'
import PouchModel from '../../../lib/Model'

export const ProfileCtx = {db: loadingDb}

interface IProfileExtra {
	name: string
	age: number
	email: string
	tenants: {slug: string, name: string}[]
	defaultTenant?: string
	otherInfo: Record<string, any>
}

export class Profile extends PouchModel<IProfileExtra> {
	_db = ProfileCtx.db
	type = 'profile'
	name: IProfileExtra['name']
	age: IProfileExtra['age']
	email: IProfileExtra['email']
	tenants: IProfileExtra['tenants'] = []
	defaultTenant: IProfileExtra['defaultTenant']
	otherInfo: IProfileExtra['otherInfo'] = {}
}

class ProfileCollection extends PouchCollection<Profile> {
	_db = ProfileCtx.db
	_type = 'profile'
	_model = Profile
}
export const Profiles = new ProfileCollection()

export const [useProfile, useProfileS] = createModelHooks<Profile>(Profiles)



async function test() {
	let profile = new Profile({
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

	const collection = new ProfileCollection()
	await profile.save()
	profile = await collection.get(profile._id)
	console.log(profile._rev && profile.save ? 'Get Success' : 'Get failed')
	profile = await collection.findOne({selector: {_id: {$in: [profile._id]}}})
	console.log(profile._rev && profile.save ? 'Find Success' : 'Find failed')
}
// test()