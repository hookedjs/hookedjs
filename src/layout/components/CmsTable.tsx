import { ComponentChildren, Fragment, h } from 'preact'

import OpenMap, { MapMarker } from '#layout/components/Map'
import {Checkbox} from '#lib/forms'
import { useCallback, useLayoutEffect, useState } from '#lib/hooks'
import { useMedia, UseSet, useSet } from '#lib/hooks'
import * as i from '#lib/icons'
import qs from '#lib/queryStrings'
import { nav, useLocationStore } from '#lib/router'
import pstyled from '#src/lib/pstyled'
import { routesByPath } from '#src/routes'
import { ToastStore } from '#src/stores'

interface CmsTableProps {
	cols: { label: string, sortValue?: string, sortDefault?: 'asc' | 'desc' }[]
	categories?: { label: string, value: string, count: number }[]
	bulkOptions?: { label: string, cb: (selection: any[]) => any }[]
	pages: number
	total: number
	rows: CmsRow[]
	mapMarkers?: MapMarker[],
}
type CmsRow = {
	obj: any // the obj that will be passed to bulk actions
	cols: ComponentChildren[] // the cols that will be displayed
}
export default function CmsTable(p: CmsTableProps) {
	const [_location] = useLocationStore()
	const checked = useSet<CmsRow>()
	useLayoutEffect(() => checked.reset(), [_location])
	const q = qs.parse()

	return (
		<CmsTableDiv>
			<TableFilterDiv>
				<CategoryFilters categories={p.categories} />
				<SearchForm />
			</TableFilterDiv>
			<HeaderFooter total={p.total} pages={p.pages} bulkOptions={p.bulkOptions} checked={checked} mapMarkers={p.mapMarkers} />
		
			{p.total 
				? (
					q.viewMode === 'map'
						? <div style={{ marginBottom: '.3rem' }}>
							<OpenMap height={400} markers={p.mapMarkers!} />
						</div>
						: <table>
							<thead>
								<HeadRow cols={p.cols} rows={p.rows} checked={checked} />
							</thead>
							<tbody>
								{p.rows.map((row,i) => <BodyRow cols={p.cols} row={row} rowNumber={i} checked={checked} />)}
							</tbody>
							<tfoot>
								<HeadRow cols={p.cols} rows={p.rows} checked={checked} />
							</tfoot>
						</table>
				)
				: <NoResultDiv>
					{q.page || q.search || q.category
						? <div>No records match your filters. <a href={qs.create({ page: undefined, search: undefined, category: undefined }, {upsert: true}) || location.pathname}>Reset filters?</a></div>
						: <div>No records found of this type.</div>
					}
				</NoResultDiv>
			}
			<HeaderFooter total={p.total} pages={p.pages} bulkOptions={p.bulkOptions} checked={checked} mapMarkers={p.mapMarkers} isFooter />
		</CmsTableDiv>
	)
}


const CmsTableDiv = pstyled.div`
	:root
		display: block
`
const TableFilterDiv = pstyled.div`
	:root
		position: relative
		margin-bottom: .3rem
		display: flex
		flex-direction: row
		justify-content: space-between
		align-items: center
	@media (max-width: 700px)
		:root
			display: block
`
const NoResultDiv = pstyled.div`
	:root
		background: var(--gray3) 
		border-radius: 3px
		min-height: 150px
		margin: .1rem 0 .3rem
		display: flex
		align-items: center
		justify-content: center
`

function SearchForm() {
	const q = qs.parse()
	const tableName = routesByPath[location.pathname].title
	const onSubmit = useCallback(_onSubmit, [])

	return <SearchFormForm onSubmit={onSubmit}>
		<input name='search' value={q.search} aria-label={`Search ${tableName}`} />
		<button>Search {tableName}</button>
	</SearchFormForm>

	function _onSubmit(e: any) {
		const q = qs.parse()
		const next = new FormData(e.target).get('search')
		if (next === (q.search || ''))
			ToastStore.setValue({ message: 'Search query hasn\'t changed', icon: 'error', placement: 'bottom' })
		else
			nav(qs.create({ search: next ? next : undefined, page: undefined }, { upsert: true }), {replace: true})
	}
}
const SearchFormForm = pstyled.form`
	:root
		display: flex
		flex-direction: row
		align-items: center
`

