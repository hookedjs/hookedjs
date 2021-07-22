import { useEffect, useEffectDeep, useLayoutEffect, useLayoutEffectDeep, useMemo, useMemoDeep, useRef, useState, useUpdate } from '#lib/hooks'
import { NotFoundError, throwError, throwNotFoundError } from '#src/lib/validation'

import type { IFindProps } from './Database'
import type PouchModel from './Model'

interface State<T> {
	data?: T
	error?: Error
	isLoading: boolean
}


// export default function useDoc<T>(collection: keyof typeof db, id: string) {
export function useDocs<PM extends PouchModel<any>>(collection: any, findProps: IFindProps<PM>): State<PM[]> {
	const rerender = useUpdate()
	useEffect(watch, [findProps])
	const listener = useRef({cancel(){}})

	const mapped = Object.clone({
		selector: {},
		...(typeof findProps === 'string' ? {selector: {_id: {$in: findProps}}} as any: findProps),
	})
	mapped.selector.type = collection.model.type

	const
		cacheKey = JSON.stringify(mapped),
		cached = collection.db.findCache.get(cacheKey)

	if (cached?.error)
		return {isLoading: false, error: cached.error}
	if (cached?.value)
		return {isLoading: false, data: cached.value.map((doc: any) => new collection.model(doc))}
	
	return {isLoading: true}

	
	function watch() {
		refetchIfStale().then(listenForChanges)
		return () => listener.current.cancel()
	}

	async function refetchIfStale() {
		if (!cached || !cached.fetching && Date.now() - cached.time > 3000) {
			await collection.find(mapped)
			rerender()
		}
	}

	// This is exactly the same as listenForChanges in useDocsS
	function listenForChanges() {
		const cached = collection.db.findCache.get(cacheKey)
		// Watch for future changes
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


export function useDoc<PM extends PouchModel<any>>(collection: any, findProps?: IFindProps<PM> | string): State<PM> {
	const mapped: IFindProps<PM> = {
		...(typeof findProps === 'string' ? {selector: {_id: findProps}} as any: findProps),
		limit: 1,
	}
	const docs = useDocs<PM>(collection, mapped)
	
	return {
		isLoading: docs.isLoading,
		error: docs.error || (docs.data?.length ? undefined : new NotFoundError()),
		data: docs.data?.length ? docs.data[0]: undefined,
	}
}

export function useDocsS<PM extends PouchModel<any>>(collection: any, findProps?: IFindProps<PM> | string): PM[] {
	const listener = useRef({cancel(){}})
	useEffect(watch, [findProps])
	const rerender = useUpdate()

	const mapped = Object.clone({
		selector: {},
		...(typeof findProps === 'string' ? {selector: {_id: {$in: findProps}}} as any: findProps),
	})
	mapped.selector.type = collection.model.type

	const
		cacheKey = JSON.stringify(mapped),
		cached = collection.db.findCache.get(cacheKey)

	if (cached) {
		if (cached.fetching) throw cached.fetchP
		if (cached.error) throw cached.error
		return cached.value.map((doc: any) => new collection.model(doc))
	}

	throw collection.find(mapped)
	
	function watch() {
		if (cached?.value)
			refetchIfStale().then(listenForChanges)
		return () => listener.current.cancel()
	}

	async function refetchIfStale() {
		if (!cached.fetching && Date.now() - cached.time > 3000) {
			await collection.find(mapped)
			rerender()
		}
	}

	// This is exactly the same as listenForChanges in useDocs
	function listenForChanges() {
		const cached = collection.db.findCache.get(cacheKey)
		// Watch for future changes
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

export function useDocS<PM extends PouchModel<any>>(collection: any, findProps?: IFindProps<PM> | string): PM {
	const findPropsMapped = useMemoDeep(mapProps, [findProps])
	const docs = useDocsS<PM>(collection, findPropsMapped)
	return docs?.[0] ?? throwNotFoundError()

	function mapProps() {
		const mapped: IFindProps<PM> = {
			...(typeof findProps === 'string' ? {selector: {_id: findProps}} as any: findProps),
			limit: 1,
		}
		return mapped
	}		
}


export function createModelUseManyHook<PM extends PouchModel<any>>(collection: any) {
	return function useModelDocs(findProps?: IFindProps<PM> | string): State<PM[]> {
		const docs = useDocs<PM>(collection, findProps as any)
		return {
			...docs,
			data: docs.data ? docs.data.map(doc => new collection.model(doc)) : undefined,
		}
	}
}
export function createModelUseHook<PM extends PouchModel<any>>(collection: any) {
	return function useModelDoc(findProps?: IFindProps<PM> | string): State<PM> {
		const doc = useDoc<PM>(collection, findProps)
		return {
			...doc,
			data: doc.data ? new collection.model(doc.data) : undefined,
		}
	}
}
export function createModelUseManyHookS<PM extends PouchModel<any>>(collection: any) {
	return function useModelDocsS(findProps?: IFindProps<PM> | string): PM[] {
		const docs = useDocsS<PM>(collection, findProps)
		return docs.map(doc => new collection.model(doc))
	}
}
export function createModelUseHookS<PM extends PouchModel<any>>(collection: any) {
	return function useModelDocS(findProps?: IFindProps<PM> | string): PM {
		const doc = useDocS<PM>(collection, findProps)
		return new collection.model(doc)
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