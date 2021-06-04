import { AuthStore } from '#src/stores'

import { useInterval, useState } from './hooks'
import { ValidationErrorSet } from './validation'

/**
 * fetch helpers for the api
 */
async function apiFetch(input: string, init: RequestInit = {}) {
	init.headers = (init.headers || {}) as Record<string, any>
	if (AuthStore.value.token)
		init.headers.authorization = `Bearer ${AuthStore.value.token}`
	
	const res: FetchResponse = {raw: await fetch(input, init)}
	if(res.raw.headers.get('Content-Type') === 'application/json') {
		Object.assign(res, ...await res.raw.json())
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
	post: (url: string, bodyObj: any) => apiFetch(url, { method: 'POST', body: JSON.stringify(bodyObj)}),
	put: (url: string, bodyObj: any) => apiFetch(url, { method: 'PUT', body: JSON.stringify(bodyObj) }),
	patch: (url: string, bodyObj: any) => apiFetch(url, { method: 'PATCH', body: JSON.stringify(bodyObj)}),
	del: (url: string) => apiFetch(url, { method: 'DELETE'}),
}
export default methods

export function useGet<T>(uri: string, options: {refreshFreq?: number, throwOnError?: boolean} = {}): T {
	const { refreshFreq = 5 * 60 * 1000, throwOnError = true } = options
	const [res, setRes] = useState(getInitialValueOrPromise())
	useInterval(refreshIfStale, refreshFreq)
  
	if (res?.data || res?.error) return res
	throw res
  
	function getInitialValueOrPromise() {
		const cache = fetchCache.get(uri)
		if (cache) {
			if (Date.now() - cache[0] > 2000) getFresh()
			return cache[1]
		}
		return getFresh()
	}
	async function getFresh() {
		const fresh = await methods.get(uri).catch(e => ({error: e}))
		if (fresh?.error && throwOnError) throw fresh.error
		fetchCache.set(uri, [Date.now(), fresh])
		return fresh
	}
	async function refreshIfStale() {
		const cache = fetchCache.get(uri)
		if (Date.now() - (cache?.[0] ?? 0) > refreshFreq) {
			const next = await methods.get(uri)
			if (!Object.equals(next, cache?.[1])) setRes(next)
			fetchCache.set(uri, [Date.now(), next])
		}
	} 
}

const fetchCache = new Map()
;(function fetchCacheGarbageCollect() {
	const maxAge = 60*60*1000
	setInterval(() => {
		const now = Date.now()
		fetchCache.forEach((value, key, map) => {
			if(now - value[0] > maxAge) map.delete(key)
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
