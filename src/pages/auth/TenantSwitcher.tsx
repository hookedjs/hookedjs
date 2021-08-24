import {h} from 'preact'

import { nav } from '#src/lib/router'
import { AuthUsers } from '#src/pouch'
import { Paths } from '#src/routes'
import { AuthStore, AuthStoreType, useAuthStore } from '#src/stores'

export default function TenantSwitcher() {
	const [auth] = useAuthStore()

	return (
		<div>
			<h1>Select Account</h1>
			{auth.tenants?.map(tenant => (
				<p key={tenant.id}>
					<a href={Paths.TenantDashboardStack} onClick={e => selectTenant(e, tenant)}>
						<button>{tenant.name}</button>
					</a>
				</p>
			) ?? (
				<p>Welcome! Looks like you don't have an account yet. How about create one?</p>
			))}
			<p><a href={Paths.TenantCreate}><button>Create New</button></a></p>
		</div>
	)

	async function selectTenant(e: any, tenant: AuthStoreType['currentTenant']) {
		e.preventDefault()
		const profile = await AuthUsers.getCurrent()
		profile.defaultTenantId = tenant!.id
		profile.save()
		AuthStore.value.currentTenant = tenant
		nav(e.target.href)
	}
}

function useAuth() {
	throw new Error('Function not implemented.')
}
