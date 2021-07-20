import {nanoid} from 'nanoid'
import PouchDB from 'pouchdb'
import FindPlugin from 'pouchdb-find'

import { NotFoundError, throwNotFoundError } from '#lib/validation'

PouchDB.plugin(FindPlugin)

interface IDb {
	name: string
	host?: string
}

class Database {
	_db = new PouchDB('loading')
	name: IDb['name']
	host: IDb['host']
	connected = false
	
	constructor(name: Database['name'], host?: Database['host']) {
		this.name = name
		this.host = host
		this._db = new PouchDB(name)
	}
	async connect() {
		const remote = new PouchDB(`${this.host}/${this.name}`)
		// const opts = {live: true, retry: true}
		// this._db.replicate.to(remote, opts, e => e && console.error(e))
		// this._db.replicate.from(remote, opts, e => e && console.error(e))
		await new Promise((resolve, reject) => {
			this._db
				.sync(remote, {retry: true})
				.on('complete', resolve)
				.on('error', err => {console.log('Sync failed', err); reject(err)})
		})
		this._db.sync(remote, {retry: true, live: true})
		this.connected = true
	}
	destroy() {return this._db.destroy()}
	get<T extends IStandardFields>(id: string): Promise<T> {
		return new Promise<any>((resolve, reject) => {
			this._db.get<T>(id, {}, (err, doc) => {
				if (err?.status === 404) return reject(new NotFoundError())
				if (err?.message) return reject(new Error(err.message))
				if (!doc) return reject(new Error('Unexpected response'))
				resolve(doc)
			})
		})
	}
	set<T extends IStandardFieldsCreate>(doc: T): Promise<T & IStandardFields> {
		const now = new Date()
		if (!doc._id) doc._id = nanoid()
		if (!doc.createdAt) doc.createdAt = now
		doc.updatedAt = now
		return new Promise<any>((resolve, reject) => {
			this._db.put<T>(doc, {}, (err, idAndRev) => {
				if (err || !idAndRev || !idAndRev.ok) return reject(new Error('Error putting'))
				resolve({...doc, _id: idAndRev!.id, _rev: idAndRev!.rev})
			})
		})
	}
	find<T extends IStandardFields>(props: IFindProps<T>): Promise<T[]> {
		return new Promise((resolve, reject) => {
			this._db.find({selector: {}, ...props as any}, (err, res) => {
				if (!res?.docs || err) return reject(err)
				resolve(res.docs as T[])
			})
		})
	}
	async findOne<T extends IStandardFields>(props: IFindProps<T>): Promise<T> {
		const docs = await this.find(props)
		return docs?.[0] ?? throwNotFoundError()
	}
	delete<T extends IStandardFields>(doc: T): Promise<T> {
		const now = new Date()
		doc.updatedAt = now
		doc.deletedAt = now
		return new Promise<any>((resolve, reject) => {
			this._db.put<T>(doc, {}, (err, idAndRev) => {
				if (err || !idAndRev) return reject(new Error('Error deleting'))
				resolve({...doc, _id: idAndRev!.id, _rev: idAndRev!.rev})
			})
		})
	}
	deletePermanent(doc: {_id: string, _rev: string}) {
		return new Promise<any>((resolve, reject) => {
			this._db.remove(doc, {}, (err, res) => {
				if (err) return reject(new Error('Error permanent delete'))
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

export const loadingDb = new Database('loading')
loadingDb.destroy = async () => {}
loadingDb.get = () => {throw new DatabaseLoadingError()}
loadingDb.set = () => {throw new DatabaseLoadingError()}
loadingDb.find = () => {throw new DatabaseLoadingError()}
loadingDb.findOne = () => {throw new DatabaseLoadingError()}
loadingDb.delete = () => {throw new DatabaseLoadingError()}
loadingDb.deletePermanent = () => {throw new DatabaseLoadingError()}
loadingDb.subscribe = () => {throw new DatabaseLoadingError()}

class DatabaseLoadingError extends Error {
	constructor() {
		super('Database is loading')
	}
}
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

