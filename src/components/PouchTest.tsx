import {h} from 'preact'
import {Suspense} from 'preact/compat'

import { usePerson, usePersonS } from '#src/pouch/model/Person'

export default function PouchTest() {
	return (
		<div>
			<PouchTestStateful />
			<Suspense fallback={<div>Suspense...</div>}>
				<PouchTestSuspense />
			</Suspense>
		</div>
	)
}

function PouchTestStateful() {
	const doc = usePerson('ckr6iu5ru00023h69v6wevj4h')
	if (doc.isLoading) return <div>loading</div>
	if (doc.error) return <div>Error: {JSON.stringify(doc.error)}</div>
	return <div>{doc.data!.name}</div>
}

function PouchTestSuspense() {
	const doc = usePersonS('ckr6iu5ru00023h69v6wevj4h')
	return <div>{doc.name}</div>
}