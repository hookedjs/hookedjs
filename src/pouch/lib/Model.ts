import { nanoid } from 'nanoid'

import { assertValid, isDefined, ValueError } from '#src/lib/validation'

import { IStandardFields, loadingDb } from './Database'

class PouchModel<ExtraFields extends Record<string, any>> {
	static get db() {return loadingDb}
	get db() {return loadingDb}
	static type: IStandardFields['type'] = 'base'
	type = PouchModel.type
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
			{_id: data._id || nanoid(), createdAt: now, updatedAt: now, version: 0},
			data
		)
	}

	extractSaveObject() {
		return Object.omit(this, ['db'])
	}

	async refresh() {
		return Object.assign(this, await this.db.get(this._id))
	}
	// async save(): Promise<PouchModel<any> & ExtraFields> {
	async save() {
		await this.validate()
		return Object.assign(this, await this.db.set(this.extractSaveObject()))
	}
	async delete() {
		return Object.assign(this, await this.db.delete(this.extractSaveObject()))
	}
	async deletePermanent() {
		await this.db.deletePermanent(this.extractSaveObject())
	}
	subscribe(callback: (doc: PouchModel<any> & ExtraFields) => any) {
		return this.db.subscribe([this._id], doc => {
			callback(Object.assign(this, doc) as any)
		})
	}

	async validate() {}
	baseValidations() {
		return {
			_rev: false,
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
		return (await this.db.findOne<any>({selector: {[fieldName]: this[fieldName]}, limit: 1})).length ? false : true
	}
	async validateFieldIsUnique(fieldName: keyof this, errorMessage?: string) {
		return (await this.isFieldUnique(fieldName)) ? false : new ValueError(fieldName as string, errorMessage || `${fieldName} is invalid`)
	}
}
export default PouchModel
