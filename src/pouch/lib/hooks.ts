import { useEffect, useEffectDeep, useLayoutEffect, useLayoutEffectDeep, useMemo, useMemoDeep, useRef, useState, useUpdate } from '#lib/hooks'
import { NotFoundError, throwError, throwNotFoundError } from '#src/lib/validation'

import type { IFindProps } from './Database'
import type PouchModel from './Model'

interface State<T> {
	data?: T
	error?: Error
	isLoading: boolean
	fetchP?: PromiseFnc
}

/**
 * A Stateful db query hook to get many docs
 * 
 * Strategically doesn't rely on local state bc state is reset when used with Suspense
 */
function useDocs<PM extends PouchModel<any>>(
	collection: any,
	findProps?: IFindProps<PM> | string,
	// limit can also go in findProps, but this extra field is convenient for useDoc
	limit?: number,
): State<PM[]> {
	const rerender = useUpdate()
	useEffect(watch, [findProps])
	const listener = useRef({cancel(){}})

	const mapped = Object.clone({
		selector: {},
		...(typeof findProps === 'string' ? {selector: {_id: {$in: findProps}}} as any: findProps),
		...limit && {limit}
	})
	mapped.selector.type = collection.model.type

	const
		cacheKey = JSON.stringify(mapped),
		cached = collection.db.findCache.get(cacheKey)
	
	if (!cached)
		return {isLoading: true, fetchP: collection.db.find(mapped)}
	if (cached?.error)
		return {isLoading: false, error: cached.error}
	if (cached?.value)
		return {isLoading: false, data: cached.value.map((doc: any) => new collection.model(doc))}
	if (cached?.fetching)	
		return {isLoading: true, fetchP: cached.fetchP}
	
	throw new Error('Unhandled cache error')

	function watch() {
		refetchIfStale().then(listenForChanges)
		return () => listener.current.cancel()
	}

	async function refetchIfStale() {
		const cached = collection.db.findCache.get(cacheKey)
		if (cached?.fetching) {
			await cached.fetchP
			rerender()
		}
		else if (
			// At this point, cached should always be truthy, but just in case...
			!cached 
			|| ((Date.now() - cached.time > 3000)) && !cached.fetching
		) {
			await collection.db.find(mapped)
			rerender()
		}
	}

	async function listenForChanges() {
		let cached = collection.db.findCache.get(cacheKey)
		// Since listenForChanges comes after refetchIfStale, fetching should always be falsey. But just in case...
		if (cached?.fetching) {
			await cached.fetchP
			rerender()
			cached = collection.db.findCache.get(cacheKey)
		}
		// Watch for future changes
		listener.current.cancel()
		listener.current = collection.db.subscribe(cached.value.map((d: any) => d._id), (changed: any) => {
			// Update cache if not already caught up.
			const
				latest = collection.db.findCache.get(cacheKey),
				cachedVersionOfChanged = latest.value.find((doc: any) => doc._id === changed._id)
			if (changed._rev != cachedVersionOfChanged._rev) {
				const next = {
					...latest,
					value: latest.value.map((doc: any) => doc._id === changed._id ? changed : doc),
					time: new Date(),
				}
				collection.db.findCache.set(cacheKey, next)
			}
			// Trigger re-render so the view updates from cache
			rerender()
		})
	}

}

/**
 * A Stateful db query hook to get a single doc
 */
function useDoc<PM extends PouchModel<any>>(collection: any, findProps?: IFindProps<PM> | string): State<PM> {
	const docs = useDocs<PM>(collection, findProps, 1)
	return {
		isLoading: docs.isLoading,
		error: docs.error || (docs.data?.length ? undefined : new NotFoundError()),
		data: docs.data?.length ? docs.data[0]: undefined,
	}
}

/**
 * A Suspenseful db query hook to get many docs
 */
function useDocsS<PM extends PouchModel<any>>(collection: any, findProps?: IFindProps<PM> | string, limit?: number): PM[] {
	const state = useDocs(collection, findProps, limit)
	if (state.isLoading) throw state.fetchP
	if (state.error) throw state.error
	return state.data!
}

/**
 * A Suspenseful db query hook to get a single doc
 */
function useDocS<PM extends PouchModel<any>>(collection: any, findProps?: IFindProps<PM> | string): PM {
	const docs = useDocsS<PM>(collection, findProps, 1)
	return docs?.[0] ?? throwNotFoundError()
}


function createModelUseManyHook<PM extends PouchModel<any>>(collection: any) {
	return function useModelDocs(findProps?: IFindProps<PM> | string): State<PM[]> {
		return useDocs<PM>(collection, findProps as any)
	}
}
function createModelUseHook<PM extends PouchModel<any>>(collection: any) {
	return function useModelDoc(findProps?: IFindProps<PM> | string): State<PM> {
		return useDoc<PM>(collection, findProps)
	}
}
function createModelUseManyHookS<PM extends PouchModel<any>>(collection: any) {
	return function useModelDocsS(findProps?: IFindProps<PM> | string): PM[] {
		return useDocsS<PM>(collection, findProps)
	}
}
function createModelUseHookS<PM extends PouchModel<any>>(collection: any) {
	return function useModelDocS(findProps?: IFindProps<PM> | string): PM {
		return useDocS<PM>(collection, findProps)
	}
}

export function createModelHooks<PM extends PouchModel<any>>(collection: any) {
	return [
		createModelUseHook<PM>(collection),
		createModelUseManyHook<PM>(collection),
		createModelUseHookS<PM>(collection),
		createModelUseManyHookS<PM>(collection),
	] as const
}