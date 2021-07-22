import {Fragment as F, h} from 'preact'

import { nav } from '#src/lib/router'
import { useUserProfile } from '#src/pouch'
import { Paths } from '#src/routes'
import { AuthStore } from '#src/stores'

export default function TenantSwitcher() {
	// TODO: Get useUserProfile to show available tenants
	const profile = useUserProfile('')
	
	if (profile.isLoading) return <F></F>
	if (profile.error) throw profile.error
	
	return (
		<div>
			<h1>Select Account</h1>
			<ul>
				{!!profile.data?.tenants.length && (
					<li>(none available)</li>
				)}
				{profile.data?.tenants.map(tenant => (
					<li key={tenant.id} onClick={() => selectTenant(tenant.id)}>
						{tenant.name}
					</li>
				))}
			</ul>
			<p><a href={Paths.TenantCreate}><button>Add New</button></a></p>
		</div>
	)

	function selectTenant(tenantId: string) {
		profile.data!.defaultTenant = tenantId
		profile.data!.save()
		AuthStore.value.currentTenant = tenantId
		nav(Paths.Dashboard)
	}
}