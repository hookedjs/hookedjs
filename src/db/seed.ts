import 'reflect-metadata'

import * as glob from 'glob'
import { createConnection } from 'typeorm'

import { FormValidationErrorSet } from '#src/lib/validation'

import { UserEntity } from './entity';
(async function main() {
	const connection = await createConnection()

	if (await UserEntity.find({take: 1}))
		throw new FormValidationErrorSet({}, 'the database is dirty and cannot be seeded')

	const seedFiles: string[] = glob.sync(__dirname + '/entity/**/seed.ts')
	await Promise.all(seedFiles.map(f => require(f).default()))

	connection.close()
})()