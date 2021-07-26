
import Database, { loadingDb } from '../../lib/Database'
import { AuthUserRoleEnum, readAuth } from '../auth'
import db from './db'
import { UserProfile } from './model/UserProfile'

export async function initUserDb() {
	destroyUserDb()
	const auth = readAuth()
	if (auth && !auth.roles.includes(AuthUserRoleEnum.ADMIN)) {
		db.handle = new Database(`userdb-${auth.name.replace('@','$').replace(/\./g,'$')}`, db.host)
		await db.handle.sync()
		await db.handle.indexModels([UserProfile])
	}
}

export function destroyUserDb() {
	db.handle.destroy()
	db.handle = loadingDb
}