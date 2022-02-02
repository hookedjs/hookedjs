import { assertValid, isDefined, isDefinedAndNotNull, ValueError } from '#src/lib/validation'

import Database, { IStandardFields, loadingDb } from './Database'

abstract class PouchModel<ExtraFields extends Record<string, any>> {
	// TS doesn't support abstract static props yet: https://github.com/microsoft/TypeScript/issues/34516
	static get db() {return loadingDb}
	abstract get db(): typeof loadingDb
	static type: IStandardFields['type']
	abstract type: string
	
	// indexes: A comma separated list of field names to index.
	static indexes: string[] = []

	_id: IStandardFields['_id']
	_rev: IStandardFields['_rev']
	// _revs_info is included if option {revs_info: true} was passed to the get() call
	_revs_info?: IStandardFields['_revs_info']
	_revisions?: IStandardFields['_revisions']
	_attachments?: IStandardFields['_attachments']
	_conflicts?: IStandardFields['_conflicts']
	createdAt: IStandardFields['createdAt']
	updatedAt: IStandardFields['updatedAt']
	deletedAt?: IStandardFields['deletedAt']
	version: IStandardFields['version']

	get isReady() { return this.db !== loadingDb }

	constructor(data: Partial<IStandardFields> & ExtraFields) {
		const now = new Date()
		Object.assign(
			this,
			{_id: data._id || PouchModel.createId(), createdAt: now, updatedAt: now, version: 0},
			data
		)
		this.valuesClean = this.values
	}

	static createId() {return Database.createId()}

	get values() {
		const sanitized = Object.rmUndefAttrs(
			Object.omit(this, ['db', 'isReady', 'values', 'valuesClean', 'isClean', 'isDirty'])
		) as IStandardFields & ExtraFields
		return sanitized
	}
	valuesClean: IStandardFields & ExtraFields
	get isClean() {
		return Object.isEqual(this.values, this.valuesClean)
	}
	get isDirty() {
		return !this.isClean
	}

	async refresh() {
		return Object.assign(this, await this.db.get(this._id))
	}
	async save() {
		Object.rmUndefAttrs(this, true)
		if (this.isClean) return this
		await this.validate()
		Object.assign(this, await this.db.set(this.values))
		this.valuesClean = this.values
		return this
	}
	async delete() {
		return Object.assign(this, await this.db.delete(this.values))
	}
	async deletePermanent() {
		await this.db.deletePermanent(this.values)
	}
	subscribe(callback: (doc: PouchModel<any> & ExtraFields) => any) {
		return this.db.subscribe([this._id], doc => {
			callback(Object.assign(this, doc) as any)
		})
	}

	async validate() {}
	baseValidations() {
		return {
			_rev: isDefinedAndNotNull(this._rev) && assertValid('_rev', this._rev, ['isRequired', 'isString'], { isLongerThan: 25, isShorterThan: 60 }),
			_revs_info: false,
			_revisions: false,
			_attachments: false,
			_conflicts: false,
			_id: assertValid('_id', this._id, ['isRequired', 'isString', 'isNoneEmpty']),
			createdAt: isDefined(this.createdAt) && assertValid('createdAt', this.createdAt, ['isDate']),
			updatedAt: isDefined(this.updatedAt) && assertValid('updatedAt', this.updatedAt, ['isDate']),
			deletedAt: isDefined(this.deletedAt) && assertValid('deletedAt', this.deletedAt, ['isDate']),
			version: isDefined(this.version) && assertValid('version', this.version, ['isNumber']),
		} as const
	}

	async isFieldUnique(fieldName: keyof this) {
		const existing = await this.db.findOne<any>({selector: {[fieldName]: this[fieldName]}}).catch(() => null)
		const isUnique =  !existing || existing._id === this._id
		return isUnique
	}
	async validateFieldIsUnique(fieldName: keyof this, errorMessage?: string) {
		return (await this.isFieldUnique(fieldName)) ? false : new ValueError(fieldName as string, errorMessage || `${fieldName} is invalid`)
	}

	static mockStandardFields: IStandardFields = {
		_id: '72ff88753a64d9bb2cd014d7f803573b',
		_rev: '72ff88753a64d9bb2cd014d7f803573b',
		_revs_info: undefined,
		_revisions: undefined,
		_attachments: undefined,
		_conflicts: undefined,
		createdAt: new Date(),
		updatedAt: new Date(),
		deletedAt: undefined,
		version: 0,
		type: 'base',
	}
}
export default PouchModel
