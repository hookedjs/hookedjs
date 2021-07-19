import '#src/pouch/lib/authtest'

import {ComponentChildren, h} from 'preact'
import {Suspense} from 'preact/compat'

import { useErrorBoundary } from '#lib/hooks'
import { NotFoundError } from '#lib/validation'
import { DbProvider, useTenantPerson, useTenantPersonS } from '#src/pouch'

export function NotFoundErrorBoundary({children}: {children: ComponentChildren}) {
	const [runtimeError] = useErrorBoundary()
	if (runtimeError instanceof NotFoundError)
		return <div>Sorry, we can't find the record you seek.</div>
	if (runtimeError)
		throw runtimeError
	return children as any
}

export default function PouchTest() {
	return (
		<div>
			<DbProvider>
				<PouchTestStateful />
				<NotFoundErrorBoundary>
					<Suspense fallback={<div>Suspense...</div>}>
						<PouchTestSuspense />
					</Suspense>
				</NotFoundErrorBoundary>
			</DbProvider>
		</div>
	)
}

function PouchTestStateful() {
	const doc = useTenantPerson('DajKc7aNdpFTFZkSroNKX')
	if (doc.isLoading) return <div>loading</div>
	if (doc.error) return <div>{doc.error.message}</div>
	return <div>{doc.data!.name}</div>
}

function PouchTestSuspense() {
	const doc = useTenantPersonS('DajKc7aNdpFTFZkSroNKX')
	return <div>{doc.name}</div>
}