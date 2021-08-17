import type { FastifyRequest } from 'fastify'

export function throwError(message: string): never {throw new Error(message)}

export class NotFoundError extends Error {
	type = 'NotFound'
	note: string
	context = {
		entity: null,
		errorSet: {}
	}
	constructor(id?: string) {
		super(`The article${id ? `(id:${id})`: ''} you seek doth not exist`)
		this.note = this.message
	}
}
export function throwNotFoundError(id?: string): never {throw new NotFoundError(id)}

export class ForbiddenError extends Error {
	type = 'ForbiddenError'
	note: string
	context = {
		entity: null,
		errorSet: {}
	}
	constructor() {
		super('You lack permission to this record')
		this.note = this.message
	}
}
export function throwForbiddenError(): never {throw new ForbiddenError()}

type ValidationErrorType<T> = Record<keyof T, any>

export class ValidationError extends Error {
	type = 'ValidationError'
	attrName: string
	note: string
	constructor(attrName: string, note: string) {
		super(note)
		this.attrName = attrName
		this.note = note
	}
}

export class RequiredError extends ValidationError {
	type = 'RequiredError'
	constructor(attrName: string) {
		super(attrName, `${attrName} is required`)
	}
}
export class TypeError extends ValidationError {
	type = 'TypeError'
	constructor(attrName: string, expectedType: string) {
		super(attrName, `${attrName} is not type ${expectedType}`)
	}
}
export class ValueError extends ValidationError {
	type = 'ValueError'
	constructor(attrName: string, note?: string) {
		super(attrName, note ?? `${attrName} value is invalid`)
	}
}

export class ValidationErrorSet<T> extends Error {
	type = 'ValidationErrorSet'
	note = 'One or more arguments are invalid'
	context: {
		entity: any,
		errorSet: Partial<ValidationErrorType<T>>,
	}
	constructor(entity: any, errorSet: Partial<ValidationErrorType<T>>) {
		super('ValidationErrorSet: One or more arguments are invalid')
		this.context = {
			entity: Object.assign({}, entity),
			errorSet: errorSet
		}
		if (this.context.entity.password) this.context.entity.password = '********'
		if (this.context.entity.passwordCurrent) this.context.entity.passwordCurrent = '********'
		if (this.context.entity.passwordNext) this.context.entity.passwordNext = '********'
		if (this.context.entity.passwordNextConfirm) this.context.entity.passwordNextConfirm = '********'
		if (this.context.entity.passwordHash) this.context.entity.passwordHash = '********'
	}
}
export function throwValidationErrorSet<T>(entity: any, errorSet: Partial<ValidationErrorType<T>>): never {
	throw new ValidationErrorSet(entity, errorSet)
}

export function assertIdentified (req: FastifyRequest) {if(!(req as any).user?.id) throw new ForbiddenError()}

export class FormValidationErrorSet extends ValidationErrorSet<any> {
	constructor(entity: any, message: string) {
		super(entity, {form: new ValueError('form', message)})
	}
}
export class AssertValidClass {
	attrName: string
	attrValue: any
	constructor(attrName: string, attrValue: any) { Object.assign(this, { attrName, attrValue }) }
	isDefined = () => 
		this.attrValue === undefined 
		&& new ValueError(this.attrName, `${this.attrName} is missing`)
	isTruthy = () => 
		!this.attrValue 
		&& new ValueError(this.attrName, `${this.attrName} must be true`)
	isFalsey = () => 
		this.attrValue 
		&& new ValueError(this.attrName, `${this.attrName} must be false`)
	isRequired = () => 
		this.attrValue === undefined || this.attrValue === null 
		&& new ValueError(this.attrName, `${this.attrName} is required`)
	isString = () => 
		typeof this.attrValue !== 'string' 
		&& new TypeError(this.attrName, 'string')
	isNumber = () => 
		typeof this.attrValue !== 'number' 
		&& new TypeError(this.attrName, 'number')
	isBoolean = () => 
		typeof this.attrValue !== 'boolean' 
		&& new TypeError(this.attrName, 'true/false')
	isDate = () => 
		this.attrValue?.constructor?.name !== 'Date'
		// !this.attrValue?.getTime()
		&& new TypeError(this.attrName, 'date')
	isDatable = () => // can attrValue be converted to a date
		!(new Date(this.attrValue))?.getTime()
		&& new TypeError(this.attrName, 'date')
	isArray = () => 
		!Array.isArray(this.attrValue) 
		&& new TypeError(this.attrName, 'array')
	isNoneEmpty = () => 
		!this.attrValue.length 
		&& new ValueError(this.attrName, `${this.attrName} is empty`)
	isHash = () => 
		this.attrValue.length < 30 
		&& new ValueError(this.attrName, `${this.attrName} must be a hash`)
	isEmail = () => 
		!isEmailRegex.test(this.attrValue) 
		&& new ValueError(this.attrName, `${this.attrName} is invalid`)
	isPassword = () => 
		!isPasswordStrongRegex.test(this.attrValue) 
		&& new ValueError(this.attrName, 'password must have one uppercase, one lowercase, one number, and be 8 characters long')
	isUrl = () =>
		!this.attrValue.startsWith('http')
		&& new ValueError(this.attrName, 'url is invalid')
	isUrlRel = () =>
		this.attrValue[0] !== ('/')
		&& new ValueError(this.attrName, 'relative url is invalid')
	isStringOrBuffer = () => 
		typeof this.attrValue !== 'string'
		&& !Buffer.isBuffer(this.attrValue)
		&& new TypeError(this.attrName, 'stringOrBuffer')
	

