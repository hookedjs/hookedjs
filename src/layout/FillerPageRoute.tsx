import { h } from 'preact'

import type { RouteType } from '#lib/router'
import PouchTest from '#src/components/PouchTest'

import PaddedPage from './components/PaddedPage'
import Section from './components/Section'

export default function FillerPageFactory({ route }: { route: RouteType }) {
	return <PaddedPage>
		<Section header1={route.title} backButton={route.hasBack}>
			<PouchTest />
			<p>
				1<br /><br /><br /><br /><br />2
				<br /><br /><br /><br /><br />3<br /><br /><br /><br /><br />4
			</p>
		</Section>
		<Section>
			<p>
				1<br /><br /><br /><br /><br />2
				<br /><br /><br /><br /><br />3<br /><br /><br /><br /><br />4
			</p>
		</Section>
		<Section>
			<p>
				1<br /><br /><br /><br /><br />2
				<br /><br /><br /><br /><br />3<br /><br /><br /><br /><br />4
			</p>
		</Section>
		<Section>
			<p>
				1<br /><br /><br /><br /><br />2
				<br /><br /><br /><br /><br />3<br /><br /><br /><br /><br />4
			</p>
		</Section>
	</PaddedPage>
}
