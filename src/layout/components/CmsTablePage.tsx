import { Fragment as F, h } from 'preact'

import { getParentPath } from '#src/lib/router'
import pstyled from '#src/lib/pstyled'

import CmsTable from './CmsTable'
import PaddedPage from './PaddedPage'
import Section from './Section'

export default function CmsTablePage({ pageTitle, ...cmsTableProps }: { pageTitle: string } & Parameters<typeof CmsTable>[0]) {
	const parent = getParentPath()
	const createPath = parent + '/create'
	
	return <PaddedPage>
		<Section
			header1={(
				<F>
					{pageTitle}
					<AddNewButton href={createPath} class='button'>Add New</AddNewButton>
				</F>
			)}
			fullHeight
		>
			<CmsTable {...cmsTableProps} />
		</Section>
	</PaddedPage>
}
const AddNewButton = pstyled.a`
	:root
		position: relative
		top: -5px
		left: .7rem
		font-weight: initial
`
