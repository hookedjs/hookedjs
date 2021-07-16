import Database, { IFindProps, IStandardFields } from './Database'
import type PouchModel from './Model'

class PouchCollection<PM extends PouchModel<any>> {
	_db = new Database({name: 'loading'})
	_model: any
	_type: string
	
	async get(id: string): Promise<PM> {
		return new this._model(await this._db.get<PM>(id))
	}
	async find(props: IFindProps<IStandardFields> = {}): Promise<PM[]> {
		if (!props.selector) props.selector = {}
		props.selector.type = this._type
		return new this._model(await this._db.find<PM>(props as any))
	}
	async findOne(props: Parameters<PouchCollection<PM>['find']>[0] = {}): Promise<PM> {
		if (!props.selector) props.selector = {}
		props.selector.type = this._type
		return new this._model(await this._db.findOne(props) as any)
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
		return this._db.subscribe(ids, callback)
	}
}
export default PouchCollection