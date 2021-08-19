import {ComponentChildren, Fragment as F, h} from 'preact'

import CmsTablePage from '#layout/components/CmsTablePage'
import queryStrings from '#lib/queryStrings'
import { getParentPath, RouteType } from '#lib/router'
import { portalPrompt } from '#src/layout/components/Portal'
import pstyled from '#src/lib/pstyled'
import { AuthUser, useAuthUsersS } from '#src/pouch'
import { ToastStore } from '#src/stores'

export default function UserList({ route }: { route: RouteType }) {
	const
		parentPath = getParentPath(),
		pageSize = 10,
		// {search = '', category = '', page = 1} = queryStrings.parse(),
		_qs = queryStrings.parse(),
		_search = _qs.search || '',
		_sortBy = _qs.sortBy || '',
		_sortDirection = _qs.sortDirection || 'asc',
		_category = _qs.category || '',
		page = _qs.page || 1,
		// PouchDB doth not allow search across multiple fields, so do it manually
		// totalCount = useAuthUserCountS({selector: _selector}),
		// results = useAuthUsersS({selector: _selector, limit: pageSize, skip: (page - 1) * pageSize})
		[_entriesRaw, refetch] = useAuthUsersS({
			..._sortBy ? {sort: [{[_sortBy]: _sortDirection}]} : {},
		}),
		matchingSearch = _search ? _entriesRaw.filter(u => false
			|| u.givenName.toLowerCase().includes(_search.toLowerCase())
			|| u.surname.toLowerCase().includes(_search.toLowerCase())
			|| u.name.toLowerCase().includes(_search.toLowerCase())
			|| u.tenants.includes(_search.toLowerCase())) : _entriesRaw,
		byCategory = matchingSearch.keyBy('status'),
		matchingCategory = _category ? (byCategory[_category] ?? []) : matchingSearch,
		entriesFiltered = matchingCategory,
		entriesPaged = entriesFiltered.slice((page-1)*pageSize, page*pageSize)
	
	return <CmsTablePage
		pageTitle={route.title}
		cols={[
			{ label: 'Name' },
			{ label: 'Email', sortValue: '_id' },
			{ label: 'Status' },
			{ label: 'Roles' },
			{ label: 'Tenants' }
		]}
		categories={[
			{ label: 'All', value: '', count: matchingSearch.length },
			...Object.entries(byCategory).map(([k,v]) => ({ label: k.toTitleCase(), value: k, count: v.length })),
		]}
		bulkOptions={[
			{ label: 'Delete', cb: deleteCb },
			{ label: 'Ban', cb: banCb }
		]}
		pages={Math.ceil(entriesFiltered.length / pageSize)}
		total={entriesFiltered.length}
		rows={entriesPaged.map(obj => ({
			obj,
			cols: [
				<a href={`${parentPath}/entry?id=${obj.name}`}>{obj.fullName}</a>,
				<a href={`mailto:${obj.name}`}>{obj.name}</a>,
				obj.status,
				obj.roles.join(),
				obj.tenants.join(),
			]
		}))}
	/>

	async function deleteCb(selection: any[]) {
		const confirmed = await portalPrompt<boolean>(({resolve}) => (
			<ConfirmPrompt resolve={resolve}>
				<p>Okay to delete {selection.length} user(s)?</p>
			</ConfirmPrompt>
		))
		if (confirmed) {
			await Promise.all(selection.map((entry: AuthUser) => entry.delete()))
			ToastStore.setValue({ message: `Deleted ${selection.length} entries`, icon: 'success', location: 'right' })
			await refetch()
		}
	}

	async function banCb(selection: any[]) {
		// TODO: Ban should prompt for reason
		const confirmed = await portalPrompt<boolean>(({resolve}) => (
			<ConfirmPrompt resolve={resolve}>
				<p>Okay to ban {selection.length} user(s)?</p>
			</ConfirmPrompt>
		))
		if (confirmed) {
			await Promise.all(selection.map((entry: AuthUser) => entry.ban('Banned by bulk action')))
			ToastStore.setValue({ message: `Banned ${selection.length} entries`, icon: 'success', location: 'right' })
			await refetch()
		}
	}
}

function ConfirmPrompt({resolve, children = 'Are you sure?'}: {resolve: (res: boolean) => void, children?: ComponentChildren}) {
	return (<div>
		<div>{children}</div>
		<ButtonGroup>
			<button onClick={() => resolve(true)} class="primary large">Proceed</button>
			<button onClick={() => resolve(false)} class="link">Cancel</button>
		</ButtonGroup>
	</div>)
}

const ButtonGroup = pstyled.div`
	:root
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 2px;
`