import { useLayoutEffect, useState } from '#src/lib/hooks'

interface State<T> {
	data?: T
	error?: Error
	isLoading: boolean
}

// export default function useDoc<T>(collection: keyof typeof db, id: string) {
export function useDoc<T>(collection: any, id: string) {
	const [state, setState] = useState<State<T>>({isLoading: true})

	useLayoutEffect(watch, [id])
	// if (state.isLoading) throw fetchingP.current
	
	return state
	
	async function refetch() {
		const doc = await collection.get(id)
		setState({
			isLoading: false,
			error: undefined,
			data: doc as any,
		})
	}
	
	function watch() {
		setState({isLoading: true})
		refetch()
		const listener = collection._db.subscribe([id], (doc: any) => {
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
	if (state instanceof Error) throw Error
	return state as T
	
	async function refetch() {
		const doc = await collection.get(id)
		setState(doc)
	}
	
	function watch() {
		const listener = collection._db.subscribe([id], (doc: any) => {
			setState(doc)
		})
		return () => listener.cancel()
	}
}