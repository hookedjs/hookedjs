import { AuthStore } from '#src/stores'

import { useCallback } from './hooks'
import { useMutation, useQuery } from './query-hooks'
import { ForbiddenError, FormValidationErrorSet, ValidationErrorSet } from './validation'

/**
 * fetch helpers for the api
 */
async function apiFetch<Data>(input: string, init: RequestInit = {}) {
	init.headers = (init.headers || {}) as Record<string, any>
	if (!init.headers['content-type'])
		init.headers['content-type'] = 'application/json'
	// if (AuthStore.value.token)
	// 	init.headers.authorization = `Bearer ${AuthStore.value.token}`

	const res = await fetch(input, init)
	
	if(res.headers.get('content-type')?.startsWith('application/json')) {
		const json: JsonResponse<Data> = await res.json()
		if (json.error) {
			if (json.error?.type === 'ValidationErrorSet' && json.error?.context?.errorSet) {
				throw new ValidationErrorSet(input, json.error.context.errorSet)
			}
			if (json.error?.type === 'ForbiddenError') {
				window.location.pathname = `/auth/login?from=${location.pathname}`
				throw new ForbiddenError()
			}
			throw new FormValidationErrorSet(json, 'Server is unavailable, please try later.')
		}
		if (!json.data)
			throw new FormValidationErrorSet(json, 'Server is unavailable, please try later.')
		return json.data
	}
	else if (!res.ok) {
		if (res.status === 403) {
			window.location.pathname = `/auth/login?from=${location.pathname}`
			throw new ForbiddenError()
		}
		throw new FormValidationErrorSet(res, `Unknown server error: ${res.status}`)
	}
	else if(res.headers.get('content-type')?.includes('text')) {
		const data: Data = await res.text() as any
		return data
	}
	else {
		const data: Data = await res.blob() as any
		return data
	}
}
interface JsonResponse<Data> {
  data?: Data
  error?: {
    type: string
    note: string
    context: {
      entity: any
      errorSet: Record<string, string>[]
    }
  }
}


const api = {
	get<Data>(url: string) {return apiFetch<Data>(url)},
	post<Data>(url: string, bodyObj: any) {return apiFetch<Data>(url, { method: 'post', body: JSON.stringify(bodyObj)})},
	put<Data>(url: string, bodyObj: any) {return apiFetch<Data>(url, { method: 'PUT', body: JSON.stringify(bodyObj) })},
	patch<Data>(url: string, bodyObj: any) {return apiFetch<Data>(url, { method: 'PATCH', body: JSON.stringify(bodyObj)})},
	del<Data>(url: string) {return apiFetch<Data>(url, { method: 'DELETE'})},
} as const
export default api

/**
 * useGet: React hook to fetch data from api
 * @param uri - string of uri to get
 * @param options - useQuery options
 * @returns typed useQuery response
 */
export function useBffQuery<Data>(uri: string, options: Parameters<typeof useQuery>[2]) {
	// Wrap methods.get so that we can type-cast it from Data
	const bffGet = useCallback(function bffGetCb(uri2: string) {return api.get<Data>(uri2)}, [])
	const query = useQuery(bffGet, [uri], {...options, cacheKey: uri})
	return query
}

export function useBffMutation<Data>(
	method: typeof api['post'] | typeof api['put'] | typeof api['patch'] | typeof api['del'],
	uri: string,
	body: any,
	options: Parameters<typeof useMutation>[1],
) {
	return useMutation(() => method<Data>(uri, body), options)
}
const useBffMutationC = Function.curry(useBffMutation)
export const useBffPost = useBffMutationC(api.post)
export const useBffPut = useBffMutationC(api.put)
export const useBffPatch = useBffMutationC(api.patch)
export const useBffDel = useBffMutationC(api.del)
