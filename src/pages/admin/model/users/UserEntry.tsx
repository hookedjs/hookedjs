import { h } from 'preact'

import PaddedPage from '#layout/components/PaddedPage'
import Section from '#layout/components/Section'
import qs from '#lib/queryStrings'
import {PageMetaStore, RouteType} from '#lib/router'
import CodeSnippet from '#src/layout/components/CodeSnippet'
import { useAuthUserS } from '#src/pouch'

export default function UserEntry({ route }: { route: RouteType }) {
	const
		{id} = qs.parse<Record<string,string>>(),
		entry = useAuthUserS('org.couchdb.user:' + id)
	
	PageMetaStore.value = { title: entry.fullName }
	
	return <PaddedPage>
		<Section header1={id} backButton={route.hasBack}>
			<p>{entry.givenName} was a mighty fine person.</p>
		</Section>
		<Section header1='JSON'>
			<CodeSnippet snippet={entry}/>
		</Section>
	</PaddedPage>
}