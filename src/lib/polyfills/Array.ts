/**
 * Polyfills for Array
 * 
 * Note: Extending primitive's can be problematic without care. For more info, see
 * https://stackoverflow.com/questions/8859828/javascript-what-dangers-are-in-extending-array-prototype
 * 
 * Tips:
 * 1. for...in will break if you naively extend via Array.propotype.foo = ...
 *    Instead, use Object.defineProperty({value: fnc, enumerable: false})
 * 2. Drop support for older Internet Explorer
 */

// You must export something or TS gets confused.
export {}

declare global {
	interface ArrayConstructor {
		/**
		 * Will return an array containing what's in the first array but NOT in the other arrays.
		 * adapted from https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore#_difference
		 */
		difference: ArrayDifferenceType
		/**
		 * Return an intersection array of two or multiple arrays
		 *
		 * Example: arrayIntersection([1,2], [1]) => [1]
		 */
		intersection: ArrayDifferenceType
	}
	interface Array<T> {
		/**
		 * Returns a copy of the array
		 */
		copy(): T[]
		/**
		 * Removes all elements matching value
		 */
		remove(value: T): T[]
		/**
		 * Checks if the array contains the any value multiple times
		 */
		duplicateCheck(): boolean
		/**
		 * Remove values that are repeated
		 */
		deDup(): T[]
		/**
		 * Returns a Record keyed by a property of the elements in the array
		 */
		keyBy(key: string | number | symbol): Record<string, T[]>
		/**
		 * Aka !arr.includes(val)
		 */
		excludes(val: any): boolean
		/**
		 * 
		 */
		toSet(): Set<T[]>

		/**
		 * Functional version of pop
		 */
		popF(): T
		/**
		 * Pop the last N elements from the array
		 */
		popN(n: number): T[]
		/**
		 * Functional version of popN
		 */
		popNF(n: number): T[]
		/**
		 * Functional version of push
		 */
		pushF(...values: T[]): number
		/**
		 * Functional version of shift
		 */
		shiftF(): T
		/**
		 * Shift the first N elements from the array
		 */
		shiftN(n: number): T[]
		/**
		 * Functional version of shiftN
		 */
		shiftNF(n: number): T[]

		/**
		 * Subtracts the values of an array(s) from the current array
		 */
		subtract(...otherArrs: T[][]): T[]
		/**
		* Alias of subtract
		*/
		minus(...otherArrs: T[][]): T[]
		/**
		* Functional version of subtract that returns a new array
		*/
		subtractF(...otherArrs: T[][]): T[]
		/**
		* Alias of subtractF
		*/
		minusF(...otherArrs: T[][]): T[]
	}
}

// Returns the same type as args
type ArrayDifferenceType = <T extends any>(...arrays: T[][]) => T[];

Array.difference = function(...arrays) {
	return arrays.reduce((a, b) => a.filter((c) => b.excludes(c)))
}

Array.intersection = function (...arrays) {
	return arrays.reduce((a, b) => b.filter(Set.prototype.has.bind(new Set(a))))
}

defineProperties(Array.prototype, {
	copy: {
		value: function() {
			return [...this]
		},
		enumerable: false
	},

	remove: {
		value: function (el: any) {
			let i: number
			while((i = this.indexOf(el)) > -1) {
				this.splice(i, 1)
			}
		},
		enumerable: false
	},

	duplicateCheck: {
		value: function() {
			return new Set(this).size !== this.length
		},
		enumerable: false
	},

	deDup: {
		value: function() {
			return Array.from(new Set(this))
		},
		enumerable: false
	},

	keyBy: {
		value: function(key: string | number | symbol) {
		// Manually reduce insted of using Array.reduce for performance
			const reduced: Record<string, any[]> = {}
			for (const entry of this) {
				if (!reduced[entry[key]]) reduced[entry[key]] = [entry]
				else reduced[entry[key]].push(entry)
			}
			return reduced
		},
		enumerable: false
	},

	excludes: {
		value: function(val: any) {
			return !this.includes(val)
		},
		enumerable: false
	},

	toSet: {
		value: function() {
			return new Set(this)
		},
		enumerable: false
	},

	// popF(): T
	popF: {
		value: function() {
			return this.slice(0, -1)
		},
		enumerable: false
	},

	popN: {
		value: function(n: number) {
			const poped = []
			let i  = n
			while (i-- && this.length) poped.push(this.pop())
			return poped
		},
		enumerable: false
	},

	popNF: {
		value: function(n: number) {
			return this.slice(0, -n)
		},
		enumerable: false
	},

	pushF: {
		value: function(...vals: any[]) {
			return this.concat(vals)
		},
		enumerable: false
	},

	shiftF: {
		value: function() {
			return this.slice(1)
		},
		enumerable: false
	},

	shiftN: {
		value: function(n: number) {
			return this.splice(n)
		},
		enumerable: false
	},

	// shiftNF(n: number): T[]
	shiftNF: {
		value: function(n: number) {
			return this.slice(n)
		},
		enumerable: false
	},



	subtract: {
		value: function(...arrs: any[][]) {
			let i
			for (const arr of arrs) {
				for (const el of arr) {
					while ((i = this.indexOf(el)) > -1) {
						this.splice(i, 1)
					}
				}
			}
		},
		enumerable: false
	},

	minus: {
		value: Array.prototype.subtract,
		enumerable: false
	},

	subtractF: {
		value: function(...arrs: any[][]) {
			return Array.difference(this, ...arrs)
		},
		enumerable: false
	},

	minusF: {
		value: Array.prototype.subtractF,
		enumerable: false
	},

})
