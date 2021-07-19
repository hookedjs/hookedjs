import { useLayoutEffect, useState } from '#lib/hooks'

import type PouchModel from './Model'

interface State<T> {
	data?: T
	error?: Error
	isLoading: boolean
}

// export default function useDoc<T>(collection: keyof typeof db, id: string) {
export function useDoc<T>(collection: any, id: string) {
	const [state, setState] = useState<State<T>>({isLoading: true})

	useLayoutEffect(watch, [id])
	
	return state
	
	async function refetch() {
		return collection.get(id)
			.then((doc: T) => setState({
				isLoading: false,
				error: undefined,
				data: doc as any,
			}))
			.catch((error: any) => {
				setState({
					isLoading: false,
					error,
				})
			})
	}
	
	function watch() {
		setState({isLoading: true})
		refetch()
		const listener = collection.db.subscribe([id], (doc: any) => {
			setState({
				isLoading: false,
				error: undefined,
				data: doc,
			})
		})
		return () => listener.cancel()
	}
}

export function useDocS<T extends {_id: string}>(collection: any, id: string) {
	const [state, setState] = useState<T | Promise<void> | Error>(refetch)

	useLayoutEffect(watch, [id])
	
	if (state instanceof Promise) throw state
	if (state instanceof Error) throw state
	return state as T
	
	async function refetch() {
		return collection.get(id)
			.then((doc: T) => setState(doc))
			.catch((error: any) => setState(error))
	}
	
	function watch() {
		const listener = collection.db.subscribe([id], (doc: any) => setState(doc))
		return () => listener.cancel()
	}
}

export function createModelUseHook<PM extends PouchModel<any>>(collection: any) {
	return function useModelDoc(id: string): State<PM> {
		const doc = useDoc<PM>(collection, id)
		return {
			...doc,
			data: doc.data ? new collection.model(doc.data) : undefined,
		}
	}
}

export function createModelUseHookS<PM extends PouchModel<any>>(collection: any) {
	return function useModelDocS(id: string): PM {
		const doc = useDocS<PM>(collection, id)
		return new collection.model(doc)
	}
}

export function createModelHooks<PM extends PouchModel<any>>(collection: any) {
	return [
		createModelUseHook<PM>(collection),
		createModelUseHookS<PM>(collection),
	] as const
}