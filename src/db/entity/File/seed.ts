import * as fs from 'fs'

import fileStorage from '#src/lib/fileStorage'

import {UserEntity} from '..'
import { FileCreate as CreateType, FileEntity as Entity } from '.'

export default async function seedFiles() {
	console.log('Inserting file records into the database...')

	const user = await UserEntity.createSafe({
		email: 'fileuser@example.com',
		password: 'Password8',
		givenName: 'Sally',
		surname: 'Files',
	})

	fakeRecords = fakeRecords.map(r => ({...r, createdById: user.id}))
	
	const records = await Entity.insertSafe(fakeRecords)
	console.log('Loaded records: ', records)
	const img = await fs.promises.readFile(__dirname + '/seed.jpeg')
	records.identifiers.forEach(({id}) => fileStorage.put(id, img, 'image/jpeg'))

	// const img = await fs.promises.readFile(__dirname + '/seed.jpeg')
	// await Promise.all((await Entity.find()).forEach(r => fileStorage.put(r.id, img, r.type)))
	

	// const record = await Entity.createSafe(fakeRecords[0])
	// console.dir(record)

	// const record = new Entity(fakeRecords[0])
	// await record.saveSafe()
	// console.dir(record)
}

export let fakeRecords: CreateType[] = [
	{
		name: 'seed.jpeg',
		type: 'image/jpeg',
		size: 40,
		md5: 'sldkfj'
	},
	{
		name: 'seed.jpeg',
		type: 'image/jpeg',
		size: 40,
		md5: 'sldkfj'
	},
	{
		name: 'seed.jpeg',
		type: 'image/jpeg',
		size: 40,
		md5: 'sldkfj'
	},
]