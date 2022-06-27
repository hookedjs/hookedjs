import type {User} from '../databases'
import type {Database, IFindProps, IStandardFields} from './Database'
import type {Model} from './Model'

export abstract class Collection<PM extends Model<any>, PMCreate> {
  abstract model: any
  abstract db: Database

  async connect(props: {currentUser: User}) {
    await this.db.connect(props)
  }
  async get(id: string): Promise<PM> {
    const doc = await this.db.get(id)
    return new this.model(doc)
  }
  async find(props: IFindProps<IStandardFields & PM> = {}): Promise<PM[]> {
    const docs = (await this.db.find({
      selector: {},
      ...props,
    })) as PM[]
    return docs.map(d => new this.model(d))
  }
  async findOne(props: IFindProps<IStandardFields & PM> = {}): Promise<PM> {
    const doc = await this.db.findOne({
      selector: {},
      ...props,
    })
    return new this.model(doc)
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
