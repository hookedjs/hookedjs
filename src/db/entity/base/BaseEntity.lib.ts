import { assertValid, isDefined } from '#lib/validation'

export interface BaseEntityType {
	id: string
	createdAt: Date
	updatedAt: Date
	deletedAt: Date | null
	version: number
}

export function BaseEntityValidations(record: any): Record<keyof BaseEntityType, any> {
	return {
		id: assertValid('id', record.id, ['isRequired', 'isString', 'isNoneEmpty']),
		createdAt: isDefined(record.createdAt) && assertValid('createdAt', record.createdAt, ['isDate']),
		updatedAt: isDefined(record.updatedAt) && assertValid('updatedAt', record.updatedAt, ['isDate']),
		deletedAt: isDefined(record.deletedAt) && assertValid('deletedAt', record.deletedAt, ['isDate']),
		version: isDefined(record.version) && assertValid('version', record.version, ['isNumber']),
	}
}