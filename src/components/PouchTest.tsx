import {h} from 'preact'

import { NotFoundErrorBoundary } from '#src/lib/router'
import { useTenantPerson, useTenantPersonS } from '#src/pouch'
import { useAuthStore } from '#src/stores'


export default function PouchTest() {
	const [auth] = useAuthStore()
	console.log('pouchtest')
	return auth.username ? (
		<div>
			<PouchTestStateful />
			<PouchTestStateful />
			<NotFoundErrorBoundary>
				<PouchTestSuspense />
				<PouchTestSuspense />
			</NotFoundErrorBoundary>
		</div>
	) : null
}

function PouchTestStateful() {
	const doc = useTenantPerson({selector: {_id: '72ff88753a64d9bb2cd014d7f803573b'}})
	// console.log('pts: ', JSON.stringify(doc))
	if (doc.isLoading) return <div>loading</div>
	if (doc.error) return <div>{doc.error.message}</div>
	return <div>{doc.data?.name}</div>
}

function PouchTestSuspense() {
	const doc = useTenantPersonS({selector: {_id: '72ff88753a64d9bb2cd014d7f803573b'}})
	// console.log('pts: ', doc?.name)
	return <div>{doc.name}</div>
}