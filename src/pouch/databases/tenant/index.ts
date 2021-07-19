import Database, { loadingDb } from '../../lib/Database'
import {PersonCtx, Persons} from './model/Person'
export * from './model/Person'

export const tenantDb = {
	host: 'https://localhost:3000/db',
	handle: loadingDb,
	init,
	initialized: false,
	destroy,
}

function init(name: string) {
	tenantDb.handle = new Database(name, tenantDb.host)
	PersonCtx.db = tenantDb.handle
	Persons._db = tenantDb.handle
	tenantDb.initialized = true
}

function destroy() {
	tenantDb.handle.destroy()
	tenantDb.handle = loadingDb
	PersonCtx.db = tenantDb.handle
	Persons._db = tenantDb.handle
	tenantDb.initialized = false
}