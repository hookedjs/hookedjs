import Database, { IFindProps, IStandardFields, loadingDb } from './Database'
import type PouchModel from './Model'

class PouchCollection<PM extends PouchModel<any>> {
	model: any = {db: loadingDb}
	indexes: string[] = []

	get db() { return this.model.db }
	
	get isReady() { return this.db !== loadingDb }
	
	async index() {
		await this.db._db.createIndex({index: {fields: this.indexes, name: this.model.type}})
	}
	async get(id: string): Promise<PM> {
		return new this.model(await this.db.get(id))
	}
	// TODO: getMany
	async find(props: IFindProps<IStandardFields & PM> = {}): Promise<PM[]> {
		await this.index()
		if (!props.selector) props.selector = {}
		props.selector.type = this.model.type
		const res = await this.db.find(props as any)
		return res.map((d: any) => new this.model(d))
	}
	async findOne(props: Parameters<PouchCollection<PM>['find']>[0] = {}): Promise<PM> {
		await this.index()
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
	// TODO: Implement after getMany is done
	// async deleteById(ids: string[]) {
	// 	const docs = await this.getMany(ids)
	// 	return Promise.all(docs.map(d => d.delete())) as Promise<PM[]>
	// }
	async deletePermanent(docs: PM[]) {
		return Promise.all(docs.map(d => d.deletePermanent()))
	}
	subscribe(ids: string[], callback: (doc: PM) => any) {
		return this.db.subscribe(ids, callback)
	}
}
export default PouchCollection