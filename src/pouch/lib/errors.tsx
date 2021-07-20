import {ComponentChildren, h} from 'preact'

import { useErrorBoundary } from '#lib/hooks'
import { NotFoundError } from '#lib/validation'

export function NotFoundErrorBoundary({children}: {children: ComponentChildren}) {
	const [runtimeError] = useErrorBoundary()
	if (runtimeError instanceof NotFoundError)
		return <div>Sorry, we can't find the record you seek.</div>
	if (runtimeError)
		throw runtimeError
	return children as any
}