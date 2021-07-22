import Database, { IFindProps, IStandardFields, loadingDb } from './Database'
import type PouchModel from './Model'

function cloneObject(obj: any) {
	if (obj === null || typeof(obj) !== 'object' || 'isActiveClone' in obj)
		return obj
	const temp = obj.constructor() // changed
	for (const key in obj) {
		if (Object.prototype.hasOwnProperty.call(obj, key)) {
			obj['isActiveClone'] = null
			temp[key] = cloneObject(obj[key])
			delete obj['isActiveClone']
		}
	}
	return temp
}


class PouchCollection<PM extends PouchModel<any>> {
	model: any = {db: loadingDb}
	indexes: string[] = []

	get db() { return this.model.db }
	
	get isReady() { return this.db !== loadingDb }
	
	async get(id: string): Promise<PM> {
		return new this.model(await this.db.get(id))
	}
	find(props: IFindProps<IStandardFields & PM> = {}): Promise<PM[]> {
		const propsMapped = Object.clone(props)
		if (!propsMapped.selector) propsMapped.selector = {}
		propsMapped.selector.type = this.model.type
		
		const nonIndexedFields = Object.keys(propsMapped.selector).subtract(this.model.indexes.concat(['_id', 'type']))
		if (nonIndexedFields.length)
			throw new Error(`Cannot use non-indexed fields: ${nonIndexedFields.join(', ')}`)

		return this.db
			.find(propsMapped as any)
			.then((res: any[]) => res.map((d: any) => new this.model(d)))
	}
	async findOne(props: Parameters<PouchCollection<PM>['find']>[0] = {}): Promise<PM> {
		const propsMapped = Object.clone(props)
		if (!propsMapped.selector) propsMapped.selector = {}
		propsMapped.selector.type = this.model.type
		return new this.model(await this.db.findOne(propsMapped) as any)
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