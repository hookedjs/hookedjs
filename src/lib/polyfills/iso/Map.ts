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
		copy(): Map<K, V>;
		toObj(): Record<string, V>;
		/**
		 * Like set but the value is a callback that accepts the prior
		 * value and returns the next value, kinda like react's useState
		 * updater
		**/
		update(key: K, valueCb: (previous: V) => V): Map<K, V>;
	}
}

Object.defineProperties(Map.prototype, {
	copy: {
		value: function() {
			return Object.copy(this)
		},
		enumerable: false
	},
	toObj: {
		value: function () {
			return Object.fromEntries(this)
		},
		enumerable: false
	},
	update: {
		value: function(key: any, valueCb: (previous: any) => any) {
			return this.set(key, valueCb(this.get(key)))
		},
		enumerable: false
	},
})