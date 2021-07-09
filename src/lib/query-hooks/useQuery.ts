import { useCallback, useEffect, useMemo, useState, useUpdateEffect } from '../hooks'

type FetcherResponse<FetcherShape extends PromiseFnc> = ThenArg<ReturnType<FetcherShape>>;
type FetcherResponseNoError<FetcherShape extends PromiseFnc> = Exclude<FetcherResponse<FetcherShape>, Error>;
interface HookState<Fetcher extends PromiseFnc> {
	isLoading: boolean
	data?: FetcherResponseNoError<Fetcher>
	error?: Error
	refetch(): Promise<FetcherResponse<Fetcher>>
}

/**
 * Hookifies a fetcher callback function with typesafety, helpful options, smart caching
 * and race de-duping
 *
 * Race de-duping: If multiple components use the hook with the same props at the same time,
 * useAync will only call the fetcher once and return the response to both components
 *
 * @param fetcher - an async function that returns data. Supports fetchers that throw errors or return an Error
 * @param params - parameters to pass to fetcher
 * @param options - options for the hook: mode and refetchInterval
 *
 * Ex.
 *   const getUsers  = async () => {const c = new GrpcClient(); c.searchUsers({page, pageSize})
 *   const getUsers2 = async (page: number, pageSize: number) => {const c = new GrpcClient(); c.searchUsers({page, pageSize})
 *
 *   function MyComponent() {
 *     const users1 = useQuery(getUsers) // type error missing params arg
 *     const users2 = useQuery(getUsers, []) // no type error
 *     const users3 = useQuery(getUsers, [], {mode: 'noCache'}) // no type error
 *     const users4 = useQuery(getUsers, [1, 10]) // type error unexpected args
 *
 *     const users5 = useQuery(getUsers2) // type error missing params arg
 *     const users6 = useQuery(getUsers2, []) // type error missing args page and pageSize
 *     const users7 = useQuery(getUsers2, [], {mode: 'noCache'}) // type error missing args page and pageSize
 *     const users8 = useQuery(getUsers2, [1, 10]) // no type error
 *   }
 */
