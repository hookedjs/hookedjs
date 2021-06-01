import {Column, Entity, ManyToOne} from 'typeorm'

import fileStorage from '#src/lib/fileStorage.node'

import BaseEntity from '../base/BaseEntity.node'
import { UserEntity } from '../User'
import * as l from './lib'

@Entity()
export default class FileEntity extends BaseEntity {
	@Column({ type: 'varchar', length: 30, nullable: true })
	createdById: string
	@ManyToOne(() => UserEntity, user => user.files)
	createdBy: l.FileType['createdBy']

	@Column({ type: 'varchar' })
	name: l.FileType['name']

	@Column({ type: 'varchar', length: 30 })
	type: l.FileType['type']

	@Column({ type: 'int', unsigned: true })
	size: l.FileType['size']

	@Column({ type: 'varchar', length: 32 })
	md5: l.FileType['md5']

	// Bin is a file string or buffer that can be supplied to create/update the file contents
	// It is _not_ populated when reading a file entity
	bin: l.FileType['bin']

	// bin64 is a helplfer for bin to populate bin from a base64 str
	bin64: l.FileType['bin64']

	constructor(seedObj?: Partial<l.FileCreate>) {super(seedObj)}
	async saveSafe(): Promise<FileEntity> {
		const file = await super.saveSafe()
		if (file.bin64) {
			this.bin = Buffer.from(file.bin64, 'base64')
			delete file.bin64
		}
		if (file.bin) {
			await fileStorage.put(file.id, file.bin, file.type)
			delete file.bin
		}
		return file
	}
	static async createSafe(obj: l.FileCreate) {return (new this(obj)).saveSafe()}
	static async insertSafe(arr: l.FileCreate[]) {return super.insertSafe(arr)}
	async sanitize() {l.FileValidate(this)}

	getBin() {return fileStorage.get(this.id)}
}
