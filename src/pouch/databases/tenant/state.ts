import Database, { loadingDb } from '../../lib/Database'
import { UserProfiles } from '../user/state'
import db from './db'
export * from './model/TenantPerson'

export async function initTenantDb() {
	destroyTenantDb()
	if (UserProfiles.isReady) {
		const profile = await UserProfiles.findOne()
		if (profile.defaultTenant)
			db.handle = new Database(profile.defaultTenant, db.host)
	}
}

export function destroyTenantDb() {
	db.handle.destroy()
	db.handle = loadingDb
}