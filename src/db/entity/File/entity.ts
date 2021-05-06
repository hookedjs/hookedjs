import {Column, Entity, ManyToOne} from 'typeorm'

import fileStorage from '#src/lib/fileStorage'
import { assertValid, assertValidSet, FormValidationErrorSet, isDefinedAndNotNull } from '#src/lib/validation'

import BaseEntity from '../base/BaseEntity'
import { UserEntity } from '../User'
import type * as t from './types'

@Entity()
export default class FileEntity extends BaseEntity {
	@Column({ type: 'varchar', length: 30, nullable: true })
	createdById: string
	@ManyToOne(() => UserEntity, user => user.files)
	createdBy: t.FileType['createdBy']

	@Column({ type: 'varchar' })
	name: t.FileType['name']

	@Column({ type: 'varchar', length: 30 })
	type: t.FileType['type']

	@Column({ type: 'int', unsigned: true })
	size: t.FileType['size']

	@Column({ type: 'varchar', length: 32 })
	md5: t.FileType['md5']

	// Bin is a base64 string that can be supplied to create/update the file contents
	// It is _not_ populated when reading a file entity
	bin: t.FileType['bin']

	constructor(seedObj?: Partial<t.FileCreate>) {super(seedObj)}
	async saveSafe(): Promise<FileEntity> {
		const file = await super.saveSafe()
		if (file.bin) {
			await fileStorage.put(file.id, file.bin, file.type)
			delete file.bin
		}
		return file
	}
	static async createSafe(obj: t.FileCreate) {return (new this(obj)).saveSafe()}
	static async insertSafe(arr: t.FileCreate[]) {return super.insertSafe(arr)}

	async sanitize() {
		assertValidSet<t.FileType>(this, {
			id: assertValid('id', this.id, ['isRequired', 'isString', 'isNoneEmpty']),
			createdById: 'createdById' in this && assertValid('createdById', this.createdById, ['isString', 'isNoneEmpty']),
			createdBy: 'createdBy' in this && assertValid('createdBy', this.createdBy, [], {isInstanceOf: UserEntity}),
			name: assertValid('name', this.name, ['isRequired', 'isString', 'isNoneEmpty']),
			type: assertValid('type', this.type, ['isRequired', 'isString', 'isNoneEmpty']),
			size: assertValid('size', this.size, ['isRequired', 'isNumber', 'isTruthy']),
			md5: assertValid('md5', this.md5, ['isRequired', 'isString', 'isNoneEmpty']),
			bin: 'bin' in this && assertValid('bin', this.bin, ['isString', 'isNoneEmpty']),
			createdAt: false,
			updatedAt: false,
			deletedAt: false,
			version: false,
		})
		if (!(this.createdById || this.createdBy))
			throw new FormValidationErrorSet(this, 'createdById or createdBy are required')
	}

	getBin() {return fileStorage.get(this.id)}
}
