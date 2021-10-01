import { Inputs, StateUpdater, useCallback, useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState } from 'preact/hooks'
export * from 'preact/hooks'

/**
 * useClickAway: Triggers a callback when user clicks outside the target element.
 * Ex. useClickAway(ref, callback);
 */
export function useClickAway<E extends Event = Event>(
	ref: Ref<HTMLElement | null>,
	onDismiss: (event: E) => void,
	events: string[] = useClickAway.defaultEvents
) {
	const savedCallback = useRef(onDismiss)
	useEffect(() => {savedCallback.current = onDismiss}, [onDismiss])
	useEffect(() => {
		const handler = (event: any) => {
			const { current: el } = ref
			el && !el.contains(event.target) && savedCallback.current(event)
		}
		for (const eventName of events) {
			document.addEventListener(eventName, handler)
		}
		return () => {
			for (const eventName of events) {
				document.removeEventListener(eventName, handler)
			}
		}
	}, [events, ref])
}
useClickAway.defaultEvents = ['mousedown', 'touchstart']


/**
 * useEvent: subscribes a handler to events.
 * Ex. useEvent('keydown', callback); (also see useKey)
 */
export function useEvent<T extends UseEventTarget>(
	name: Parameters<AddEventListener<T>>[0],
	handler?: null | undefined | Parameters<AddEventListener<T>>[1],
	target: null | T | Window = window,
	options?: UseEventOptions<T>
) {
	useEffect(() => {
		if (!handler) return
		if (!target) return
		target.addEventListener(name, handler, options)
		return () => {target.removeEventListener(name, handler, options)}
	}, [name, handler, target, JSON.stringify(options)])
}
export interface ListenerType1 {
  addEventListener(name: string, handler: (event?: any) => void, ...args: any[]): void;
  removeEventListener(name: string, handler: (event?: any) => void, ...args: any[]): void;
}
export type UseEventTarget = ListenerType1
type AddEventListener<T> = T extends ListenerType1
  ? T['addEventListener']
  : never;
export type UseEventOptions<T> = Parameters<AddEventListener<T>>[2];



/**
 * executes a handler when a keyboard key is used. 
 * Ex. useKey('ArrowUp', callback);
 */
export function useKey<T extends UseEventTarget>(
	key: KeyFilter,
	fn: Handler = () => {},
	opts: UseKeyOptions<T> = {},
	deps: Inputs = [key]
) {
	const { event = 'keydown', target, options } = opts
	const useMemoHandler = useMemo(() => {
		const predicate: KeyPredicate = useKey.createKeyPredicate(key)
		const handler: Handler = (handlerEvent) => {
			if (predicate(handlerEvent)) return fn(handlerEvent)
		}
		return handler
	}, deps)
	useEvent(event, useMemoHandler, target, options)
}
useKey.codes = {
	Esc: 27,
}
useKey.createKeyPredicate = (keyFilter: KeyFilter): KeyPredicate =>
	typeof keyFilter === 'function'
		? keyFilter
		: typeof keyFilter === 'string'
			? (event: KeyboardEvent) => event.key === keyFilter
			: keyFilter
				? () => true
				: () => false
export type KeyPredicate = (event: KeyboardEvent) => boolean;
export type KeyFilter = null | undefined | string | number | ((event: KeyboardEvent) => boolean);
export type Handler = (event: KeyboardEvent) => void;
export interface UseKeyOptions<T extends UseEventTarget> {
	event?: 'keydown' | 'keypress' | 'keyup';
	target?: T | null;
	options?: UseEventOptions<T>;
}


/**
 * useEffectDeep: Like useEffect, but does a deep compare instead default compare
 * to avoid misfires
 */
export function useEffectDeep(callback: Fnc, varsToWatch: Inputs[]) {
	const lastSeenProps = useRef<Inputs[]>([])
	useEffect(watchProps, [varsToWatch])

	function watchProps() {
		if (isNotEqual(varsToWatch, lastSeenProps.current)) {
			lastSeenProps.current = varsToWatch
			return callback()
		}
	}
}

/**
 * useLayoutEffectDeep: Like useLayoutEffect, but does a deep compare instead default compare
 * to avoid misfires
 */
export function useLayoutEffectDeep(callback: Fnc, varsToWatch: Inputs[]) {
	const lastSeenProps = useRef<Inputs[]>([])
	useLayoutEffect(watchProps, [varsToWatch])

	function watchProps() {
		if (isNotEqual(varsToWatch, lastSeenProps.current)) {
			lastSeenProps.current = varsToWatch
			return callback()
		}
	}
}

/**
 * useEffectDeep: Like useEffect, but does a deep compare instead default compare
 * to avoid misfires
 */
export function useMemoDeep(callback: Fnc, varsToWatch: Inputs[]) {
	const [lastSeenProps, setLastSeenProps] = useState(varsToWatch)
	useEffect(watchProps, [varsToWatch])
	return useMemo(callback, [lastSeenProps])

	function watchProps() {
		if (isNotEqual(varsToWatch, lastSeenProps))
			setLastSeenProps(varsToWatch)
	}
}

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
	const [state, setState] = useState(matchMedia(query).matches)
	useEffect(() => {
		let mounted = true
		const mql = matchMedia(query)
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
	const clear: UseSet<T>['clear'] = useCallback(() => setSet(new Set<T>()), [])
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
