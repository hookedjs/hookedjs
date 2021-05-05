import 'reflect-metadata'

import * as glob from 'glob'
import { createConnection } from 'typeorm'

;(async function main() {
	const connection = await createConnection()

	const seedFiles: string[] = glob.sync(__dirname + '/entity/**/seed.ts')
	await Promise.all(seedFiles.map(f => require(f).default()))

	connection.close()
})()