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
	}
}
 
String.prototype.toHash = function() {
	return Array.from(this).reduce(
		(hash, char) => 0 | (31 * hash + char.charCodeAt(0)),
		0,
	)
}
