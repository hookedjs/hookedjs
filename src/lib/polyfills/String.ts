/**
 * Extensions for String
 */

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
 
String.prototype.toHash = function() {
	return Array.from(this).reduce(
		(hash, char) => 0 | (31 * hash + char.charCodeAt(0)),
		0,
	)
}

String.prototype.toTitleCase = function () {
	return this.toLocaleLowerCase().replace(/(^|\s)(\w)/g, x => x.toLocaleUpperCase())
}

String.prototype.isIn = function (arrOrObj) {
	return Array.isArray(arrOrObj) ? arrOrObj.includes(this) : (this as string) in arrOrObj
}

String.prototype.isNotIn = function (arrOrObj) {
	return !this.isIn(arrOrObj)
}