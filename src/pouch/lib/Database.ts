import {nanoid} from 'nanoid'
import PouchDbEs from 'pouchdb'
import * as PouchDbAll from 'pouchdb'
import FindPluginEs from 'pouchdb-find'
import * as FindPluginAll from 'pouchdb-find'

import { NotFoundError, throwNotFoundError } from '#lib/validation'

// I don't know why, but this is the only way I can get imports to
// work isomorphically
const PouchDb = PouchDbEs || PouchDbAll
const FindPlugin = FindPluginEs || FindPluginAll

PouchDb.plugin(FindPlugin)

interface IDb {
	name: string
	host?: string
}

class Database {
	_db = new PouchDb('loading')
	_remote = new PouchDb('loading')
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
		}
	>()
	findCacheGarbageCollectInterval: NodeJS.Timeout // an interval
	
	constructor(name: Database['name'], host?: Database['host'], options?: {remoteOnly?: boolean, skipSetup?: boolean}) {
		const {remoteOnly, skipSetup = false} = options || {}
		this.name = name
		this.host = host
		if (host) {
			this._remote = new PouchDb(
				`${this.host}/${this.name}`,
				{
					skip_setup: skipSetup,
					fetch, // this allows for globalThis.fetch override for node
				})
		}
		else {
			this._db = new PouchDb(this.name)
		}
		if (remoteOnly) {
			this._db = this._remote
			this.connected = true
		}
		this.findCacheGarbageCollect()
	}
	static createId() {return nanoid()}
	async sync() {
		if (this.host) {
			await this._db
				.sync(this._remote, {retry: true})
				.catch(err => {console.log('Sync failed', err); throw err})
			this._db.sync(this._remote, {retry: true, live: true})
			this.connected = true
		}
	}
	// Closes connections and deletes local database. Doesn't delete replicated databases.
	destroy() {
		clearInterval(this.findCacheGarbageCollectInterval)
		this.connected = false
		this.findCache.clear()
		return this._db.destroy()
	}
	// Closes connections and frees memory. Doesn't delete local IndexedDB if exists.
	close() {return this._db.close()}
	// Gets record(s) from the database and converts date strings to dates
	async get<T extends IStandardFields>(id: string): Promise<T>
	async get<T extends IStandardFields>(ids: string[]): Promise<T[]>
	async get<T extends IStandardFields>(idOrIds: string | string[]): Promise<any> {
		const getter = (id: string) => this._db
			.get<T>(id, {})
			.then(mapDateFields)
			.catch(err => {throw err.status === 404 ? new NotFoundError(id) : err})
		if (Array.isArray(idOrIds)) {
			// The format for bulkGet is really strange, so just do brute force
			const res = await Promise.all(idOrIds.map(getter))
			return res
		}
		else {
			const res = await getter(idOrIds)
			return res
		}
	}
	async set<T extends IStandardFieldsCreate>(doc: T): Promise<T & IStandardFields> {
		const now = new Date()
		const doc2 = {
			createdAt: now,
			...Object.rmUndefAttrs(doc) as T,
			version: doc.version ? doc.version+1 : 0,
			_id: doc._id || Database.createId(),
			updatedAt: now
		}
		const res = await this._db
			.put(doc2, {})
			.then(idAndRev => ({...doc2, _rev: idAndRev.rev}))
		return res
	}
	async setMany<T extends IStandardFieldsCreate>(docs: T[]) {
		const now = new Date()
		const docs2 = docs.map(doc => {
			if (!doc._id) doc._id = Database.createId()
			if (!doc.createdAt) doc.createdAt = now
			doc.updatedAt = now
		})
		const res = await this._db.bulkDocs<any>(docs2, {})
			.then((idAndRevs)  => {
				const errors = idAndRevs
					.filter(idAndRev => 'error' in idAndRev)
					.map((idAndRev, i) => ({error: idAndRev, doc: docs2[i]}))
				if (errors.length)
					throw {...new Error('Put Errors'), errors}
				return idAndRevs
			})
		return res
	}
	/**
	 * A smart find feature that:
	 *   1. Detects and de-dup simultaneous duplicate queries (race queries)
	 *   2. Sets a cach that can be accessed externally for hooks
	 *   3. Uses db.get for simple getbyid queries
	 */
	async find<T extends IStandardFields>(props: IFindProps<T>): Promise<T[]> {
		const key = JSON.stringify(props)
		const cached = {
			fetching: false,
			fetchP: undefined,
			value: undefined,
			error: undefined,
			time: Date.now(),
			...this.findCache.get(key)
		}

		// if (props.selector?._id) {
		// 	// console.log('Find:', key)
		// 	if (cached.fetching) console.log('Find: hit')
		// 	else console.log('Find: miss', JSON.stringify(cached))
		// }

		if (cached.fetching) return cached.fetchP as any
		cached.fetching = true

		// If simple get by id(s), prefer this.get
		if (
			(
				typeof props.selector?._id === 'string'
				|| props.selector?._id?.$in
			)
			// ...and there aren't other modifiers
			&& props.selector._keys().minusF(['_id', 'type']).length === 0
			&& !props.sort && !props.fields && !props.skip
		) {
			if (typeof props.selector?._id === 'string')
				cached.fetchP = this.get<T>(props.selector._id)
					.then(doc => {
						if (doc.deletedAt) throw new NotFoundError(props.selector!._id as string)
						return {docs: [doc]}
					})
			else
				cached.fetchP = this.get<T>(props.selector._id.$in as string[])
					.then(docs => ({docs: docs.filter(d => !d.deletedAt)}))
		}
		// Else do full search
		else {
			const propsMapped = Object.copy({selector: {}, ...props as any})
			if (!propsMapped.selector.deletedAt)
				propsMapped.selector.deletedAt = {$exists: false}
			cached.fetchP = this._db
				.find(propsMapped)
				.then(res => {
					res.docs = res.docs.map(mapDateFields)
					return res
				})
		}

		cached.fetchP
			.then(res => {
				const cached = this.findCache.get(key)!
				this.findCache.set(key, {
					...cached,
					fetching: false,
					value: res.docs,
					error: undefined,
					time: Date.now()
				})
			})
			.catch(err => {
				const cached = this.findCache.get(key)!
				this.findCache.set(key, {
					...cached,
					fetching: false,
					value: undefined,
					error: err as Error || new Error('Unknown error'),
					time: Date.now()
				})
			})

		this.findCache.set(key, cached)
		const res = cached.fetchP.then(res => res.docs)
		return res
	}
	async findOne<T extends IStandardFields>(props: IFindProps<T>): Promise<T> {
		const res = this.find({...props, limit: 1}).then(docs => docs?.[0] ?? throwNotFoundError())
		return res
	}
	async delete<T extends IStandardFields>(doc: T): Promise<T> {
		const now = new Date()
		const doc2 = {
			...doc,
			updatedAt: now,
			deletedAt: now,
		}
		const res = this._db.put<T>(doc2, {})
			.then(idAndRev => ({...doc2, _rev: idAndRev.rev}))
		return res
	}
	async deletePermanent(doc: {_id: string, _rev: string}) {
		const res = new Promise<any>((resolve, reject) => {
			this._db.remove(doc, {}, (err, res) => {
				if (err) return reject(new Error('Error permanent delete'))
				resolve(null)
			})
		})
		return res
	}
	subscribe(ids: string[], callback: (change: any) => void) {
		const handle = this._db.changes({
			since: 'now',
			live: true,
			include_docs: true,
			doc_ids: ids,
		})
			.on('change', ({doc}) => callback(mapDateFields(doc)))
			.on('complete', info => {
				console.log(`changes(${ids}) was canceled`)
			})
			.on('error', (err) => {
				console.log(err)
			})
		return handle
	}
	async indexModels(models: any[]) {
		const res = Promise.all([
			this._db.createIndex({index: {fields: ['type']}}),
			...models.map(model => 
				this._db.createIndex({index: {fields: model.indexes, name: model.type}})
			)
		])
		return res
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

function mapDateFields(obj: any) {
	for (const key in obj)
		if (key.endsWith('At')) {
			try {
				obj[key] = new Date(obj[key])
			} catch(e) {
				if (e instanceof Error) {
					(e as any).orig = e
					e.message = `Value of ${obj._id}:${key} is not a date string.`
				}
				throw e
			}
		}
	return obj
}
export interface IStandardFieldsCreate {
	_id?: string
	type: string
	createdAt?: Date
	updatedAt?: Date
	deletedAt?: Date
	version: number
}

export interface IStandardFields {
	_id: string
	_rev: string
	// _revs_info is included if option {revs_info: true} was passed to the get() call
	_revs_info?: {rev: string, status: 'available' | 'compacted' | 'not compacted' | 'missing'}[] | undefined
	_revisions?: {ids: string[], start: number} | undefined
	_attachments?: {[attachmentId: string]: IAttachment} | undefined
	_conflicts?: string[] | undefined
	type: string
	createdAt: Date
	updatedAt: Date
	deletedAt?: Date
	version: number
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
	// selector?: Partial<P> | Partial<Record<keyof P, Partial<Record<ISelectorFilter, any>>>>
	selector?: ISelector<P>
	fields?: (keyof P)[]
	sort?: [Partial<Record<keyof P, 'asc' | 'desc'>>]
	limit?: number
	skip?: number
	useIndex?: string
}

type ISelector<P extends Record<string, any>> = 
	Partial<P> 
	| {
		[KEY in keyof P]?: Partial<{
			// $lt Match fields “less than” this one.
			$lt?: P[KEY],
			// $gt Match fields “greater than” this one.
			$gt?: P[KEY],
			// $lte Match fields “less than or equal to” this one.
			$lte?: P[KEY],
			// $gte Match fields “greater than or equal to” this one.
			$gte?: P[KEY],
			// $eq Match fields equal to this one.
			$eq?: P[KEY],
			// $ne Match fields not equal to this one.
			$ne?: P[KEY],
			// $exists True if the field should exist, false otherwise.
			$exists?: boolean,
			// $type One of: “null”, “boolean”, “number”, “string”, “array”, or “object”.
			$type?: 'null' | 'boolean' | 'number' | 'string' | 'array' | 'object',
			// $in The document field must exist in the list provided.
			$in?: P[KEY][],
			// $and Matches if all the selectors in the array match.
			$and?: ISelector<P>[],
			// $nin The document field must not exist in the list provided.
			$nin?: P[KEY][],
			// $all Matches an array value if it contains all the elements of the argument array.
			$all?: any,
			// $size Special condition to match the length of an array field in a document.
			$size?: number,
			// $or Matches if any of the selectors in the array match. All selectors must use the same index.
			$or?: ISelector<P>[],
			// $nor Matches if none of the selectors in the array match.
			$nor?: ISelector<P>[],
			// $not Matches if the given selector does not match.
			$not?: ISelector<P>,
			// $mod Matches documents where (field % Divisor == Remainder) is true, and only when the document field is an integer.
			$mod?: number,
			// $regex A regular expression pattern to match against the document field.
			$regex?: string,
			// $elemMatch Matches all documents that contain an array field with at least one element that matches all the specified query criteria.
			$elemMatch?: any,
		}>
	}
