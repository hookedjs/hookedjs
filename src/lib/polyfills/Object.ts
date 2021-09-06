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
	function rmFalseyAttrs<T extends Record<string, any>>(obj: T, inPlace?: boolean): Partial<T>
	function rmNullAttrs<T extends Record<string, any>>(obj: T, inPlace?: boolean): Partial<T>
	function rmUndefAttrs<T extends Record<string, any>>(obj: T, inPlace?: boolean): Partial<T>
	function equals(foo: any, bar: any): boolean
	// Note: Clone is imperfect!
	function clone<T extends any>(obj: T): T

	interface ObjectConstructor {
		pick: typeof pick
		omit: typeof omit
		rmFalseyAttrs: typeof rmFalseyAttrs
		rmNullAttrs: typeof rmNullAttrs
		rmUndefAttrs: typeof rmUndefAttrs
		equals: typeof equals
		// Note: Clone is imperfect!
		clone: typeof clone
	}

	// Sadly, Object is not generic, so we cannot extend it and acces this in a typesafe way :-(.
	// interface Object<T> {}
	interface Object {
		/**
		 * Alias for keys(obj)
		 */
		oKeys(): string[]
		/**
		 * Alias for, but not typesafe values(obj)
		 */
		oValues(): any[]
		/**
		 * Alias for, but not typesafe entries(obj)
		 */
		oEntries(): [string, any][]
		/**
		 * Alias for Object.hasOwnProperty(prop)
		 */
		oIncludes(prop: string): boolean
		/**
		 * Alias for !Object.hasOwnProperty(prop)
		 */
		oExcludes(prop: string): boolean
		/**
		 * Alias for, but not typesafe `new Map(entries(obj))`
		 */
		toMap(): Map<string, any>
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

globalThis.rmFalseyAttrs = Object.rmFalseyAttrs = function (obj, inPlace) {
	const obj2 = inPlace ? obj : clone(obj)
	for (const key in obj2) {
		if (!obj2[key]) delete obj2[key]
	}
	return obj2
}

globalThis.rmNullAttrs = Object.rmNullAttrs = function (obj, inPlace) {
	const obj2 = inPlace ? obj : clone(obj)
	for (const key in obj2) {
		if (obj2[key] === null) delete obj2[key]
	}
	return obj2
}

globalThis.rmUndefAttrs = Object.rmUndefAttrs = function (obj, inPlace) {
	const obj2 = inPlace ? obj : clone(obj)
	for (const key in obj2) {
		if (obj2[key] === undefined) delete obj2[key]
	}
	return obj2
}

/**
 * Copied from npm/depqual
 */
const has = Object.prototype.hasOwnProperty
globalThis.equals = Object.equals = function (foo, bar) {
	let ctor, len, tmp
	if (foo === bar) return true

	if (foo && bar && (ctor=foo.constructor) === bar.constructor) {
		if (ctor === Date) return foo.getTime() === bar.getTime()
		if (ctor === RegExp) return foo.toString() === bar.toString()

		if (ctor === Array) {
			if ((len=foo.length) === bar.length) {
				while (len-- && Object.equals(foo[len], bar[len]));
			}
			return len === -1
		}

		if (ctor === Set) {
			if (foo.size !== bar.size) {
				return false
			}
			for (len of foo) {
				tmp = len
				if (tmp && typeof tmp === 'object') {
					tmp = find(bar, tmp)
					if (!tmp) return false
				}
				if (!bar.has(tmp)) return false
			}
			return true
		}

		if (ctor === Map) {
			if (foo.size !== bar.size) {
				return false
			}
			for (len of foo) {
				tmp = len[0]
				if (tmp && typeof tmp === 'object') {
					tmp = find(bar, tmp)
					if (!tmp) return false
				}
				if (!Object.equals(len[1], bar.get(tmp))) {
					return false
				}
			}
			return true
		}

		if (ctor === ArrayBuffer) {
			foo = new Uint8Array(foo)
			bar = new Uint8Array(bar)
		} else if (ctor === DataView) {
			if ((len=foo.byteLength) === bar.byteLength) {
				while (len-- && foo.getInt8(len) === bar.getInt8(len));
			}
			return len === -1
		}

		if (ArrayBuffer.isView(foo)) {
			if ((len=foo.byteLength) === bar.byteLength) {
				while (len-- && (foo as any)[len] === bar[len]);
			}
			return len === -1
		}

		if (!ctor || typeof foo === 'object') {
			len = 0
			for (ctor in foo) {
				if (has.call(foo, ctor) && ++len && !has.call(bar, ctor)) return false
				if (!(ctor in bar) || !Object.equals(foo[ctor], bar[ctor])) return false
			}
			return keys(bar).length === len
		}
	}

	return foo !== foo && bar !== bar

	function find(iter: any, tar: any, key?: any) {
		for (key of iter.keys()) {
			if (Object.equals(key, tar)) return key
		}
	}
}

// Is imperfect on Classes or objects containing classes
// Adapted from https://stackoverflow.com/a/46692810/1202757
globalThis.clone = Object.clone = (obj: any) => {
	if (obj === null || typeof(obj) !== 'object' || 'isActiveClone' in obj)
		return obj
	if (obj.constructor.name === 'Date')
		return new Date(obj)
	// This is the imperfect part: we can't perfectly clone classes with constructors that have arguments,
	// because we can't access the arguments object in use strict mode.
	let temp: any = {}
	try { temp = obj.constructor() } catch (e) {}
	for (const key in obj) {
		if (Object.prototype.hasOwnProperty.call(obj, key)) {
			obj['isActiveClone'] = null
			temp[key] = clone(obj[key])
			delete obj['isActiveClone']
		}
	}
	return temp
}

Object.defineProperties(Object.prototype, {
	oKeys: {
		value: function() {
			return Object.keys(this)
		},
		enumerable: false
	},
	oIncludes: {
		value: function(prop: string) {
			return this.hasOwnProperty(prop)
		},
		enumerable: false
	},
	oExcludes: {
		value: function(prop: string) {
			return !this.hasOwnProperty(prop)
		},
		enumerable: false
	},
	toMap: {
		value: function() {
			return new Map(entries(this))
		},
		enumerable: false
	}
})