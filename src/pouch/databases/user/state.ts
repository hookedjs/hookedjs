import { readAuth } from '#src/pouch/lib/auth'

import Database, { loadingDb } from '../../lib/Database'
import db from './db'
import { UserProfile } from './model/UserProfile'

export * from './model/UserProfile'


export async function initUserDb() {
	destroyUserDb()
	const auth = readAuth()
	if (auth) {
		db.handle = new Database(`userdb-${auth.name.replace('@','$').replace(/\./g,'$')}`, db.host)
		await db.handle.connect()
		await db.handle.indexModels([UserProfile])
	}
}

export function destroyUserDb() {
	db.handle.destroy()
	db.handle = loadingDb
}