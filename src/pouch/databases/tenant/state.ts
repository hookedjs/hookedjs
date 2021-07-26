import Database, { loadingDb } from '../../lib/Database'
import { AuthUserRoleEnum, readAuth } from '../auth'
import { UserProfiles } from '../user'
import db from './db'
import { TenantPerson } from './model/TenantPerson'

export async function initTenantDb() {
	destroyTenantDb()
	const auth = readAuth()
	if (auth && !auth.roles.includes(AuthUserRoleEnum.ADMIN) && UserProfiles.isReady) {
		const profile = await UserProfiles.findOne()
		if (profile.defaultTenant) {
			db.handle = new Database(`tenantdb-${profile.defaultTenant}`, db.host)
			await db.handle.sync()
			await db.handle.indexModels([TenantPerson])
		}
	}
}

export function destroyTenantDb() {
	db.handle.destroy()
	db.handle = loadingDb
}