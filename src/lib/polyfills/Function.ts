/**
 * Extensions for Function
 */

import memoize from './Function.memoize'

export {}

declare global {
	interface FunctionConstructor {
		/**
		 * Memoize a function - adapted from https://github.com/caiogondim/fast-memoize.js
		 * @param {*} fn - The function to be memoized
		 * @param {*} options - options to be passed in (see https://github.com/caiogondim/fast-memoize.js)
		 * @returns - the fn wrapped in memoize logic
		 */
		memoize: typeof memoize

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
	}
}

Function.memoize = memoize

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
