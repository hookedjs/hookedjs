import * as crypto from 'crypto'
import {Column, Entity, OneToMany} from 'typeorm'

import { assertValid, assertValidSet, isDefinedAndNotNull } from '#lib/validation'

import BaseEntity from '../BaseEntity'
import { FileEntity } from '../File'
import * as t from './types'

@Entity()
export default class UserEntity extends BaseEntity {
	@Column({type: 'varchar', unique: true, length: 30}) 
	email: t.UserType['email']

	password?: string // converts to this.passwordHash in sanitize
	@Column({type: 'varchar', nullable: true, length: 161})
	passwordHash: t.UserType['passwordHash']
	@Column({type: 'timestamp'})
	passwordUpdatedAt: t.UserType['passwordUpdatedAt']

	@Column({type: 'smallint'})
	status: t.UserType['status']

	@Column({type: 'varchar', default: '[0]', length: 30})
	rolesJson: string
	get roles() { return JSON.parse(this.rolesJson) as t.UserRoleEnum[]}
	set roles(roles: t.UserRoleEnum[]) { this.rolesJson = JSON.stringify(roles)}

	@Column({type: 'varchar', length: 30}) 
	givenName: t.UserType['givenName']

	@Column({type: 'varchar', length: 30})
	surname: t.UserType['surname']

	@OneToMany(() => FileEntity, file => file.createdBy)
	files: t.UserType['files'];

	constructor(seedObj?: Partial<t.UserCreate>) {
		const defaults: Partial<UserEntity> = {
			roles: [t.UserRoleEnum.AUTHOR],
			status: t.UserStatusEnum.ACTIVE
		}	
		super({...defaults, ...seedObj})
	}
	async saveSafe(): Promise<UserEntity> {return super.saveSafe()}
	static async createSafe(obj: t.UserCreate) {return (new this(obj)).saveSafe()}
	static async insertSafe(arr: t.UserCreate[]) {return super.insertSafe(arr)}
	toJSON() {return {...Object.omit(this, ['rolesJson']), passwordHash: '*******', roles: this.roles}}
	
	async sanitize() {
		if (this.password) {
			this.passwordHash = await UserEntity.hashPassword(this.password)
			this.passwordUpdatedAt = new Date()
			delete this.password
		}
		assertValidSet<t.UserType>(this, {
			id: assertValid('id', this.id, ['isRequired', 'isString', 'isNoneEmpty']),
			email: assertValid('email', this.email, ['isRequired', 'isString', 'isTruthy', 'isEmail']),
			password: isDefinedAndNotNull(this.password) && assertValid('password', this.password, ['isString', 'isNoneEmpty', 'isPassword']),
			passwordHash: isDefinedAndNotNull(this.passwordHash) && assertValid('passwordHash', this.passwordHash, ['isString', 'isHash']),
			passwordUpdatedAt: false,
			status: assertValid('status', this.status, ['isRequired', 'isNumber'], { isOneOfSet: t.UserStatusSet }),
			rolesJson: assertValid('rolesJson', this.rolesJson, ['isRequired', 'isString', 'isNoneEmpty']),
			roles: assertValid('roles', this.roles, ['isRequired', 'isArray', 'isNoneEmpty'], { arrayValuesAreOneOfSet: t.UserRoleSet }),
			surname: assertValid('surname', this.surname, ['isRequired', 'isString'], { isLongerThan: 2, isShorterThan: 30 }),
			givenName: assertValid('givenName', this.givenName, ['isRequired', 'isString'], { isLongerThan: 2, isShorterThan: 30 }),
			files: false,
			createdAt: false,
			updatedAt: false,
			deletedAt: false,
			version: false,
		})
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