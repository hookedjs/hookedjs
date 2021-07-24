import {Fragment as F, h} from 'preact'

import { nav } from '#src/lib/router'
import { useUserProfile } from '#src/pouch'
import { Paths } from '#src/routes'
import { AuthStore } from '#src/stores'

export default function TenantSwitcher() {
	const profile = useUserProfile()
	
	if (profile.isLoading) return <F></F>
	if (profile.error) throw profile.error
	
	return (
		<div>
			<h1>Select Account</h1>
			{profile.data?.tenants?.map(tenant => (
				<p key={tenant.id}>
					<a href={Paths.TenantDashboardStack} onClick={e => selectTenant(e, tenant.id)}>
						<button>{tenant.name}</button>
					</a>
				</p>
			) ?? (
				<p>Welcome! Looks like you don't have an account yet. How about create one?</p>
			))}
			<p><a href={Paths.TenantCreate}><button>Create New</button></a></p>
		</div>
	)

	function selectTenant(e: any, tenantId: string) {
		e.preventDefault()
		profile.data!.defaultTenant = tenantId
		profile.data!.save()
		AuthStore.value.currentTenant = tenantId
		nav(e.target.href)
	}
}