	// Ranges
	isMoreThan = (threshold: number) => 
		this.attrValue <= threshold 
		&& new ValueError(this.attrName, `${this.attrName} must be greater than ${threshold}`)
	isLessThan = (threshold: number) => 
		this.attrValue >= threshold 
		&& new ValueError(this.attrName, `${this.attrName} must be less than ${threshold}`)
	isWithinRange = ({low, high}: {low: number, high: number}) => 
		(this.attrValue < low || this.attrValue > high) 
		&& new ValueError(this.attrName, `${this.attrName} must be within range ${low}:${high}`)
	isLongerThan = (threshold: number) => 
		this.attrValue.length < threshold 
		&& new ValueError(this.attrName, `${this.attrName} must be longer than ${threshold}`)
	isShorterThan = (threshold: number) => 
		this.attrValue.length > threshold 
		&& new ValueError(this.attrName, `${this.attrName} must be shorter than ${threshold}`)
	isLengthWithinRange = ({low, high}: {low: number, high: number}) => 
		(this.attrValue.length < low || this.attrValue.length > high) 
		&& new ValueError(this.attrName, `${this.attrName} must be longer than ${low} and shorter than ${high}`)

	// Pattern matching
	isInstanceOf = (expected: any) => 
		!(this.attrValue instanceof expected)
		&& new ValueError(this.attrName, `${this.attrName} is invalid`)
	isEqual = ({expected, message}: {expected: any, message?: string}) => 
		this.attrValue !== expected
		&& new ValueError(this.attrName, message || `${this.attrName} is invalid`)
	isDifferent = ({expected, message}: {expected: any, message?: string}) => 
		this.attrValue === expected
		&& new ValueError(this.attrName, message || `${this.attrName} is invalid`)
	matches = ({regex, message}: {regex: RegExp, message?: string}) => 
		!regex.test(this.attrValue) 
		&& new ValueError(this.attrName, message || `${this.attrName} is invalid`)
	doesntMatch = ({regex, message}: {regex: RegExp, message?: string}) => 
		regex.test(this.attrValue) 
		&& new ValueError(this.attrName, message || `${this.attrName} is invalid`)

	// Sets
	isOneOf = (values: any[]) => 
		!values.includes(this.attrValue) 
		&& new ValueError(this.attrName, `${this.attrName} is invalid`)
	isOneOfSet = (valueSet: Set<any>) => 
		!valueSet.has(this.attrValue) 
		&& new ValueError(this.attrName, `${this.attrName} is invalid`)
	arrayValuesAreOneOfSet = (valueSet: Set<any>) => 
		this.attrValue.some((e: any) => !(e.length === 0 || valueSet.has(e)))
		&& new ValueError(this.attrName, `${this.attrName} is invalid`)
}

export function assertValid(
	attrName: string,
	attrValue: any,
	basics: (keyof AssertValidClass)[],
	complex?: {
		isInstanceOf?: any,
		isEqual?: {expected: any, message?: string},
		isDifferent?: {expected: any, message?: string},
		matches?: {regex: RegExp, message?: string},
		doesntMatch?: {regex: RegExp, message?: string},

		isMoreThan?: number,
		isLessThan?: number,
		isWithinRange?: {low: number, high: number}
		isLongerThan?: number,
		isShorterThan?: number,
		isLengthWithinRange?: {low: number, high: number},

		isOneOf?: any[],
		isOneOfSet?: Set<any>,
		arrayValuesAreOneOfSet?: Set<any>,
	},
	customs: (ValueError | false)[] = [],
): ValidationError | false {
	const assertValid = new AssertValidClass(attrName, attrValue)
	for (const a of basics) {
		const assertion = assertValid[a](attrName, attrValue)
		if (assertion) return assertion
	}
	if (complex) {
		for (const [key,arg] of Object.entries(complex)) {
			// @ts-ignore: ts doesnt know this is safe
			const res = assertValid[key](arg)
			if (res) return res
		}
	}
	if (customs) {
		for (const custom of customs) {
			if (custom) return custom
		}
	}
	return false
}

export function validateSet<T>(obj: T, attrAssertions: ValidationErrorType<T>) {
	const attrAssertionsClean = Object.rmFalseyAttrs(attrAssertions)
	if (Object.keys(attrAssertionsClean).length) return new ValidationErrorSet(obj, attrAssertionsClean)
}

export function assertValidSet<T>(obj: T, attrAssertions: ValidationErrorType<T>) {
	const validationErrorSetOrNull = validateSet<T>(obj, attrAssertions)
	if(validationErrorSetOrNull) throw validationErrorSetOrNull
}

export function assertAttrsWithin(given: Record<string, any>, expected: Record<string, any>,) {
	const randos = Array.difference(Object.keys(given), Object.keys(expected))

	if (randos.length) throw new ValidationErrorSet(
		given,
		Object.fromEntries(randos.map(k => [k, new ValueError(k, `${k} field is unexpected`)]))
	)
}

export const isDefined = (arg: any) => arg !== undefined
export const isNullOrUndefined = (arg: any) => arg === undefined || arg === null
export const isDefinedAndNotNull = (arg: any) => !isNullOrUndefined(arg)

export const isPasswordStrongRegex = new RegExp(
	`^${[
		'(?=.*[A-Z])', // one uppercase
		'(?=.*[a-z])', // one lowercase
		'(?=.*[0-9])', // one number
		'.{8}' // min length
	].join('')}`
)
// eslint-disable-next-line
export const isEmailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
