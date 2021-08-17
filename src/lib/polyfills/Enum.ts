export {}

declare global {
	// eslint-disable-next-line no-var
	var Enum: {
		/**
		 * Gets enum values from enum
		 * 
		 * Object.values(enum) returns Keys and Values for some reason, so this corrects that.
		 * 
		 * @param enum0 Incoming enum
		 */
		getEnumValues: (enumFrom: Record<string, any>) => any[];
		/**
		 * Creates an enum-like object from a class instance
		 */
		getEnumFromClassInstance: <T>(classInstance: T) => Record<keyof T, keyof T>
	}
}


globalThis.Enum = {
	getEnumValues,
	getEnumFromClassInstance,
}

function getEnumValues(enumFrom: Record<string, any>): any[] {
	const vals = Object.entries(enumFrom)
		// If enum values are number type, entries() will emit it also
		// as a key, which we don't want so filter them out.
		.filter(([key]) => isNaN(Number(key)))
		.map(([_,val]) => val)
	return vals
}

function getEnumFromClassInstance<T>(classInstance: T): Record<keyof T, keyof T> {
	return Object.fromEntries(Object.keys(classInstance).map(k => [k,k])) as Record<keyof T, keyof T>
}
