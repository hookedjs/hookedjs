import {h} from 'preact'

import PaddedPage from '#layout/components/PaddedPage'
import Section from '#layout/components/Section'
import pstyled from '#src/lib/pstyled'
import { AuthUser, useAuthUserS } from '#src/pouch'
import { Paths } from '#src/routes'
import { AuthStore, useAuthStore } from '#src/stores'

// Further copy the styles of https://account.zenmate.com/en_US/account, especially the form inputs.


export default function Account() {
	const [auth] = useAuthStore()
	const profile = useAuthUserS(auth.name)
	return profile.roles.includes(AuthStore.dbRoles.ADMIN) ? <AdminAccount /> : <TenantAccount profile={profile} />
}

function AdminAccount() {
	return <PaddedPage>
		<Section header1="Account Settings">
			Hello Admin.
		</Section>
	</PaddedPage>
}

function TenantAccount({profile}: {profile: AuthUser}) {
	return <PaddedPage>
		<Section header1="Account Settings">
			<p>Hello, {profile.fullName}!</p>
			user form here
		</Section>
		<Section header1="Account overview">
			user overview here
		</Section>
		<DeleteAccountA href={profile.roles.includes(AuthStore.dbRoles.ADMIN) ? Paths.AdminDeleteAccount : Paths.TenantDeleteAccount}>Delete my account</DeleteAccountA>
	</PaddedPage>
}

const DeleteAccountA = pstyled.a`
	:root
		display: block
		text-align: right
		margin: 6px 0 10px 10px
	@media (max-width: 700px)
		:root
			margin: 10px
`