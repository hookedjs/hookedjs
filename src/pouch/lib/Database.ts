import cuid from 'cuid'
import PouchDB from 'pouchdb'
import FindPlugin from 'pouchdb-find'
PouchDB.plugin(FindPlugin)

interface IDb {
	name: string
	host: string
	user: string
	password: string
}

class Database {
	_db = new PouchDB('loading')
	name: IDb['name']
	host: IDb['host']
	user: IDb['user']
	password: IDb['password']
	
	constructor(defaults: {name: IDb['name'], host?: IDb['host']}) {
		Object.assign(this, defaults)
		const db = new PouchDB(this.name)
	}
	connect({user, password}: Pick<IDb, 'user' | 'password'>) {
		this.user = user
		// TODO: cookie based password
		this.password = password
		// TODO: Support connection modes, like localonly, remote only, both
		// const remote = new PouchDB(`${this.host}/db/${this.name}`, {
		// 	auth: {
		// 		username: this.user,
		// 		password: this.password,
		// 	}
		// })
		const remote = new PouchDB(`${this.host}/${this.name}`, {
			auth: {
				username: this.user,
				password: this.password,
			}
		})
		const opts = {live: true, retry: true}
		this._db.replicate.to(remote, opts, e => {console.dir(e)})
		this._db.replicate.from(remote, opts, e => {console.dir(e)})
	}
	destroy() {return this._db.destroy()}
	get<T extends IStandardFields>(id: string): Promise<T> {
		return new Promise<any>((resolve, reject) => {
			this._db.get<T>(id, {}, (err, doc) => {
				if (err || !doc) return reject('Error getting')
				resolve(doc)
			})
		})
	}
	set<T extends IStandardFieldsCreate>(doc: T): Promise<T & IStandardFields> {
		const now = new Date()
		if (!doc._id) doc._id = cuid()
		if (!doc.createdAt) doc.createdAt = now
		doc.updatedAt = now
		return new Promise<any>((resolve, reject) => {
			this._db.put<T>(doc, {}, (err, idAndRev) => {
				if (err || !idAndRev || !idAndRev.ok) return reject('Error putting')
				resolve({...doc, _id: idAndRev!.id, _rev: idAndRev!.rev})
			})
		})
	}
	find<T extends IStandardFields>(props: IFindProps<T>): Promise<T[]> {
		return new Promise((resolve, reject) => {
			this._db.find({selector: {}, ...props as any}, (err, res) => {
				if (!res?.docs.length || err) return reject(err)
				resolve(res.docs as T[])
			})
		})
	}
	async findOne<T extends IStandardFields>(props: IFindProps<T>): Promise<T> {
		const docs = await this.find(props)
		if (!docs.length) throw Error('Document not found')
		return docs[0]
	}
	delete<T extends IStandardFields>(doc: T): Promise<T> {
		const now = new Date()
		doc.updatedAt = now
		doc.deletedAt = now
		return new Promise<any>((resolve, reject) => {
			this._db.put<T>(doc, {}, (err, idAndRev) => {
				if (err || !idAndRev) return reject('Error deleting')
				resolve({...doc, _id: idAndRev!.id, _rev: idAndRev!.rev})
			})
		})
	}
	deletePermanent(doc: {_id: string, _rev: string}) {
		return new Promise<any>((resolve, reject) => {
			this._db.remove(doc, {}, (err, res) => {
				if (err) return reject('Error permanent delete')
				resolve(null)
			})
		})
	}
	subscribe(ids: string[], callback: (change: any) => void) {
		const handle = this._db.changes({
			since: 'now',
			live: true,
			include_docs: true,
			doc_ids: ids,
		})
			.on('change', ({doc}) => callback(doc))
			.on('complete', info => {
				console.log('changes() was canceled')
			})
			.on('error', (err) => {
				console.log(err)
			})
		return handle
	}
}
export default Database

export interface IStandardFieldsCreate {
	_id?: string
	type: string
	createdAt?: Date
	updatedAt?: Date
	deletedAt?: Date | undefined
}

export interface IStandardFields {
	_id: string
	type: string
	createdAt: Date
	updatedAt: Date
	deletedAt?: Date | undefined
	_rev: string
	// _revs_info is included if option {revs_info: true} was passed to the get() call
	_revs_info?: {rev: string, status: 'available' | 'compacted' | 'not compacted' | 'missing'}[] | undefined
	_revisions?: {ids: string[], start: number} | undefined
	_attachments?: {[attachmentId: string]: IAttachment} | undefined
	_conflicts?: string[] | undefined
}


/**
 * Stub attachments are returned by PouchDB by default (attachments option set to false)
 */
export interface IStubAttachment {
	/**
	 * Mime type of the attachment
	 */
	content_type: string;

	/**
	 * Database digest of the attachment
	 */
	digest: string;

	/**
	 * Attachment is a stub
	 */
	stub: true;

	/**
	 * Length of the attachment
	 */
	length: number;
}

/**
* Full attachments are used to create new attachments or returned when the attachments option
* is true.
*/
export interface IFullAttachment {
	/**
	 * Mime type of the attachment
	 */
	content_type: string;

	/** MD5 hash, starts with "md5-" prefix; populated by PouchDB for new attachments */
	digest?: string | undefined;

	/**
	 * {string} if `binary` was `false`
	 * {Blob|Buffer} if `binary` was `true`
	 */
	data: string | Buffer;
}

export type IAttachment = IStubAttachment | IFullAttachment;

export interface IFindProps<P extends Record<string, any>> {
	selector?: Partial<P> | Partial<Record<keyof P, Partial<Record<ISelectorFilter, any>>>>
	fields?: (keyof P)[]
	sort?: (keyof P)[]
}
type ISelectorFilter = '$lt' | '$gt' | '$lte' | '$gte' | '$eq' | '$ne' | '$exists' | '$type' | '$in' | '$and' | '$nin' | '$all' | '$size' | '$or' | '$nor' | '$not' | '$mod' | '$regex' | '$elemMatch'

