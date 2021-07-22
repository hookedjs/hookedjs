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
	findCache = new Map<
		string,
		{
			fetching: boolean
			fetchP: Promise<any> | undefined
			value: any
			error?: Error
			time: number
			// subscribers: Map<number, () => any>
			// refetch(): Promise<any>
		}
	>()
	findCacheGarbageCollectInterval: NodeJS.Timeout // an interval
	
	constructor(name: Database['name'], host?: Database['host']) {
		this.name = name
		this.host = host
		this._db = new PouchDB(name)
		this.findCacheGarbageCollect()
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
	destroy() {
		clearInterval(this.findCacheGarbageCollectInterval)
		return this._db.destroy()
	}
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
	/**
	 * A smart find feature that:
	 *   1. Detects and de-dup simultaneous duplicate queries (race queries)
	 *   2. Sets a cach that can be accessed externally for hooks
	 */
	find<T extends IStandardFields>(props: IFindProps<T>): Promise<T[]> {
		const key = JSON.stringify(props)
		const cached = {
			fetching: false,
			fetchP: undefined,
			value: undefined,
			error: undefined,
			time: Date.now(),
			...this.findCache.get(key)
		}

		if (props.selector?._id) {
			// console.log('Find:', key)
			if (cached.fetching) console.log('Find: hit')
			else console.log('Find: miss', JSON.stringify(cached))
		}

		if (cached.fetching) return cached.fetchP as any
		
		cached.fetching = true
		cached.fetchP = new Promise((resolve, reject) => {
			this._db.find({selector: {}, ...props as any}, (err, res) => {
				const cached = this.findCache.get(key)!
				if (!res?.docs || err) {
					this.findCache.set(key, {
						...cached,
						fetching: false,
						value: undefined,
						error: err as Error || new Error('Unknown error'),
						time: Date.now()
					})
					reject(err)
				}
				else {
					this.findCache.set(key, {
						...cached,
						fetching: false,
						value: res.docs,
						error: undefined,
						time: Date.now()
					})
					resolve(res.docs as any)
				}
			})
		})
		this.findCache.set(key, cached)
		return cached.fetchP
	}
	findOne<T extends IStandardFields>(props: IFindProps<T>): Promise<T> {
		// TODO: If props.selector._id is set, use this.get instead of this.find. Maybe make this.get private?
		return this.find({...props, limit: 1}).then(docs => docs?.[0] ?? throwNotFoundError())
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
	indexModels(models: any[]) {
		return Promise.all([
			this._db.createIndex({index: {fields: ['type']}}),
			...models.map(model => 
				this._db.createIndex({index: {fields: model.indexes, name: model.type}})
			)
		])
	}
	findCacheGarbageCollect() {
		const maxAge = 10 * 60 * 1000
		this.findCacheGarbageCollectInterval = setInterval(() => {
			const now = Date.now()
			this.findCache.forEach((value, key, map) => {
				if (now - value.time > maxAge) map.delete(key)
			})
		}, maxAge / 2 + 1)
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
	limit?: number
	skip?: number
	useIndex?: string
}
type ISelectorFilter = '$lt' | '$gt' | '$lte' | '$gte' | '$eq' | '$ne' | '$exists' | '$type' | '$in' | '$and' | '$nin' | '$all' | '$size' | '$or' | '$nor' | '$not' | '$mod' | '$regex' | '$elemMatch'

