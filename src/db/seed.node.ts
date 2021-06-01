import 'reflect-metadata'

import * as glob from 'glob'
import { createConnection } from 'typeorm'

import { UserEntity } from './entity';
(async function main() {
	const connection = await createConnection()

	console.log(await UserEntity.find({take: 1}))

	if ((await UserEntity.find({take: 1})).length)
		throw new Error('the database is dirty and cannot be seeded')

	const seedFiles: string[] = glob.sync(__dirname + '/entity/**/seed.node.ts')
		.filter(f => f.includes('File'))
	await Promise.all(seedFiles.map(f => require(f).default()))

	connection.close()
})()