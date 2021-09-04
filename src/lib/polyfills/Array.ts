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
		 * Removes all elements matching value
		 */
		remove(value: T): T[]
		duplicateCheck(): boolean
		deDuplicate(): T[]
		keyBy(key: string | number | symbol): Record<string, T[]>
		subtract(otherArr: T[]): T[]
		// Aka !arr.includes(val)
		excludes(val: any): boolean
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

Object.defineProperty(Array.prototype, 'remove', {
	value: function (el: any) {
		let i: number
		while((i = this.indexOf(el)) > -1) {
			this.splice(i, 1)
		}
	},
	enumerable: false
})

Object.defineProperty(Array.prototype, 'duplicateCheck', {
	value: function() {
		return new Set(this).size !== this.length
	},
	enumerable: false
})

Object.defineProperty(Array.prototype, 'deDuplicate', {
	value: function() {
		return Array.from(new Set(this))
	},
	enumerable: false
})

Object.defineProperty(Array.prototype, 'keyBy', {
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
})

Object.defineProperty(Array.prototype, 'subtract', {
	value: function(arr: Array<any>) {
		return Array.difference(this, arr)
	},
	enumerable: false
})

Object.defineProperty(Array.prototype, 'excludes', {
	value: function(val: any) {
		return !this.includes(val)
	},
	enumerable: false
})