function CategoryFilters({categories}: {categories: CmsTableProps['categories']}) {
	if (!categories || !categories?.length) return <CategoryFilterDiv>&nbsp;</CategoryFilterDiv>
	const { category = categories[0].value } = qs.parse()
	return <CategoryFilterDiv>
		{categories.map((c, i) => c.value === category
			? <span><b>{c.label}</b> ({c.count}){i < categories.length - 1 && ' | '}</span>
			: <span><a href={createUri(c.value)}>{c.label}</a> ({c.count}){i < categories.length - 1 && ' | '}</span>
		)}
	</CategoryFilterDiv>
	function createUri(next: string) {
		return (qs.create({ category: next !== categories![0].value ? next : undefined }, { upsert: true }) || location.pathname) + '#replace'
	}
}
const CategoryFilterDiv = pstyled.div`
	:root
		font-size: .9rem
		margin-bottom: .3rem
`

function HeaderFooter(p: Pick<CmsTableProps, 'total' | 'pages' | 'bulkOptions' | 'mapMarkers'> & { isFooter?: boolean, checked: UseSet<CmsRow>}) {
	const q = qs.parse()
	const page = parseInt(q.page || '1')
	
	return <HeaderFooterDiv data-footer={p.isFooter}>
		<div class="left">
			<BulkActionsForm bulkOptions={p.bulkOptions} checked={p.checked} />
			{!!p.mapMarkers?.length && (q.viewMode === 'map'
				? <a class='button' href={(qs.create({viewMode: undefined}, {upsert: true}) || location.pathname) + '#replace'}>Table View</a>
				: <a class='button' href={qs.create({viewMode: 'map'}, {upsert: true}) + '#replace'}>Map View</a>
			)}
		</div>
		<CountDiv>
			<div>{p.total} items&nbsp;</div>
			{p.pages > 1 && <Fragment>
				<PageButton title='First Page' page={page} pages={p.pages} pageTo={1}>«</PageButton>
				<PageButton title='Go back one page' page={page} pages={p.pages} pageTo={page - 1}>‹</PageButton>
				<div>&nbsp;{page} of {p.pages}&nbsp;</div>
				<PageButton title='Go forward one page' page={page} pages={p.pages} pageTo={page + 1}>›</PageButton>
				<PageButton title='Go to last page' page={page} pages={p.pages} pageTo={p.pages}>»</PageButton>
			</Fragment>}
		</CountDiv>
	</HeaderFooterDiv>
}
const HeaderFooterDiv = pstyled.div`
	:root
		display: flex
		flex-direction: row
		justify-content: space-between
	:root>.left
		display: flex
		flex-direction: row
	@media (max-width: 700px)
		:root
			flex-direction: column-reverse
		:root[data-footer="true"]
			flex-direction: column
`
const CountDiv = pstyled.div`
	:root
		display: flex
		flex-direction: row
		align-items: center
		font-size: .9rem
		margin-bottom: .3rem
	:root > *
		margin: 0 .1rem
	:root > *:last-of-type
		margin: 0 0 0 .1rem
`

function PageButton(p: Pick<CmsTableProps, 'pages'> & { title: string, page: number, pageTo: number, children: ComponentChildren }) {
	const onClick = useCallback(_onClick, [p.page, p.pageTo])
	if (p.pageTo < 1) p.pageTo = 1
	if (p.pageTo > p.pages) p.pageTo = p.pages
	return <div>
		<a
			title={p.title}
			class="button"
			data-disabled={p.pageTo === p.page}
			onClick={onClick}
			href={(qs.create({ page: p.pageTo !== 1 ? p.pageTo : undefined }, { upsert: true }) || location.pathname) + '#replace'}>
			{p.children}
		</a>
	</div>
	function _onClick(e: any) {
		if (p.pageTo === p.page) {
			e.preventDefault()
			ToastStore.setValue({ message: `You're already on the ${p.pageTo === 1 ? 'first' : 'last'} page`, icon: 'error', placement: 'bottom' })
		}
	}
}

function BulkActionsForm(p: Pick<CmsTableProps, 'bulkOptions'> & { checked: UseSet<CmsRow>}) {
	const [action, setAction] = useState('-1')
	const [executing, setExecuting] = useState(false)
	const onChange = useCallback((e: any) => setAction(e.target.value), [])
	return (
		<BulkActionsFormDiv>
			<select aria-label="Bulk Actions" name="action" value={action} onChange={onChange} disabled={executing}>
				<option value="-1">Bulk Actions</option>
				{p.bulkOptions?.map(o => <option value={o.label}>{o.label}</option>)}
			</select>
			<button onClick={onClick} disabled={executing}>Apply</button>
		</BulkActionsFormDiv>
	)

	async function onClick() {
		if (action === '-1') return ToastStore.setValue({ message: 'No action selected', icon: 'error', placement: 'bottom' })
		if (!p.checked.size) return ToastStore.setValue({ message: 'No rows selected', icon: 'error', placement: 'bottom' })
		setExecuting(true)
		const selectionObjs = Array.from(p.checked.current).map(o => o.obj)
		const callback = p.bulkOptions!.find(o => o.label === action)!.cb
		const callbackP = async () => callback(selectionObjs)
		await callbackP()
		// p.checked.reset()
		setExecuting(false)
	}
}
const BulkActionsFormDiv = pstyled.div`
	:root
		display: flex
		flex-direction: row
		align-items: center
		margin-bottom: .3rem
		margin-right: .3rem
`

