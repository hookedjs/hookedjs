import { useEffect, useRef, useUpdate } from '#lib/hooks'
import { NotFoundError, throwNotFoundError } from '#src/lib/validation'

import type { IFindProps } from './Database'
import type PouchModel from './Model'

interface State<T> {
	data?: T
	error?: Error
	isLoading: boolean
	fetchP?: PromiseFnc
	refetch: () => void
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

	const mapped = clone({
		selector: {},
		...(typeof findProps === 'string' ? {selector: {_id: {$in: [findProps]}}} as any : findProps),
		...limit && {limit}
	})
	mapped.selector.type = collection.model.type

	const
		cacheKey = JSON.stringify(mapped),
		cached = collection.db.findCache.get(cacheKey)
	
	if (!cached)
		return {refetch, isLoading: true, fetchP: collection.db.find(mapped)}
	if (cached?.error)
		return {refetch, isLoading: false, error: cached.error}
	if (cached?.value)
		return {refetch, isLoading: false, data: cached.value.map((doc: any) => new collection.model(doc))}
	if (cached?.fetching)	
		return {refetch, isLoading: true, fetchP: cached.fetchP}
	
	throw new Error('Unhandled cache error')

	function watch() {
		refetchIfStale().then(listenForChanges)
		return () => listener.current.cancel()
	}

	async function refetch() {
		await collection.db.find(mapped)
		rerender()
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
		)
			await refetch()
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
		refetch: docs.refetch,
		isLoading: docs.isLoading,
		error: docs.error || (docs.data?.length ? undefined : new NotFoundError()),
		data: docs.data?.length ? docs.data[0]: undefined,
	}
}

/**
 * A Stateful db query hook to get a count of docs that match a query
 */
function useCount<PM extends PouchModel<any>>(collection: any, findProps: IFindProps<PM>): State<number> {
	const _findProps = {...clone(findProps), fields: []}
	const docs = useDocs<PM>(collection, _findProps)
	return {
		...docs,
		data: docs.data?.length,
	}
}

/**
 * A Suspenseful db query hook to get many docs
 */
function useDocsS<PM extends PouchModel<any>>(collection: any, findProps?: IFindProps<PM> | string, limit?: number): [PM[], State<any>['refetch']] {
	const state = useDocs(collection, findProps, limit)
	if (state.isLoading) throw state.fetchP
	if (state.error) throw state.error
	return [state.data!, state.refetch]
}

/**
 * A Suspenseful db query hook to get a single doc
 */
function useDocS<PM extends PouchModel<any>>(collection: any, findProps?: IFindProps<PM> | string): PM {
	const docs = useDocsS<PM>(collection, findProps, 1)
	return docs[0]?.[0] ?? throwNotFoundError()
}

/**
 * A Stateful db query hook to get a count of docs that match a query
 */
function useCountS<PM extends PouchModel<any>>(collection: any, findProps: IFindProps<PM>): [number, State<any>['refetch']] {
	const _findProps = {...clone(findProps), fields: []}
	const docs = useDocsS<PM>(collection, _findProps)
	return [docs[0].length, docs[1]]
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
function createModelUseCountHook<PM extends PouchModel<any>>(collection: any) {
	return function useModelCount(findProps?: IFindProps<PM> | string): State<number> {
		return useCount<PM>(collection, findProps as any)
	}
}
function createModelUseManyHookS<PM extends PouchModel<any>>(collection: any) {
	return function useModelDocsS(findProps?: IFindProps<PM> | string): [PM[], State<any>['refetch']] {
		return useDocsS<PM>(collection, findProps)
	}
}
function createModelUseHookS<PM extends PouchModel<any>>(collection: any) {
	return function useModelDocS(findProps?: IFindProps<PM> | string): PM {
		return useDocS<PM>(collection, findProps)
	}
}
function createModelUseCountHookS<PM extends PouchModel<any>>(collection: any) {
	return function useModelCountS(findProps?: IFindProps<PM> | string): [number, State<any>['refetch']] {
		return useCountS<PM>(collection, findProps as any)
	}
}

export function createModelHooks<PM extends PouchModel<any>>(collection: any) {
	return [
		createModelUseHook<PM>(collection),
		createModelUseManyHook<PM>(collection),
		createModelUseCountHook<PM>(collection),
		createModelUseHookS<PM>(collection),
		createModelUseManyHookS<PM>(collection),
		createModelUseCountHookS<PM>(collection),
	] as const
}