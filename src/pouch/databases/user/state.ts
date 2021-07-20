import { readAuth } from '#src/pouch/lib/auth'

import Database, { loadingDb } from '../../lib/Database'
import db from './db'
export * from './model/UserProfile'


export async function initUserDb() {
	destroyUserDb()
	const auth = readAuth()
	if (auth) {
		db.handle = new Database(`userdb-${auth.name}`, db.host)
		await db.handle.connect()
	}
}

export function destroyUserDb() {
	db.handle.destroy()
	db.handle = loadingDb
}