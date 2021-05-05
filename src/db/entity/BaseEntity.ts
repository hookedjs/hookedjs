/**
 * BaseEntity extends Typeorm's BaseEntity with
 * 1. default fields
 * 2. constructor accepts initial values
 * 3. sanitize helper functions
 * 
 * Note: You should override the functions and call 'super'
 *       so that types are forwarded properly.
 */
import * as cuid from 'cuid'
import {BaseEntity as tBaseEntity, CreateDateColumn, DeleteDateColumn, PrimaryColumn, UpdateDateColumn, VersionColumn} from 'typeorm'

import { FormValidationErrorSet, ValidationErrorSet, ValueError } from '#lib/validation'

import type { BaseEntityType } from './BaseEntityTypes'

class BaseEntity extends tBaseEntity {
	@PrimaryColumn('varchar', {length: 30})
	id: BaseEntityType['id']
	@CreateDateColumn()
	createdAt: BaseEntityType['createdAt']
	@UpdateDateColumn()
	updatedAt: BaseEntityType['updatedAt']
	@DeleteDateColumn()
	deletedAt: BaseEntityType['deletedAt']
	@VersionColumn()
	version: BaseEntityType['version']

	constructor(seedObj?: any) {
		super()
		this.id = cuid()
		if(seedObj) Object.assign(this, seedObj)
	}
	// Generic save helpers which apply sanitize
	async saveSafe(): Promise<any> {return await this.sanitize(), this.save().catch(e => {
		if (e.message.startsWith('Duplicate')) {
			const errorVal = e.message.match(/Duplicate entry '(.*)' for key/)[1]
			for (const [key,val] of Object.entries(this)) {
				if (errorVal == val)
					throw new ValidationErrorSet(this, {[key]: new ValueError(key, `${key} is unavailable`)})	
			}
			throw new FormValidationErrorSet(this, 'one or more values conflict with an existing record')
		}
		throw e
	})}
	static async createSafe(obj: any) {return (new this(obj)).saveSafe()}
	static async insertSafe(arr: any[]) {
		const sanitized = await Promise.all([...arr].map(obj => new this(obj)).map(async ent => (await ent.sanitize(),ent)))
		return this.insert(sanitized as any)
	}
	
	async sanitize() {}

	toJSON() {return this as any}
	toString() {return JSON.stringify(this.toJSON())}
}
export default BaseEntity