/**
 * A global store inspired by Redux/Mobx with builtin React use Hook
 * 
 * What makes it cool is:
 * 1. How small it is. 1kb vs 10kb+
 * 2. Includes a React hook which acts just like useState does, so zero learning curve
 * 3. A shit-ton less boilerplate
 * 4. Can be accessed outside of a React component (i.e. anywhere)
 * 5. Does not depend on Context API -- faster, more reliable and more flexible
 * 6. Does not depend on Browser events -- UX updates are synchronous(!)
 * 7. Easy option to persist to localStorage
 * 8. Super type-safe
 */
import { StateUpdater, useLayoutEffect, useState as useStateP } from '#lib/hooks'

class StateStore<T> {
	private _value: T
	private persistKey = ''
	private subscribers = new Set<(next: T) => any>()
	
	constructor(defaultInitialVal: T, persistKey?: string) {
		this._value = defaultInitialVal
		if (persistKey) {
			this.persistKey = persistKey
			const fromDisk = localStorage.getItem(persistKey)
			if (fromDisk)
				this._value = JSON.parse(fromDisk)
			else
				localStorage.setItem(persistKey, JSON.stringify(defaultInitialVal))
		}
	}

	get value() {return this._value}
	set value(next: T) { this.setValue(next) }

	setValue = (nextOrFnc: T | ((prev: T) => T)) => {
		const isFunction = {}.toString.call(nextOrFnc) === '[object Function]'
		if (isFunction)
			this._value = (nextOrFnc as any)(this._value)
		else
			this._value = nextOrFnc as T
		
		this.subscribers.forEach(s => s(this._value))
		if (this.persistKey) localStorage.setItem(this.persistKey, JSON.stringify(this._value))
	}
	
	subscribe = (callback: (next: T) => any) => {
		this.subscribers.add(callback)
		return () => this.subscribers.delete(callback)
	}
	
	use = () => {
		const [_state, _setState] = useStateP(this._value)
		useLayoutEffect(() => this.subscribe(next => _setState(next)), [])
		return [_state, this.setValue] as [T, StateUpdater<T>]
	}
}

export default StateStore