function HeadRow(p: Pick<CmsTableProps, 'cols' | 'rows'> & { checked: UseSet<CmsRow>}) {
	const isWide = useMedia('(min-width: 700px)')
	const cols = isWide ? p.cols : p.cols.slice(0, 1)
	const toggleChecks = useCallback(() => p.checked.set(curr => new Set(curr.size === p.rows.length ? [] : p.rows)), [])

	return <tr>
		<td style={{ width: 24 }}>
			<Checkbox inputProps={{name:'select-all', checked: p.checked.size === p.rows.length, onClick:toggleChecks, 'aria-label': 'Select All'}} />
		</td>
		{cols.map(c => <HeadCol colData={c} />)}
	</tr>
}

const carrotProps = { size: 20, style: { marginBottom: -4, marginTop: -4, color: 'var(--black)' } }
function HeadCol({ colData: c }: { colData: CmsTableProps['cols'][0] }) {
	const q = qs.parse()
	const sortCurrent = (
		q.sortBy === c.sortValue && q.sortDirection
		|| !q.sortBy && c.sortDefault
	)

	const carrot = c.sortValue && (
		sortCurrent === 'asc' && <i.CarrotDown {...carrotProps} />
		|| sortCurrent === 'desc' && <i.CarrotUp {...carrotProps} />
		|| c.sortDefault === 'asc' && <i.CarrotDown {...carrotProps} />
		|| c.sortDefault === 'desc' && <i.CarrotUp {...carrotProps} />
		|| <i.CarrotDown {...carrotProps} />
	)
	
	const sort = useCallback(() => {
		const sortDirection = (
			sortCurrent && (sortCurrent === 'asc' ? 'desc' : 'asc')
			|| c.sortDefault
			|| 'asc'
		)
		nav(qs.create({ sortBy: c.sortValue, sortDirection }, { upsert: true }), {replace: true})
	}, [sortCurrent])

	return <HeadColTd onClick={sort} data-clickable={c.sortValue} data-sort-active={!!sortCurrent}>
		{c.sortValue
			? <a href="#table-sort">{c.label} {carrot}</a>
			: <span>{c.label} {carrot}</span>
		}
	</HeadColTd>
}
const HeadColTd = pstyled.td`
	:root[data-clickable="true"]:hover a
		text-decoration: underline
	:root:first-of-type svg.empty
		fill: var(--gray5)
	:root:not(:first-of-type) svg
		visibility: hidden
	:root:not(:first-of-type):hover svg,
	:root:not(:first-of-type).active svg,
	:root:not(:first-of-type)[data-sort-active="true"] svg
		visibility: visible
	:root[data-clickable="true"]:active svg
		transform: translateY(2px)
`

function BodyRow(p: Pick<CmsTableProps, 'cols'> & { row: CmsRow, rowNumber: number, checked: UseSet<CmsRow>}) {
	const isWide = useMedia('(min-width: 700px)')
	return <tr>
		<td><RowCheckbox {...p} /></td>
		{isWide
			? p.row.cols.map((col, i) => <td class={i === 0 ? 'bold' : ''}>{col || '--'}</td>)
			: (
				<td>
					{p.cols.map((col, i) => (false
						|| i === 0 && (
							<div>
								<div><b>{p.row.cols[i]}</b></div>
								<div style={{ margin: '-.4rem 0 .4rem' }}>_ _ _</div>
							</div>
						)
						|| <div>{col.label}: {p.row.cols[i] || '--'}</div>
					))}
				</td>
			)
		}
	</tr>
}

function RowCheckbox(p: { row: CmsRow, rowNumber: number, checked: UseSet<CmsRow> }) {
	const onClick = useCallback(() => p.checked.toggle(p.row), [])
	return <Checkbox inputProps={{name:'row-selected', checked: p.checked.has(p.row), onClick: onClick, 'aria-label': `Select row #${p.rowNumber+1}`}} />
}


