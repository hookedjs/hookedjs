import {h} from 'preact'

import PaddedPage from '#layout/components/PaddedPage'
import Section from '#layout/components/Section'
import styled from '#lib/styled'
import { Paths } from '#src/routes'
import { AuthStore, useAuthStore } from '#src/stores'

// Further copy the styles of https://account.zenmate.com/en_US/account, especially the form inputs.


export default function Account() {
	const [auth] = useAuthStore()
	return <PaddedPage>
		<Section header1="Account Settings">
			user form here
		</Section>
		<Section header1="Account overview">
			user overview here
		</Section>
		<DeleteAccountA href={auth.dbRoles.includes(AuthStore.dbRoles.ADMIN) ? Paths.AdminDeleteAccount : Paths.TenantDeleteAccount}>Delete my account</DeleteAccountA>
	</PaddedPage>
}

const DeleteAccountA = styled.a`
	:root
		display: block
		text-align: right
		margin: 6px 0 10px 10px
	@media (max-width: 700px)
		:root
			margin: 10px
`