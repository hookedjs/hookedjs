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
	}
}

Function.memoize = memoize

Function.getName = () => {
	const stackLine = (new Error())!.stack!.split('\n')[2].trim()
	const fncName = stackLine.match(/at Object.([^ ]+)/)![1]
	return fncName
}

