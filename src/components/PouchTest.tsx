import {h} from 'preact'

import { useRef } from '#src/lib/hooks'
import { NotFoundErrorBoundary } from '#src/lib/router'
import { useTenantPerson, useTenantPersonS } from '#src/pouch'
import { useAuthStore } from '#src/stores'


export default function PouchTest() {
	const [auth] = useAuthStore()
	console.log('pouchtest')
	return auth.username ? (
		<div>
			<PouchTestStateful />
			<NotFoundErrorBoundary>
				<PouchTestSuspense />
			</NotFoundErrorBoundary>
		</div>
	) : null
}

function PouchTestStateful() {
	const renderCount = useRef(0)
	const doc = useTenantPerson({selector: {_id: '72ff88753a64d9bb2cd014d7f803573b'}})
	console.log(`PouchTestStateful-${++renderCount.current}: `, doc.data?.name)
	if (renderCount.current > 2) console.error(`PouchTestStateful-${renderCount.current}: Too many renders`)
	if (doc.isLoading) return <div>loading</div>
	if (doc.error) return <div>{doc.error.message}</div>
	return <div>{doc.data?.name}</div>
}

function PouchTestSuspense() {
	const renderCount = useRef(0)
	const doc = useTenantPersonS({selector: {_id: '72ff88753a64d9bb2cd014d7f803573b'}})
	console.log(`PouchTestSuspense-${++renderCount.current}: `, doc?.name)
	if (renderCount.current > 1) console.error(`PouchTestSuspense-${renderCount.current}: Too many renders`)
	return <div>{doc.name}</div>
}