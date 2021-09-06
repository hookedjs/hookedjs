/**
 * Extensions for String
 * 
 * Note: Extending primitive's can be problematic without care. For more info, see
 * https://stackoverflow.com/questions/8859828/javascript-what-dangers-are-in-extending-array-prototype
 * 
 * Tips:
 * 1. for...in will break if you naively extend via String.propotype.foo = ...
 *    Instead, use Object.defineProperty({value: fnc, enumerable: false})
 * 2. Drop support for older Internet Explorer
 */

// You must export something or TS gets confused.
export {}

declare global {
	interface String {
		/**
		 * Converts a string into a semi-unique, numeric hash
		 *
		 * Compared to other hash algs (MD5), is much simpler, faster while less perfect
		 * Src: https://stackoverflow.com/a/8831937/1202757
		 */
		toHash(): number
		/**
		 * Converts a string into title-case: "hello world" -> "Hello World"
		 */
		toTitleCase(): string

		/**
		 * Checks if a string is in an array or object
		 */
		isIn(arrOrObj: any): boolean
		/**
		 * Checks if a string is not in an array or object
		 */
		isNotIn(arrOrObj: any): boolean
	}
}

Object.defineProperties(String.prototype, {
	toHash: {
		value: function() {
			return Array.from(this).reduce(
				(hash: number, char: any) => 0 | (31 * hash + char.charCodeAt(0)),
				0,
			)
		},
		enumerable: false
	},

	toTitleCase: {
		value: function () {
			return this.toLocaleLowerCase().replace(/(^|\s)(\w)/g, (x: string) => x.toLocaleUpperCase())
		},
		enumerable: false
	},

	isIn: {
		value: function (arrOrObj: any) {
			return Array.isArray(arrOrObj) ? arrOrObj.includes(this) : (this as string) in arrOrObj
		},
		enumerable: false
	},

	isNotIn: {
		value: function (arrOrObj: any) {
			return !this.isIn(arrOrObj)
		},
		enumerable: false
	},
})