export const isDate = (d: any) => d instanceof Date
export const isEmpty = (o: any) => Object.keys(o).length === 0
export const isObject = (o: any) => o != null && typeof o === 'object'
export const properObject = (o: any) => isObject(o) && !o.hasOwnProperty ? { ...o } : o

export type DiffFnc = <L extends any, R extends any>(lhs: L, rhs: R) => 
	Partial<{[K in keyof (L & R)]: (L & R)[K] | undefined}>