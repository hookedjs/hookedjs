/* eslint-disable no-var */

/**
 * Polyfills for object
 */

// You must export something or TS gets confused.
export {}

declare global {
	var keys: typeof Object.keys
	var values: typeof Object.values
	var entries: typeof Object.entries
	var assign: typeof Object.assign
	var defineProperties: typeof Object.defineProperties
	var defineProperty: typeof Object.defineProperty
	var create: typeof Object.create
	var freeze: typeof Object.freeze
	

	
	function pick<T extends Record<string, any>, K extends (keyof T)> (obj: T, keys: readonly K[] | K[]): Pick<T, K>
	function omit<T extends Record<string, any>, K extends (keyof T)>(obj: T, keys: readonly K[] | K[]): Omit<T, K>
	function filterAttrs<T extends Record<string, any>>(obj: T, filter: (attrName: string, attrVal: any) => any, inPlace?: boolean): T
	function rmFalseyAttrs<T extends Record<string, any>>(obj: T, inPlace?: boolean): Partial<T>
	function rmNullAttrs<T extends Record<string, any>>(obj: T, inPlace?: boolean): Partial<T>
	function rmUndefAttrs<T extends Record<string, any>>(obj: T, inPlace?: boolean): Partial<T>
	function equals(foo: any, bar: any): boolean
	// Note: Clone is imperfect!
	function copy<T extends any>(obj: T): T

	interface ObjectConstructor {
		pick: typeof pick
		omit: typeof omit
		filterAttrs: typeof filterAttrs
		rmFalseyAttrs: typeof rmFalseyAttrs
		rmNullAttrs: typeof rmNullAttrs
		rmUndefAttrs: typeof rmUndefAttrs
		equals: typeof equals
		// Note: Clone is imperfect!
		copy: typeof copy
	}

	// Sadly, Object is not generic, so we cannot extend it and acces this in a typesafe way :-(.
	// interface Object<T> {}
	interface Object {
		/**
		 * Alias for keys(obj) but MORE TYPESAFE!
		 */
		_keys<T extends any>(): (keyof T)[]
		/**
		 * Alias for, but not typesafe values(obj)
		 */
		_values(): any[]
		/**
		 * Alias for, but not typesafe entries(obj)
		 */
		_entries<T extends any>(): [keyof T, any][]
		/**
		 * Alias for Object.equals
		 */
		_equals(otherObj: any): boolean
		/**
		 * Alias for Object.hasOwnProperty(prop)
		 */
		_includes(prop: string): boolean
		/**
		 * Alias for !Object.hasOwnProperty(prop)
		 */
		_excludes(prop: string): boolean
		/**
		 * Alias for, but not typesafe `new Map(entries(obj))`
		 */
		_toMap(): Map<string, any>
		/**
		 * Alias for obj._keys().map(key => ...)
		 */
		_keyMap<T extends any>(fn: (key: keyof T) => T): T[]
		/**
		 * Alias for obj._keys().reduce((acc, key) => ..., init)
		 */
		_keyReduce<T extends any, A extends any>(fn: (acc: A, key: keyof T) => A, init: A): A
	}
}

globalThis.keys = Object.keys
globalThis.values = Object.values
globalThis.entries = Object.entries
globalThis.assign = Object.assign
globalThis.defineProperties = Object.defineProperties
globalThis.defineProperty = Object.defineProperty
globalThis.create = Object.create
globalThis.freeze = Object.freeze


globalThis.pick = Object.pick = function (obj, keys) {
	const res: any = {}
	keys?.forEach(k => {
		if (k in obj) res[k] = obj[k]
	})
	return res
}

globalThis.omit = Object.omit = function (obj, keys) {
	const res = assign({}, obj)
	keys?.forEach(k => {
		if (k in obj) delete res[k]
	})
	return res
}

globalThis.filterAttrs = Object.filterAttrs = function (obj, filter, inPlace) {
	const obj2 = inPlace ? obj : copy(obj)
	for (const key in obj2) {
		if (!filter(key, obj2[key])) delete obj2[key]
	}
	return obj2
}

