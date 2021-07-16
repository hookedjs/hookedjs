import Database, { IStandardFields } from './Database'

class PouchModel<ExtraFields extends Record<string, any>> {
	_db = new Database({name: 'loading'})

	_id: IStandardFields['_id'] = ''
	_rev: IStandardFields['_rev'] = ''
	// _revs_info is included if option {revs_info: true} was passed to the get() call
	_revs_info?: IStandardFields['_revs_info']
	_revisions?: IStandardFields['_revisions']
	_attachments?: IStandardFields['_attachments']
	_conflicts?: IStandardFields['_conflicts']
	type: IStandardFields['type']
	createdAt = new Date()
	updatedAt = new Date()
	deletedAt: IStandardFields['deletedAt']

	constructor(data: Partial<PouchModel<any> & ExtraFields> = {}) {
		Object.assign(this, data)
	}

	extractSaveObject() {
		return Object.omit(this, ['_db'])
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
		return Object.assign(this, await this._db.get(this._id))
	}
	// async save(): Promise<PouchModel<any> & ExtraFields> {
	async save() {
		return Object.assign(this, await this._db.set(this.extractSaveObject()))
	}
	async delete() {
		return Object.assign(this, await this._db.delete(this.extractSaveObject()))
	}
	async deletePermanent() {
		await this._db.deletePermanent(this.extractSaveObject())
		this.clearStandardFields()
	}
	subscribe(callback: (doc: PouchModel<any> & ExtraFields) => any) {
		return this._db.subscribe([this._id], doc => {
			callback(Object.assign(this, doc) as any)
		})
	}
}
export default PouchModel
