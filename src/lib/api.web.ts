import { AuthStore } from '#src/stores'

import { useInterval, useState } from './hooks'
import { ValidationErrorSet } from './validation'

const fetchCache = new Map<string, {time: number, snap: FetchResponse}>()

/**
 * fetch helpers for the api
 */
async function apiFetch(input: string, init: RequestInit = {}) {
	init.headers = (init.headers || {}) as Record<string, any>
	if (!init.headers['content-type'])
		init.headers['content-type'] = 'application/json'
	if (AuthStore.value.token)
		init.headers.authorization = `Bearer ${AuthStore.value.token}`
	
	const res: FetchResponse = {raw: await fetch(input, init)}
	if(res.raw.headers.get('content-type').startsWith('application/json')) {
		const json = await res.raw.json()
		res.data = json.data
		res.error = json.error
		if (res.error?.type === 'ValidationErrorSet')
			throw new ValidationErrorSet(input, res.error?.context.errorSet)
		if (res.error?.type === 'ForbiddenError')
			window.location.pathname = `/auth/login?from=${location.pathname}`
		if (res.error) 
			throw res.error
	}
	return res
}
const methods = {
	get: (url: string) => apiFetch(url),
	post: (url: string, bodyObj: any) => apiFetch(url, { method: 'post', body: JSON.stringify(bodyObj)}),
	put: (url: string, bodyObj: any) => apiFetch(url, { method: 'PUT', body: JSON.stringify(bodyObj) }),
	patch: (url: string, bodyObj: any) => apiFetch(url, { method: 'PATCH', body: JSON.stringify(bodyObj)}),
	del: (url: string) => apiFetch(url, { method: 'DELETE'}),
}
export default methods

/**
 * useGet: React hook to fetch data from api
 * @param uri 
 * @param options 
 * @returns value when ready, null when loading
 */
export function useGet<T>(uri: string, options: {refreshFreq?: number} = {}): T {
	const { refreshFreq = 5 * 60 * 1000 } = options
	const [res, setRes] = useState(getCacheOrPromise())
	useInterval(refreshIfStale, refreshFreq)

	if (res?.error) throw res.error
	return res?.data

  
	function getCacheOrPromise() {
		const cache = fetchCache.get(uri)
		if (cache) {
			// If cache is old, refreshing in background
			if (Date.now() - cache.time > 2000) getFresh()
			return cache.snap
		}
		getFresh()
		return {} as FetchResponse
	}
	async function getFresh() {
		const cache = fetchCache.get(uri)
		const fresh = await methods.get(uri)
		// If fresh == cache, do nothing
		if (!Object.equals(fresh, cache?.snap)) {
			setRes(fresh)
			fetchCache.set(uri, {time: Date.now(), snap: fresh})
		}
		return fresh
	}
	async function refreshIfStale() {
		// Even though this only runs every refreshFreq, still check
		// because there may be multiple consumers of the same cache
		const cache = fetchCache.get(uri)
		if (Date.now() - (cache?.time ?? 0) > refreshFreq) {
			return getFresh()
		}
	} 
}

(function fetchCacheGarbageCollect() {
	const maxAge = 60*60*1000
	setInterval(() => {
		const now = Date.now()
		fetchCache.forEach((value, key, map) => {
			if(now - value.time > maxAge) map.delete(key)
		})
	}, 31*60*1000)
})()


interface FetchResponse {
	raw: any
  data?: any
  error?: {
    type: string
    note: string
    context: {
      entity: any
      errorSet: Record<string, string>[]
    }
  }
}
