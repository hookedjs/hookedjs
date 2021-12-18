import { isOffline, isOnline, waitForOnline } from '#lib/network'
import { AuthUsers } from '#src/pouch'
import { AuthStore } from '#src/stores'

import Database, { loadingDb } from '../../lib/Database'
import { readAuth } from '../auth'
import db from './db'
import { TenantPerson } from './model/TenantPerson'

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
			db.handle = new Database(`tenantdb-${tenantId}`)
			await db.handle.indexModels([TenantPerson])
			waitForOnline().then(initTenantDb)
		} else {
			db.handle = new Database(`tenantdb-${tenantId}`, db.host)
			await db.handle.sync()
			await db.handle.indexModels([TenantPerson])
		}
	}
	return tenantId
}

export function destroyTenantDb() {
	db.handle.destroy()
	db.handle = loadingDb
}