export default function useQuery<FetcherShape extends PromiseFnc>(
	// Fetcher function to use
	fetcher: FetcherShape,
	// parameters to pass to the fetcher function
	params: Parameters<FetcherShape>,
	options: {
		staleWhileRefresh?: boolean
		refetchOnMount?: boolean
		refetchInterval?: number
		cacheKey?: string
	} = {},
): HookState<FetcherShape> {

	const { cache } = useQuery

	const {
		staleWhileRefresh = true,
		refetchOnMount = true,
		refetchInterval,
		cacheKey
	} = options

	const refetchCb = useCallback(fetcherWithRaceDedup, [fetcherWithRaceDedup])

	const [paramState, setParamState] = useState({params, version: 0})
	const cacheKeyM = useMemo(
		() => cacheKey || `${fetcher.name}-${fetcher.toString().toHash()}-${JSON.stringify(params).toHash()}`,
		[cacheKey, paramState],
	)
	const [state, setState] = useState<HookState<FetcherShape>>(initialize)

	useEffect(watchParams, [...params])
	useEffect(subscribe, [paramState])
	useEffect(poll, [paramState, refetchInterval])
	useUpdateEffect(() => {initialize()}, [paramState])

	return state

	function watchParams() {
		if (JSON.stringify(paramState.params) !== JSON.stringify(params))
			setParamState(last => ({params, version: last.version+1}))
	}
	
	function subscribe() {
		console.log('sub')
		const hit = cache.get(cacheKeyM)!
		const key = Math.max(0, ...Array.from(hit?.subscribers.keys() ?? [])) + 1
		hit?.subscribers.set(key, () => {
			const latest = cache.get(cacheKeyM)!
			latest.fetchP
				?.then(result => {
					if (JSON.stringify(result) !== JSON.stringify(state.data))
						setState({
							isLoading: false,
							data: result,
							error: undefined,
							refetch: refetchCb,
						})
					return result
				})
				?.catch(error => {
					if (JSON.stringify(error) !== JSON.stringify(state.error))
						setState({
							isLoading: false,
							data: undefined,
							error,
							refetch: refetchCb,
						})
					return error
				})
		})
		cache.set(cacheKeyM, hit)
		return () => {
			const hit = cache.get(cacheKeyM)
			hit?.subscribers.delete(key)
		}
	}

	/**
	 * Calculate the initial state and trigger fetch
	 */
	function initialize(): HookState<FetcherShape> {
		let hit = cache.get(cacheKeyM)

		if (!hit) {
			hit = {
				fetching: true,
				fetchP: undefined,
				value: undefined,
				time: 0,
				subscribers: new Map(),
				refetch: () => fetcherWithRaceDedup(),
			}
			cache.set(cacheKeyM, hit)
		}

		const initialState =
			hit?.value && staleWhileRefresh
				? {
					isLoading: false,
					data: hit.value,
					error: undefined,
					refetch: refetchCb,
				}
				: {
					isLoading: true,
					data: undefined,
					error: undefined,
					refetch: refetchCb,
				}

		if (hit?.value === undefined || refetchOnMount) fetcherWithRaceDedup()

		return initialState
	}

	/**
	 * Wraps fetcher with race de-duping handling
	 *
	 * For example, If multiple components use the hook with the same props at the same time,
	 * useAync will only call the fetcher once and return the response to both components
	 */
	function fetcherWithRaceDedup() {
		const hit = cache.get(cacheKeyM)

		if (hit?.fetchP && hit?.value && Date.now() - hit?.time < 50)
			return hit.fetchP

		// If already fetching (aka race duplicate), return the existing promise
		// Otherwise trigger the fetch in background
		if (hit?.fetchP && hit?.fetching)
			return hit.fetchP

		const fetchP = fetcher(...(params as any))

		// Set the cache to be aware that a fetch is in progress
		cache.set(cacheKeyM, {
			fetching: true,
			fetchP: fetchP,
			value: hit?.value,
			time: hit?.time ?? 0,
			subscribers: hit?.subscribers ?? new Map(),
			refetch: () => fetcherWithRaceDedup(),
		})

		// Update the state and cache once the fetch has completed
		fetchP
			.then(result => {
				const hit2 = cache.get(cacheKeyM)!
				cache.set(cacheKeyM, {
					...hit2,
					fetching: false,
					value: result,
					error: undefined,
					time: Date.now(),
				})
				hit2.subscribers.forEach(cb => cb())
				return result
			})
			.catch(error => {
				const hit2 = cache.get(cacheKeyM)!
				cache.set(cacheKeyM, {
					...hit2,
					fetching: false,
					value: undefined,
					error,
					time: Date.now(),
				})
				hit2.subscribers.forEach(cb => cb())
				return error
			})

		return fetchP
	}

	/**
	 * If refetchInterval specified, refetch in that interval with race handling
	 */
	function poll() {
		if (refetchInterval) {
			const interval = setInterval(() => {
				const hit = cache.get(cacheKeyM) || {
					fetching: false,
					value: undefined,
					time: 0,
				}
				if (Date.now() - hit.time > refetchInterval) fetcherWithRaceDedup()
			}, refetchInterval)
			return () => clearInterval(interval)
		}
		return () => {}
	}
}

useQuery.cache = new Map<
	string,
	{
		fetching: boolean
		fetchP: Promise<any> | undefined
		value: any
		error?: Error
		time: number
		subscribers: Map<number, () => any>
		refetch(): Promise<any>
	}
>();
(function cacheGarbageCollect() {
	const maxAge = 10 * 60 * 1000
	setInterval(() => {
		const now = Date.now()
		useQuery.cache.forEach((value, key, map) => {
			if (now - value.time > maxAge) map.delete(key)
		})
	}, maxAge / 2 + 1)
})()

useQuery.invalidateQueries = function (prefixes: string[]) {
	Array.from(useQuery.cache.keys())
		.filter(k => prefixes.some(p => k.startsWith(p)))
		.forEach(k => useQuery.cache.get(k)?.refetch())
}
