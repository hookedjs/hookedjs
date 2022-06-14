import { isOffline, isOnline, waitForOnline } from '#src/lib/network'
import { AuthUsers } from '#src/pouch'
import { AuthStore } from '#src/stores'

import Database, { loadingDb } from '../../lib/Database'
import { readAuth } from '../auth'
import db from './db'
import { TenantPerson } from './model/TenantPerson'

export const tenantDbPrefix = 't-'

export async function initTenantDb() {
	destroyTenantDb()
	const tenantId = 
		AuthStore.value.currentTenant?.id || 
		(
			isOnline() &&
			readAuth()?.roles?.excludes(AuthStore.dbRoles.ADMIN) &&
			(await AuthUsers.getCurrent().catch(() => null))?.defaultTenantId
		)

	if (tenantId) {
		if (isOffline()) {
			db.handle = new Database(tenantId)
			await db.handle.indexModels([TenantPerson])
			waitForOnline().then(initTenantDb)
		} else {
			db.handle = new Database(tenantId, db.host)
			await db.handle.sync()
			await db.handle.indexModels([TenantPerson])
		}
	}
	return tenantId
}

// TODO: initTenantDbApi should return a scoped handle to the tenant db and TenantPerson and TenantPersons
export async function initTenantDbApi(dbName: string) {
	dbName = dbName.startsWith(tenantDbPrefix) ? dbName : `${tenantDbPrefix}${dbName}`
	db.handle = new Database(dbName, db.host, {remoteOnly: true, skipSetup: false})
	await db.handle.indexModels([TenantPerson])
}

export function destroyTenantDb() {
	db.handle.destroy()
	db.handle = loadingDb
}