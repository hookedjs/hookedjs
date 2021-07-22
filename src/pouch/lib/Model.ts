import { IStandardFields, loadingDb } from './Database'

class PouchModel<ExtraFields extends Record<string, any>> {
	static get db() {return loadingDb}
	get db() {return loadingDb}
	static type: IStandardFields['type'] = 'base'
	type = PouchModel.type
	// indexes: A comma separated list of field names to index.
	static indexes: string[] = []

	_id: IStandardFields['_id'] = ''
	_rev: IStandardFields['_rev'] = ''
	// _revs_info is included if option {revs_info: true} was passed to the get() call
	_revs_info?: IStandardFields['_revs_info']
	_revisions?: IStandardFields['_revisions']
	_attachments?: IStandardFields['_attachments']
	_conflicts?: IStandardFields['_conflicts']
	createdAt = new Date()
	updatedAt = new Date()
	deletedAt: IStandardFields['deletedAt']

	get isReady() { return this.db !== loadingDb }

	constructor(data: Partial<PouchModel<any> & ExtraFields> = {}) {
		Object.assign(this, data)
	}

	extractSaveObject() {
		return Object.omit(this, ['db'])
	}
	clearStandardFields() {
		return Object.assign(this, {
			_id: '',
			_rev: '',
			_revs_info: undefined,
			_revisions: undefined,
			_attachments: undefined,
			_conflicts: undefined,
			createdAt: new Date(),
			updatedAt: new Date(),
			deletedAt: undefined
		})
	}

	async refresh() {
		return Object.assign(this, await this.db.get(this._id))
	}
	// async save(): Promise<PouchModel<any> & ExtraFields> {
	async save() {
		return Object.assign(this, await this.db.set(this.extractSaveObject()))
	}
	async delete() {
		return Object.assign(this, await this.db.delete(this.extractSaveObject()))
	}
	async deletePermanent() {
		await this.db.deletePermanent(this.extractSaveObject())
		this.clearStandardFields()
	}
	subscribe(callback: (doc: PouchModel<any> & ExtraFields) => any) {
		return this.db.subscribe([this._id], doc => {
			callback(Object.assign(this, doc) as any)
		})
	}
}
export default PouchModel
