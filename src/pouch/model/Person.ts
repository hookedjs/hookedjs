import tenantDb from '../databases/tenant'
import PouchCollection from '../lib/Collection'
import PouchModel from '../lib/Model'
import {useDoc, useDocS} from '../lib/useDoc'

interface IPersonExtra {
	name: string
	age: number
	otherInfo: Record<string, any>
}

export class Person extends PouchModel<IPersonExtra> {
	_db = tenantDb
	type = 'person'
	name: IPersonExtra['name']
	age: IPersonExtra['age']
	otherInfo: IPersonExtra['otherInfo'] = {}
}

export class PersonCollection extends PouchCollection<Person> {
	_db = tenantDb
	_type = 'person'
	_model = Person
}
export const personCollection = new PersonCollection()

export function usePerson(id: string) {
	const doc = useDoc<Person>(personCollection, id)
	return {
		...doc,
		data: doc.data ? new Person(doc.data) : undefined,
	}
}

export function usePersonS(id: string) {
	const doc = useDocS<Person>(personCollection, id)
	return new Person(doc)
}


async function test() {
	let person = new Person({
		name: 'John',
		age: 25,
	})
	person = await person.save()
	console.log(person._rev ? 'Save success' : 'Save failed')
	const listener = person.subscribe(doc => console.log(doc.name === 'John2' ? 'Subscribe works!' : 'Subscribe Failed.'))
	person.name = 'John2'
	await person.save()
	await Promise.sleep(1000)
	await listener.cancel()
	person.name = 'John' // If cancel failed, this will cause error.
	await person.delete()
	console.log(person.deletedAt ? 'Delete success' : 'Delete failed')
	// await person.deletePermanent()
	// console.log(person._id ? 'Delete permanenet failed' : 'Delete permanent succeeded!')

	const collection = new PersonCollection()
	await person.save()
	person = await collection.get(person._id)
	console.log(person._rev && person.save ? 'Get Success' : 'Get failed')
	person = await collection.findOne({selector: {_id: {$in: [person._id]}}})
	console.log(person._rev && person.save ? 'Find Success' : 'Find failed')
}
// test()