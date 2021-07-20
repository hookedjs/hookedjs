import {h} from 'preact'
import {Suspense} from 'preact/compat'

import { useTenantPerson, useTenantPersonS } from '#src/pouch'
import { NotFoundErrorBoundary } from '#src/pouch/lib/errors'
import { useAuthStore } from '#src/stores'


export default function PouchTest() {
	const [auth] = useAuthStore()
	return auth.username ? (
		<div>
			<PouchTestStateful />
			<NotFoundErrorBoundary>
				<Suspense fallback={<div>Suspense...</div>}>
					<PouchTestSuspense />
				</Suspense>
			</NotFoundErrorBoundary>
		</div>
	) : null
}

function PouchTestStateful() {
	const doc = useTenantPerson('72ff88753a64d9bb2cd014d7f802a2f3')
	if (doc.isLoading) return <div>loading</div>
	if (doc.error) return <div>{doc.error.message}</div>
	return <div>{doc.data!.name}</div>
}

function PouchTestSuspense() {
	const doc = useTenantPersonS('72ff88753a64d9bb2cd014d7f802a2f3')
	return <div>{doc.name}</div>
}