/**
 * A Component factory that creates a component from an () => import('path-to-component'),
 * thereby making any component import asynchronous
 * 
 * What makes it cool? If you code-split your bundle, it allows your app to continue rendering
 * while waiting for a component to load in the background (aka asynchrously)
 *
 * It's kinda like react's lazy, only it doesn't need to be wrapped in suspense
 */

import { h } from 'preact'

import { useEffect, useState } from '#lib/hooks'

export default function lazy<T>(loader: () => Promise<{ default: T }>, loadingJsx = <div />): any {
	return function Lazy(props: any = {}) {
		const [jsx, setJsx] = useState<any>(loadingJsx)
		useEffect(() => {
			loader().then((m: { default: any }) => {
				if (!m || !m.default) {
					const e = new Error('Lazy import must export default') as any
					e.import = m
					throw e
				}
				setJsx(<m.default {...props} />)
			})
		}, [props])
		return jsx
	}
}