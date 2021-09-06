/**
 * Extensions for String
 * 
 * Note: Extending primitive's can be problematic without care. For more info, see
 * https://stackoverflow.com/questions/8859828/javascript-what-dangers-are-in-extending-array-prototype
 * 
 * Tips:
 * 1. for...in will break if you naively extend via Set.propotype.foo = ...
 *    Instead, use Object.defineProperty({value: fnc, enumerable: false})
 * 2. Drop support for older Internet Explorer
 */

// You must export something or TS gets confused.
export {}

declare global {
	interface Map<K, V> {
		toObj(): Record<string, V>;
	}
}

Object.defineProperties(Map.prototype, {
	toObj: {
		value: function () {
			return Object.fromEntries(this)
		},
		enumerable: false
	},
})