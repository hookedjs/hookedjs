import * as crypto from 'crypto'
import {Column, Entity, OneToMany} from 'typeorm'

import BaseEntity from '../base/BaseEntity'
import { FileEntity } from '../File'
import * as l from './lib'

@Entity()
export default class UserEntity extends BaseEntity {
	@Column({type: 'varchar', unique: true, length: 30}) 
	email: l.UserType['email']

	password?: string // converts to this.passwordHash in sanitize
	@Column({type: 'varchar', nullable: true, length: 161})
	passwordHash: l.UserType['passwordHash']
	@Column({type: 'timestamp'})
	passwordUpdatedAt: l.UserType['passwordUpdatedAt']

	@Column({type: 'smallint'})
	status: l.UserType['status']

	@Column({type: 'simple-json'})
	roles: l.UserType['roles']

	@Column({type: 'varchar', length: 30}) 
	givenName: l.UserType['givenName']

	@Column({type: 'varchar', length: 30})
	surname: l.UserType['surname']

	@OneToMany(() => FileEntity, file => file.createdBy)
	files: l.UserType['files'];

	constructor(seedObj?: Partial<l.UserCreate>) {
		const defaults: Partial<UserEntity> = {
			roles: [l.UserRoleEnum.AUTHOR],
			status: l.UserStatusEnum.ACTIVE
		}	
		super({...defaults, ...seedObj})
	}
	async saveSafe(): Promise<UserEntity> {return super.saveSafe()}
	static async createSafe(obj: l.UserCreate) {return (new this(obj)).saveSafe()}
	static async insertSafe(arr: l.UserCreate[]) {return super.insertSafe(arr)}
	toJSON() {return {...this, passwordHash: '*******'}}
	
	async sanitize() {
		if (this.password) {
			this.passwordHash = await UserEntity.hashPassword(this.password)
			this.passwordUpdatedAt = new Date()
			delete this.password
		}
		l.UserValidate(this)
		this.roles = this.roles.deDuplicate()
	}

	static async hashPassword(str: string, salt = crypto.randomBytes(16).toString('hex')): Promise<string> {
		return new Promise((resolve, reject) => {
			crypto.scrypt(str, salt, 64, (err, derivedKey) => {
				if (err) reject(err)
				resolve(derivedKey.toString('hex')+'.'+salt)
			})
		})
	}
	async comparePassword(password: string) {
		if (!this.passwordHash) return false
		return (
			this.passwordHash 
			&& this.passwordHash === await UserEntity.hashPassword(password, this.passwordHash.slice(-32))
		)
	}
}