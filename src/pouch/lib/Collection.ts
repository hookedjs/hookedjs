import {IFindProps, IStandardFields, loadingDb} from './Database'
import type PouchModel from './Model'

abstract class PouchCollection<PM extends PouchModel<any>, PMCreate> {
  abstract model: any
  indexes: string[] = []

  get db() {
    return this.model.db
  }

  get isReady() {
    return this.db !== loadingDb
  }

  async get(id: string): Promise<PM> {
    return new this.model(await this.db.get(id))
  }
  find(props: IFindProps<IStandardFields & PM> = {}): Promise<PM[]> {
    const propsMapped = Object.copy(props)
    if (!propsMapped.selector) propsMapped.selector = {}
    propsMapped.selector.type = this.model.type

    const nonIndexedFields = propsMapped.selector._keys().minusF(this.model.indexes.concat(['_id', 'type']))
    if (nonIndexedFields.length) throw new Error(`Cannot use non-indexed fields: ${nonIndexedFields.join(', ')}`)

    return this.db.find(propsMapped as any).then((res: any[]) => res.map((d: any) => new this.model(d)))
  }
  async findOne(props: Parameters<PouchCollection<PM, PMCreate>['find']>[0] = {}): Promise<PM> {
    const propsMapped = Object.copy(props)
    if (!propsMapped.selector) propsMapped.selector = {}
    propsMapped.selector.type = this.model.type
    return new this.model((await this.db.findOne(propsMapped)) as any)
  }
  async create(initials: PMCreate[]): Promise<PM[]> {
    const docs = initials.map(i => new this.model(i))
    return Promise.all(docs.map(d => d.save()))
  }
  async createOne(initial: PMCreate): Promise<PM> {
    const doc = new this.model(initial)
    return doc.save()
  }
  async delete(docs: PM[]) {
    const res = Promise.all(docs.map(d => d.delete())) as Promise<PM[]>
    return res
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
