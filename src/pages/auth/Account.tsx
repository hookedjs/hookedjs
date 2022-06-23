import PaddedPage from '#src/layout/components/PaddedPage'
import Section from '#src/layout/components/Section'
import pstyled from '#src/lib/pstyled'
import {useCurrentUser} from '#src/pouch'
import {Paths} from '#src/routes'
import {h} from 'preact'

// Further copy the styles of https://account.zenmate.com/en_US/account, especially the form inputs.

export default function Account() {
  const user = useCurrentUser()!
  return (
    <PaddedPage>
      <Section header1="Account Settings">
        <p>Hello, {user.fullName}!</p>
        user form here
      </Section>
      <Section header1="Account overview">user overview here</Section>
      <DeleteAccountA href={Paths.TenantDeleteAccount}>Delete my account</DeleteAccountA>
    </PaddedPage>
  )
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