globalThis.rmFalseyAttrs = Object.rmFalseyAttrs = function (obj, inPlace) {
	return filterAttrs(obj, (_, val) => val, inPlace)
}

globalThis.rmNullAttrs = Object.rmNullAttrs = function (obj, inPlace) {
	return filterAttrs(obj, (_, val) => val !== null, inPlace)
}

globalThis.rmUndefAttrs = Object.rmUndefAttrs = function (obj, inPlace) {
	return filterAttrs(obj, (_, val) => val !== undefined, inPlace)
}

/**
 * Copied from npm/fast-deep-equal and made easier to step through
 */
globalThis.equals = Object.equals = function (a, b) {
	if (a === b)
		return true

	if (a && b && typeof a == 'object' && typeof b == 'object') {
		if (a.constructor !== b.constructor)
			return false

		var length, i, keys
		if (Array.isArray(a)) {
			length = a.length
			if (length != b.length)
				return false
			for (i = length; i-- !== 0;)
				if (!equals(a[i], b[i]))
					return false
			return true
		}



		if (a.constructor === RegExp) {
			if(a.source === b.source && a.flags === b.flags)
				return true
			return false
		}
		if (a.valueOf !== Object.prototype.valueOf) {
			if(a.valueOf() === b.valueOf())
				return true
			return false
		}
		if (a.toString !== Object.prototype.toString) {
			if(a.toString() === b.toString())
				return true
			return false
		}

		keys = Object.keys(a)
		length = keys.length
		if (length !== Object.keys(b).length)
			return false

		for (i = length; i-- !== 0;)
			if (!Object.prototype.hasOwnProperty.call(b, keys[i]))
				return false

		for (i = length; i-- !== 0;) {
			var key = keys[i]

			if (key === '_owner' && a.$$typeof) {
				// React-specific: avoid traversing React elements' _owner.
				//  _owner contains circular references
				// and is not needed when comparing the actual elements (and not their owners)
				continue
			}

			if (!equals(a[key], b[key]))
				return false
		}

		return true
	}

	// true if both NaN, false otherwise
	if (a!==a && b!==b)
		return true
	return false
}

// Is imperfect on Classes or objects containing classes
// Inspired by https://stackoverflow.com/a/46692810/1202757
globalThis.copy = Object.copy = (obj: any) => {
	if (obj === null || typeof(obj) !== 'object' || 'isActiveClone' in obj)
		return obj

	switch (obj.constructor) {
	case Array:
		return obj.map(copy)
	case Set:
		return new Set([...obj].map(copy))
	case Map:
		return new Map([...obj.entries()].map(copy))
	default: // means we have no idea what it is :-/
		// This is the imperfect part: we can't perfectly copy classes, but we can come close
		const temp = Object.assign({}, obj)
		for (const key in obj) {
			if (Object.prototype.hasOwnProperty.call(obj, key)) {
				obj['isActiveClone'] = null // prevent cyclical reference
				temp[key] = copy(obj[key])
				delete obj['isActiveClone']
			}
		}
		return temp
	}
}


Object.defineProperties(Object.prototype, {
	_keys: {
		value: function() {
			return Object.keys(this)
		},
		enumerable: false
	},
	_values: {
		value: function() {
			return Object.values(this)
		},
		enumerable: false
	},
	_entries: {
		value: function() {
			return Object.entries(this)
		},
		enumerable: false
	},
	_equals: {
		value: function(that: any) {
			return Object.equals(this, that)
		},
		enumerable: false
	},
	_includes: {
		value: function(prop: string) {
			return this.hasOwnProperty(prop)
		},
		enumerable: false
	},
	_excludes: {
		value: function(prop: string) {
			return !this.hasOwnProperty(prop)
		},
		enumerable: false
	},
	__toMap: {
		value: function() {
			return new Map(entries(this))
		},
		enumerable: false
	},
	_keyMap: {
		value: function(fn: (...props: any) => any) {
			return this._keys().map(fn)
		},
		enumerable: false
	},
	_keyReduce: {
		value: function(fn: (...props: any) => any, init: any) {
			return this._keys().reduce(fn, init)
		},
		enumerable: false
	},
})
