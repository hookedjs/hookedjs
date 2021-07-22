import { StateUpdater, useCallback, useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState } from 'preact/hooks'
export * from 'preact/hooks'

/**
 * useEffectDeep: Like useEffect, but does a deep compare instead default compare
 * to avoid misfires
 */
export function useEffectDeep(callback: FunctionType, varsToWatch: any[]) {
	const lastSeenProps = useRef('')
	useEffect(() => {
		const next = JSON.stringify(varsToWatch)
		if (lastSeenProps.current !== next) {
			lastSeenProps.current = next
			return callback()
		}
	}, [varsToWatch])
}

/**
 * useLayoutEffectDeep: Like useEffect, but does a deep compare instead default compare
 * to avoid misfires
 */
export function useLayoutEffectDeep(callback: FunctionType, varsToWatch: any[]) {
	const lastSeenProps = useRef('')
	useLayoutEffect(() => {
		const next = JSON.stringify(varsToWatch)
		if (lastSeenProps.current !== next) {
			lastSeenProps.current = next
			return callback()
		}
	}, [varsToWatch])
}

/**
 * useEffectDeep: Like useEffect, but does a deep compare instead default compare
 * to avoid misfires
 */
export function useMemoDeep(callback: FunctionType, varsToWatch: any[]) {
	const [lastSeenProps, setLastSeenProps] = useState(JSON.stringify(varsToWatch))
	useEffect(() => {
		const nextProps = JSON.stringify(varsToWatch)
		if (lastSeenProps !== nextProps)
			console.log(nextProps)
		if (lastSeenProps !== nextProps)
			setLastSeenProps(nextProps)
	}, [varsToWatch])
	return useMemo(callback, [lastSeenProps])
}

// export function useMemoDeep(callback: FunctionType, varsToWatch: any[]) {
// 	const lastSeenPropsJson = useRef(JSON.stringify(varsToWatch))
// 	const [memo, setMemo] = useState(callback)
// 	const memoLastJson = useRef(JSON.stringify(memo))
// 	useEffect(() => {
// 		const nextPropsJson = JSON.stringify(varsToWatch)
// 		if (lastSeenPropsJson.current !== nextPropsJson) {
// 			lastSeenPropsJson.current = nextPropsJson
// 			const nextMemo = callback()
// 			const nextMemoJson = JSON.stringify(nextPropsJson)
// 			if (memoLastJson.current !== nextMemoJson) {
// 				memoLastJson.current = nextMemoJson
// 				console.log('useDeepMemo')
// 				setMemo(nextMemo)
// 			}
// 		}
// 	}, [varsToWatch])
// 	return memo
// }

// export function useMemoDeep(callback: FunctionType, varsToWatch: any[]) {
// 	const [memo, setMemo] = useState(callback)
// 	const memoLastJson = useRef(JSON.stringify(memo))
// 	useEffectDeep(() => {
// 		const nextMemo = callback()
// 		const nextMemoJson = JSON.stringify(nextMemo)
// 		if (memoLastJson.current !== nextMemoJson) {
// 			memoLastJson.current = nextMemoJson
// 			console.log('useDeepMemo')
// 			setMemo(nextMemo)
// 		}
// 	}, [varsToWatch])
// 	return memo
// }

/**
 * useFirstMountState: check if current render is first.
 * from react-use
 */
export function useFirstMountState(): boolean {
	const isFirst = useRef(true)
	if (isFirst.current) {
		isFirst.current = false
		return true
	}
	return isFirst.current
}

/**
 * useForceUpdate: returns a callback, which re-renders component when called
 * from react-use's useUpdate
 */
export const useForceUpdate = useUpdate

/**
 * useInterval: Call callback cb every ms milliseconds after mount
 * @param cb - callback to call after timeout
 * @param ms - milliseconds to wait before calling cb after mount
 * @param cancelOnDismount - whether to cancel on dismount
 */
export function useInterval(cb: () => any, ms = 0, cancelOnDismount = true) {
	useEffect(() => {
		const interval = setInterval(cb, ms)
		return () => { if(cancelOnDismount) clearInterval(interval) }
	}, [])
}

/**
 * useMountedState: returns a fcn that returns true if component is mounted.
 * from react-use
 */
export function useMountedState() {
	const isMountedRef = useRef(true)
	const isMounted = useCallback(() => isMountedRef.current, [])
	useEffect(() => {
		isMountedRef.current = true
		return () => { isMountedRef.current = false }
	}, [])
	return isMounted
}

/**
 * A hook that watches a css media breakpoint
 */
export function useMedia(query: string) {
	const [state, setState] = useState(window.matchMedia(query).matches)
	useEffect(() => {
		let mounted = true
		const mql = window.matchMedia(query)
		const onChange = () => mounted && setState(!!mql.matches)
		mql.addEventListener('change', onChange)
		setState(mql.matches)
		return () => {
			mounted = false
			mql.removeEventListener('change', onChange)
		}
	}, [query])
	return state
}

/**
 * Use a stateful Set as if it were almost a normal Set, with helpers like toggle and reset.
 */
export interface UseSet<T> {
	current: Set<T>
	size: number
	has(v: T): boolean
	add(v: T): void
	delete(v: T): void
	toggle(v: T): void
	clear(): void
	reset(): void
	set: StateUpdater<Set<T>>
}
export function useSet<T>(initial: Set<T> = new Set()) {
	const [set, setSet] = useState(initial)
	const has: UseSet<T>['has'] = v => set.has(v)
	const add: UseSet<T>['add'] = useCallback(v => setSet(curr => { curr.add(v); return new Set([...curr]) }), [])
	const del: UseSet<T>['delete'] = useCallback(v => setSet(curr => { curr.delete(v); return new Set([...curr]) }), [])
	const toggle: UseSet<T>['toggle'] = useCallback(v => setSet(curr => { if (curr.has(v)) curr.delete(v); else curr.add(v); return new Set([...curr]) }), [])
	const clear: UseSet<T>['clear'] = useCallback(() => setSet(new Set()), [])
	const reset: UseSet<T>['reset'] = useCallback(() => setSet(new Set([...initial])), [])
	const res: UseSet<T> = { current: set, size: set.size, has, add, delete: del, toggle, clear, reset, set: setSet }
	return res
}

/**
 * useTimeout: Call callback cb after ms milliseconds after mount
 * @param cb - callback to call after timeout
 * @param ms - milliseconds to wait before calling cb after mount
 * @param cancelOnDismount - whether to cancel on dismount
 */
export function useTimeout(cb: () => any, ms = 0, cancelOnDismount = true) {
	useEffect(() => {
		const timeout = setTimeout(cb, ms)
		return () => { if(cancelOnDismount) clearTimeout(timeout) }
	}, [])
}

/**
 * useUpdate: returns a callback, which re-renders component when called
 * @param ms - if supplied, will automatically re-render after ms milliseconds
 */
export function useUpdate(ms = 0) {
	const updateReducer = (num: number): number => (num + 1) % 1_000_000
	const [, update] = useReducer(updateReducer, 0)
	useTimeout(() => { if (ms) (update as () => void)()}, ms)
	return update as () => void
}

/**
 * useUpdateEffect: run an effect only on updates.
 * from react-use
 */
export const useUpdateEffect: typeof useEffect = (effect, deps) => {
	const isFirstMount = useFirstMountState()
	useEffect(() => {
		if (!isFirstMount) {
			return effect()
		}
	}, deps)
}
