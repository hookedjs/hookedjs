/* eslint-disable prefer-rest-params */
/**
 * Polyfills for Function
 */

// You must export something or TS gets confused.
export {}

declare global {
	interface FunctionConstructor {
		/**
		 * A memoization wrapper with ttl expiration for cache hits.
		 *
		 * What: Returns the last response from a function if called again with same props
		 * before ttl interval has passed.
		 *
		 * Compared to other memoization algs (fast-memoize, nano-memoize), is much simpler,
		 * shorter, easier to fork/enhance while less perfect and slower for primitive args.
		 */
		withCache: {
			// eslint-disable-next-line @typescript-eslint/ban-types
			<F extends Function>(fn: F, ttl: number): F
			cache: Map<string, { returnVal: any; expires: number }>
		}

		/**
		 * Get the name of the current function.
		 */
		getName(): string

		/**
		 * Curry's functions
		 * 
		 * Ex.
		 * function foo(a: string, b: string, c: number) {console.log(a + b + c)}
		 * const hello = curry(foo)('hello', 'world')
		 * hello('1') // prints 'helloworld1'
		 * hello('2') // prints 'helloworld2'
		 */
		curry: typeof curry

		/**
		 * Wrap a function with retry logic
		 * @param fn - the function to wrap
		 * @param maxTries - the maximum number of tries
		 * @returns - the wrapped function
		 */
		withRetry<T extends Fnc>(fn: T, maxTries?: number): (...props: Parameters<T>) => Promise<ReturnTypeP<T>>
	}
}

// @ts-ignore: missing cache in declaration
Function.withCache = (fn, ttl = 1e3) => {
	const self = Function.withCache
	if (!self.cache) initializeCache()
	return function throttled(...props: any) {
		const cache = self.cache
		const cacheKey = [fn.name, fn.toString(), arguments]._toHash()
		let { returnVal = null, expires = 0 } = cache.get(cacheKey) || {}
		const now = Date.now()
		if (now < expires) return returnVal
		returnVal = fn(...props)
		expires = now + ttl
		cache.set(cacheKey, { returnVal, expires })
		return returnVal
	}

	function initializeCache() {
		const cache = self.cache = new Map()
		setInterval(() => {
			const now = Date.now()
			cache.forEach((_, key) => {
				if (now > cache.get(key).expires) cache.delete(key)
			})
		}, 20e3)
	}
}

Function.getName = () => {
	const stackLine = (new Error())!.stack!.split('\n')[2].trim()
	const fncName = stackLine.match(/at Object.([^ ]+)/)?.[1] ?? 'anonymous'
	return fncName
}

function curry<A extends any[], R>(fn: (...args: A) => R): Curried<A, R> {
	return (...args: any[]): any =>
		args.length >= fn.length ? fn(...args as any) : curry((fn as any).bind(undefined, ...args))
}
Function.curry = curry
type Curried<A extends any[], R> =
  <P extends Partial<A>>(...args: P) => P extends A ? R :
    A extends [...SameLength<P>, ...infer S] ? S extends any[] ? Curried<S, R>
    : never : never;

type SameLength<T extends any[]> = Extract<{ [K in keyof T]: any }, any[]>


Function.withRetry = (fn, maxTries = 4) => {
	const p = Promise.promisify(fn)
	return async (...props) => {
		let lastError: any = new Error()
		for (let tryCount = 0; tryCount < maxTries; tryCount++) {
			try { return await p(...props)}
			catch(err) { lastError = err }
		}
		throw lastError
	}
}
