import type { UserRoleEnum } from '#src/db/entity/lib'
import { loadingDb } from '#src/pouch/lib/Database'

import PouchCollection from '../../../lib/Collection'
import {createModelHooks} from '../../../lib/hooks'
import PouchModel from '../../../lib/Model'

export const PersonCtx = {db: loadingDb}

interface IPersonExtra {
	name: string
	age: number
	roles: UserRoleEnum[]
	otherInfo: Record<string, any>
}

export class Person extends PouchModel<IPersonExtra> {
	_db = PersonCtx.db
	type = 'profile'
	name: IPersonExtra['name']
	age: IPersonExtra['age']
	roles: IPersonExtra['roles']
	otherInfo: IPersonExtra['otherInfo'] = {}
}

class PersonCollection extends PouchCollection<Person> {
	_db = PersonCtx.db
	_type = 'profile'
	_model = Person
}
export const Persons = new PersonCollection()

export const [usePerson, usePersonS] = createModelHooks<Person>(Persons)


async function test() {
	let profile = new Person({
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

	const collection = new PersonCollection()
	await profile.save()
	profile = await collection.get(profile._id)
	console.log(profile._rev && profile.save ? 'Get Success' : 'Get failed')
	profile = await collection.findOne({selector: {_id: {$in: [profile._id]}}})
	const profiles = await Persons.find({})
	console.log(profile._rev && profile.save ? 'Find Success' : 'Find failed')
}