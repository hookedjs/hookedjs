/**
 * Polyfills for object
 */

export {}

declare global {
	interface ObjectConstructor {
		pick<T extends Record<string, any>, K extends (keyof T)> (obj: T, keys: readonly K[] | K[]): Pick<T, K>
		omit<T extends Record<string, any>, K extends (keyof T)>(obj: T, keys: readonly K[] | K[]): Omit<T, K>
		rmFalseyAttrs<T extends Record<string, any>>(obj: T, inPlace?: boolean): Partial<T>
		rmUndefAttrs<T extends Record<string, any>>(obj: T, inPlace?: boolean): Partial<T>
		equals(foo: any, bar: any): boolean
		clone<T extends any>(obj: T): T
	}
}

Object.pick = function (obj, keys) {
	const res: any = {}
	keys?.forEach(k => {
		if (k in obj) res[k] = obj[k]
	})
	return res
}

Object.omit = function (obj, keys) {
	const res = Object.assign({}, obj)
	keys?.forEach(k => {
		if (k in obj) delete res[k]
	})
	return res
}

Object.rmFalseyAttrs = function (obj, inPlace) {
	const obj2 = inPlace ? obj : Object.clone(obj)
	for (const key of Object.keys(obj2)) {
		if (!obj2[key]) delete obj2[key]
	}
	return obj2
}

Object.rmUndefAttrs = function (obj, inPlace) {
	const obj2 = inPlace ? obj : Object.clone(obj)
	for (const key of Object.keys(obj2)) {
		if (obj2[key] === undefined) delete obj2[key]
	}
	return obj2
}

/**
 * Copied from npm/depqual
 */
const has = Object.prototype.hasOwnProperty
Object.equals = function (foo, bar) {
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
			return Object.keys(bar).length === len
		}
	}

	return foo !== foo && bar !== bar

	function find(iter: any, tar: any, key?: any) {
		for (key of iter.keys()) {
			if (Object.equals(key, tar)) return key
		}
	}
}

// Adapted from https://stackoverflow.com/a/46692810/1202757
Object.clone = (obj: any) => {
	if (obj === null || typeof(obj) !== 'object' || 'isActiveClone' in obj)
		return obj
	if (obj.constructor.name === 'Date')
		return new Date(obj)
	const temp = obj.constructor() // changed
	for (const key in obj) {
		if (Object.prototype.hasOwnProperty.call(obj, key)) {
			obj['isActiveClone'] = null
			temp[key] = Object.clone(obj[key])
			delete obj['isActiveClone']
		}
	}
	return temp
}
