import type { ComponentChildren } from 'preact'

import { useLayoutEffect, useState } from '#src/lib/hooks'

import * as dbs from '../databases'

/**
 * Does not render children until auth has settled.
 */
export function DbProvider({children}: {children: ComponentChildren}) {
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<Error | null>(null)
	useLayoutEffect(() => {watchLoading()}, [])
	if (error) throw error
	return isLoading ? null : children as any

	async function watchLoading() {
		try {
			await initDatabases()
			setIsLoading(false)
		} catch(e: any) {
			setError(e)
		}
	}
}

export async function initDatabases() {
	await dbs.initAuthDb()
	await dbs.initTenantDb()
}

export async function destroyDatabases() {
	await dbs.destroyAuthDb()
	await dbs.destroyTenantDb()
}