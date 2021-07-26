import type { ComponentChildren } from 'preact'

import { useLayoutEffect, useState } from '#src/lib/hooks'

import * as dbs from '../databases'

/**
 * Does not render children until auth has settled.
 */
export function DbProvider({children}: {children: ComponentChildren}) {
	const [isLoading, setIsLoading] = useState(true)
	useLayoutEffect(() => {watchLoading()}, [])
	return isLoading ? null : children as any

	async function watchLoading() {
		await initDatabases()
		setIsLoading(false)
	}
}

export async function initDatabases() {
	await dbs.initAuthDb()
	await dbs.initUserDb()
	await dbs.initTenantDb()
}

export async function destroyDatabases() {
	await dbs.destroyAuthDb()
	await dbs.destroyUserDb()
	await dbs.destroyTenantDb()
}