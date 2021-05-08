import { assertValid, assertValidSet, FormValidationErrorSet, isDefined, isDefinedAndNotNull } from '#src/lib/validation'

import { BaseEntityType, BaseEntityValidations } from '../base/BaseEntity.lib'
import type { UserType } from '../lib'

export interface FileType extends BaseEntityType {
	createdById: string
	createdBy: UserType
	name: string
	type: string
	size: number
	md5: string
	bin?: any
	bin64?: string
}

export type FileCreateOptional = Pick<FileType, 'id' | 'createdById' | 'createdBy' | 'bin' | 'bin64'>
export type FileCreateRequired = Pick<FileType, 'name' | 'type' | 'size' | 'md5'>
export type FileCreate = FileCreateRequired & Partial<FileCreateOptional>
export type FileUpdate = Partial<FileCreate>

export function FileValidate(record: any) {
	assertValidSet<FileType>(record, {
		...BaseEntityValidations(record),
		createdById: isDefined(record.createdById) && assertValid('createdById', record.createdById, ['isString', 'isNoneEmpty']),
		createdBy: isDefined(record.createdBy) && assertValid('createdBy', record.createdBy?.id, ['isString', 'isNoneEmpty']),
		name: assertValid('name', record.name, ['isRequired', 'isString', 'isNoneEmpty']),
		type: assertValid('type', record.type, ['isRequired', 'isString', 'isNoneEmpty']),
		size: assertValid('size', record.size, ['isRequired', 'isNumber', 'isTruthy']),
		md5: assertValid('md5', record.md5, ['isRequired', 'isString', 'isNoneEmpty']),
		bin: isDefined(record.bin) && assertValid('bin', record.bin, ['isStringOrBuffer']),
		bin64: isDefined(record.bin64) && assertValid('bin64', record.bin64, ['isString', 'isNoneEmpty']),
	})
	if (!(record.createdById || record.createdBy))
		throw new FormValidationErrorSet(record, 'createdById or createdBy are required')
}