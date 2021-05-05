import {Column, Entity, ManyToOne} from 'typeorm'

import { assertValid, assertValidSet, FormValidationErrorSet, isDefinedAndNotNull } from '#src/lib/validation'

import BaseEntity from '../BaseEntity'
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

	constructor(seedObj?: Partial<t.FileCreate>) {super(seedObj)}
	async saveSafe(): Promise<FileEntity> {return super.saveSafe()}
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
			createdAt: false,
			updatedAt: false,
			deletedAt: false,
			version: false,
		})
		if (!(this.createdById || this.createdBy))
			throw new FormValidationErrorSet(this, 'createdById or createdBy are required')
	}
}
