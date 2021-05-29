import { Fragment, h } from 'preact'

import type { RouteType } from '#lib/router'
import styled from '#lib/styled'
import { ToastStore } from '#src/stores'

import CmsTable from './components/CmsTable'
import PaddedPage from './components/PaddedPage'
import Section from './components/Section'

export default function FillerListFactory({ route }: { route: RouteType }) {
	const stackPath = location.pathname.split('/').slice(0, -1).join('/')
	const createPath = stackPath + '/create'
	const entryPath = stackPath + '/entry'
	
	return <PaddedPage>
		<Section
			header1={(
				<Fragment>
					{route.title}
					<AddNewButton href={createPath} class='button'>Add New</AddNewButton>
				</Fragment>
			)}
			fullHeight
		>
			<CmsTable
				cols={[
					{ title: 'Name', sortable: true, sortDefault: 'asc' },
					{ title: 'Email', sortable: true },
					{ title: 'Role' },
					{ title: 'Tenant' }
				]}
				categories={[
					{ title: 'All', count: 16 },
					{ title: 'Administrator', count: 16 },
				]}
				bulkOptions={[
					{ title: 'Delete', cb(selection) { ToastStore.value = { message: `Deleted ${selection.length} items`, icon: 'success', location: 'right' } } }
				]}
				pages={4}
				total={16}
				rows={[
					[<a href={`${entryPath}?id=Nancy Smith1`}>Nancy Smith1</a>, <a href="mailto:nancy@smith1.com">nancy@smith1.com</a>, 'Administrator', '—'],
					[<a href={`${entryPath}?id=Nancy Smith2`}>Nancy Smith2</a>, <a href="mailto:nancy@smith2.com">nancy@smith2.com</a>, 'Administrator', '—'],
					[<a href={`${entryPath}?id=Nancy Smith3`}>Nancy Smith3</a>, <a href="mailto:nancy@smith3.com">nancy@smith3.com</a>, 'Administrator', '—'],
					[<a href={`${entryPath}?id=Nancy Smith4`}>Nancy Smith4</a>, <a href="mailto:nancy@smith4.com">nancy@smith4.com</a>, 'Administrator', '—'],
				]}
				mapMarkers={[
					{ title: 'Nancy Smith1', lat: 30.24, long: -97.76, popupWidth: '10rem',
						popup: <div>
							<a href={`${entryPath}?id=Nancy Smith1`}>Nancy Smith1</a>
							<div>1300 W Lake Ave<br />Austin, TX 78736</div>
						</div>
					},
					{ title: 'Nancy Smith2', lat: 30.22, long: -97.79, popupWidth: '10rem',
						popup: <div>
							<a href={`${entryPath}?id=Nancy Smith2`}>Nancy Smith2</a>
							<div>1200 Roaring Springs Dr<br />Austin, TX 78736</div>
						</div>
					},
					{
						title: 'Nancy Smith3', lat: 30.23, long: -97.77, popupWidth: '10rem',
						popup: <div>
							<a href={`${entryPath}?id=Nancy Smith3`}>Nancy Smith3</a>
							<div>400 W Lake Ave<br />Austin, TX 78736</div>
						</div>
					},
					{
						title: 'Nancy Smith4', lat: 30.23, long: -97.80, popupWidth: '10rem',
						popup: <div>
							<a href={`${entryPath}?id=Nancy Smith4`}>Nancy Smith4</a>
							<div>800 Roaring Springs Dr<br />Austin, TX 78736</div>
						</div>
					},
				]}
			
			/>
		</Section>
	</PaddedPage>
}
const AddNewButton = styled.a`
	:root
		position: relative
		top: -5px
		left: .7rem
		font-weight: initial
`
