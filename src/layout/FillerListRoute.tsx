import { h } from 'preact'

import { getParentPath, RouteType } from '#lib/router'
import { ToastStore } from '#src/stores'

import CmsTablePage from './components/CmsTablePage'

export default function FillerListFactory({ route }: { route: RouteType }) {
	const parent = getParentPath()
	const entryPath = parent + '/entry'
	
	return <CmsTablePage
		pageTitle={route.title}
		cols={[
			{ label: 'Name', sortValue: 'name', sortDefault: 'asc' },
			{ label: 'Email', sortValue: 'email' },
			{ label: 'Role' },
			{ label: 'Tenant' }
		]}
		categories={[
			{ label: 'All', value: '', count: 16 },
			{ label: 'Administrator', value: 'admin', count: 16 },
		]}
		bulkOptions={[
			{ label: 'Delete', cb(selection) { ToastStore.setValue({ message: `Deleted ${selection.length} items`, icon: 'success', location: 'right' }) } }
		]}
		pages={4}
		total={16}
		rows={[
			{obj: {}, cols: [<a href={`${entryPath}?id=Nancy Smith1`}>Nancy Smith1</a>, <a href="mailto:nancy@smith1.com">nancy@smith1.com</a>, 'Administrator', '']},
			{obj: {}, cols: [<a href={`${entryPath}?id=Nancy Smith2`}>Nancy Smith2</a>, <a href="mailto:nancy@smith2.com">nancy@smith2.com</a>, 'Administrator', '']},
			{obj: {}, cols: [<a href={`${entryPath}?id=Nancy Smith3`}>Nancy Smith3</a>, <a href="mailto:nancy@smith3.com">nancy@smith3.com</a>, 'Administrator', '']},
			{obj: {}, cols: [<a href={`${entryPath}?id=Nancy Smith4`}>Nancy Smith4</a>, <a href="mailto:nancy@smith4.com">nancy@smith4.com</a>, 'Administrator', '']},
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
}

