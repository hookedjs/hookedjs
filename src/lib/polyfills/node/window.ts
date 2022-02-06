/**
 * Polyfills for Node to be able to run code that use Browser APIs
 * 
 * Some polyfills are functional, some are not.
 */

import http from 'http'
import https from 'https'
import nodeFetch from 'node-fetch'

if (!globalThis.window) {
	const querySelector = () => element
	const appendChild = () => {}
	const element = {
		createElement: () => ({appendChild}),
		querySelector,
		appendChild,
		getAttribute: () => '',
		addEventListener: () => {},
		innerHeight: 0,
		innerWidth: 0,
		classList: {
			add: () => {},
			remove: () => {},
		},
	}
	const windowMock = {
		localStorage: {getItem(){},setItem(){}},
		...element,
		document: {
			...element,
			body: element,
			head: element,
			cookie: '',
		},
		history: {
			pushState(){},
			replaceState(){},
		},
		location: {
			hash: 'blah',
			pathname: '/',
			search: 'blah',
			host: 'blah',
			hostname: 'blah',
		},
		fetch,
	}

	Object.assign(globalThis, {window: windowMock, ...windowMock})
}

// Wraps fetch to inject global cookies, similar to browsers
function fetch(url: string, options: any = {}) {
	return nodeFetch(url, {
		...options,
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json',
			...options.headers,
			cookie: `${options.headers?.cookie ?? ''} ${globalThis?.document?.cookie ?? ''}`.trim() || undefined,
		},
		credentials: 'include',
		agent: (url) => url.protocol == 'http:' ? httpAgent : httpsAgent,
	})
}
const httpAgent = new http.Agent({
	keepAlive: true,
})
const httpsAgent = new https.Agent({
	rejectUnauthorized: false,
	keepAlive: true,
})
