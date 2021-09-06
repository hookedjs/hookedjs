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
	function copy<T extends any>(obj: T): T

	interface ObjectConstructor {
		pick: typeof pick
		omit: typeof omit
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

globalThis.rmFalseyAttrs = Object.rmFalseyAttrs = function (obj, inPlace) {
	const obj2 = inPlace ? obj : copy(obj)
	for (const key in obj2) {
		if (!obj2[key]) delete obj2[key]
	}
	return obj2
}

globalThis.rmNullAttrs = Object.rmNullAttrs = function (obj, inPlace) {
	const obj2 = inPlace ? obj : copy(obj)
	for (const key in obj2) {
		if (obj2[key] === null) delete obj2[key]
	}
	return obj2
}

globalThis.rmUndefAttrs = Object.rmUndefAttrs = function (obj, inPlace) {
	const obj2 = inPlace ? obj : copy(obj)
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
// Inspired by https://stackoverflow.com/a/46692810/1202757
globalThis.copy = Object.copy = (obj: any) => {
	if (obj === null || typeof(obj) !== 'object' || 'isActiveClone' in obj)
		return obj

	switch (obj.constructor) {
	case Array:
		return obj.map(copy)
	case Number:
		return new Number(obj.toString())
	case Set:
		return new Set([...obj].map(copy))
	case Map:
		return new Map([...obj.entries()].map(copy))
	case Object: // means we have no idea what it is :-/
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
	default: // means some primitive that's okay to just pass the val into constructor
		return new obj.constructor(obj)
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
