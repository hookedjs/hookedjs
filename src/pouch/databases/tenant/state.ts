import Database, { loadingDb } from '../../lib/Database'
import { UserProfiles } from '../user/state'
import db from './db'
import { TenantPerson } from './model/TenantPerson'

export * from './model/TenantPerson'

export async function initTenantDb() {
	destroyTenantDb()
	if (UserProfiles.isReady) {
		const profile = await UserProfiles.findOne()
		if (profile.defaultTenant) {
			db.handle = new Database(`tenantdb-${profile.defaultTenant}`, db.host)
			await db.handle.connect()
			await db.handle.indexModels([TenantPerson])
		}
	}
}

export function destroyTenantDb() {
	db.handle.destroy()
	db.handle = loadingDb
}