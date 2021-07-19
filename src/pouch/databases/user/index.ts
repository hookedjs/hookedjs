import Database, { loadingDb } from '../../lib/Database'
import {ProfileCtx, Profiles} from './model/Profile'
export * from './model/Profile'

export const userDb = {
	host: 'https://localhost:3000/db',
	handle: loadingDb,
	init,
	initialized: false,
	destroy,
}

function init(name: string) {
	userDb.handle = new Database(name, userDb.host)
	ProfileCtx.db = userDb.handle
	Profiles._db = userDb.handle
	userDb.initialized = true
}

function destroy() {
	userDb.handle.destroy()
	userDb.handle = loadingDb
	ProfileCtx.db = userDb.handle
	Profiles._db = userDb.handle
	userDb.initialized = false
}