import type { ComponentChildren } from 'preact'

import { useLayoutEffect, useState } from '#src/lib/hooks'

import { Profiles, tenantDb, userDb } from '../databases'

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
	// TODO: Handle if auth.roles.includes('_admin')
	const authJson = localStorage.getItem('auth')
	if (authJson) {
		const auth = JSON.parse(authJson)
		userDb.init(`userdb-${auth.name}`)
		const profile = await Profiles.findOne()
		if (profile.defaultTenant)
			tenantDb.init(profile.defaultTenant)
	}
}
