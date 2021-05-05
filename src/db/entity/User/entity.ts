import * as crypto from 'crypto'
import {Column, Entity} from 'typeorm'

import { assertValid, assertValidSet, isDefinedAndNotNull } from '#src/lib/validation'

import BaseEntity from '../BaseEntity'
import {UserCreate, UserRoleEnum, UserRoleSet, UserStatusEnum, UserStatusSet, UserType} from './types'

@Entity()
export default class UserEntity extends BaseEntity {
	@Column('varchar', {unique: true, length: 30}) 
	email: UserType['email']

	password?: string // converts to this.passwordHash in sanitize
	@Column('varchar', {nullable: true, length: 161})
	passwordHash: UserType['passwordHash']
	@Column('timestamp')
	passwordUpdatedAt: UserType['passwordUpdatedAt']

	@Column('smallint')
	status: UserType['status']

	@Column('varchar', {default: '[0]', length: 30})
	rolesJson: string
	get roles() { return JSON.parse(this.rolesJson) as UserRoleEnum[]}
	set roles(roles: UserRoleEnum[]) { this.rolesJson = JSON.stringify(roles)}

	@Column('varchar', {length: 30}) 
	givenName: UserType['givenName']

	@Column('varchar', {length: 30})
	surname: UserType['surname']

	constructor(seedObj?: UserCreate) {
		super(seedObj)
		this.roles = [UserRoleEnum.AUTHOR]
		this.status = UserStatusEnum.ACTIVE
	}
	async saveSafe(): Promise<UserEntity> {return super.saveSafe()}
	static async createSafe(obj: UserCreate) {return (new this(obj)).saveSafe()}
	static async insertSafe(arr: UserCreate[]) {return super.insertSafe(arr)}
	toJSON() {return {...Object.omit(this, ['rolesJson']), passwordHash: '*******', roles: this.roles}}
	toString() {return JSON.stringify(this.toJSON())}
	
	async sanitize() {
		if (this.password) {
			this.passwordHash = await UserEntity.hashPassword(this.password)
			this.passwordUpdatedAt = new Date()
			delete this.password
		}
		assertValidSet<UserType>(this, {
			id: assertValid('id', this.id, ['isRequired', 'isString', 'isNoneEmpty']),
			email: assertValid('email', this.email, ['isRequired', 'isString', 'isTruthy', 'isEmail']),
			password: isDefinedAndNotNull(this.password) && assertValid('password', this.password, ['isString', 'isNoneEmpty', 'isPassword']),
			passwordHash: isDefinedAndNotNull(this.passwordHash) && assertValid('passwordHash', this.passwordHash, ['isString', 'isHash']),
			passwordUpdatedAt: false,
			status: assertValid('status', this.status, ['isRequired', 'isNumber'], { isOneOfSet: UserStatusSet }),
			rolesJson: assertValid('rolesJson', this.rolesJson, ['isRequired', 'isString', 'isNoneEmpty']),
			roles: assertValid('roles', this.roles, ['isRequired', 'isArray', 'isNoneEmpty'], { arrayValuesAreOneOfSet: UserRoleSet }),
			surname: assertValid('surname', this.surname, ['isRequired', 'isString'], { isLongerThan: 2, isShorterThan: 30 }),
			givenName: assertValid('givenName', this.givenName, ['isRequired', 'isString'], { isLongerThan: 2, isShorterThan: 30 }),
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