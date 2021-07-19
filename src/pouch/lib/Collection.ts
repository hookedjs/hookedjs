import Database, { IFindProps, IStandardFields, loadingDb } from './Database'
import type PouchModel from './Model'

class PouchCollection<PM extends PouchModel<any>> {
	model: any = {db: loadingDb}

	get db() { return this.model.db }
	
	get isReady() { return this.db !== loadingDb }
	
	// init(database: Database) {
	// 	this._db = database
	// 	this.initialized = true
	// }
	// destroy() {
	// 	this._db = loadingDb
	// 	this.initialized = false
	// }
	async get(id: string): Promise<PM> {
		return new this.model(await this.db.get(id))
	}
	async find(props: IFindProps<IStandardFields> = {}): Promise<PM[]> {
		if (!props.selector) props.selector = {}
		props.selector.type = this.model.type
		const res = await this.db.find(props as any)
		return res.map((d: any) => new this.model(d))
	}
	async findOne(props: Parameters<PouchCollection<PM>['find']>[0] = {}): Promise<PM> {
		if (!props.selector) props.selector = {}
		props.selector.type = this.model.type
		return new this.model(await this.db.findOne(props) as any)
	}
	async save(docs: PM[]) {
		return Promise.all(docs.map(d => d.save())) as Promise<PM[]>
	}
	async delete(docs: PM[]) {
		return Promise.all(docs.map(d => d.delete())) as Promise<PM[]>
	}
	async deleteById(ids: string[]) {
		const docs = await this.find({selector: {_id: {$in: ids}}})
		return Promise.all(docs.map(d => d.delete())) as Promise<PM[]>
	}
	async deletePermanent(docs: PM[]) {
		return Promise.all(docs.map(d => d.deletePermanent()))
	}
	subscribe(ids: string[], callback: (doc: PM) => any) {
		return this.db.subscribe(ids, callback)
	}
}
export default PouchCollection