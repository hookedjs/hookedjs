import {waitForOnline} from '#src/lib/network'
import {NotFoundError, throwNotFoundError} from '#src/lib/validation'
import PouchDb from 'pouchdb'
import FindPlugin from 'pouchdb-find'

import type {User} from '../databases'

PouchDb.plugin(FindPlugin)

export class Database {
  ready = false
  connected = false
  handle = new PouchDb('loading')
  host = 'https://localhost:3000/db'
  name = 'loading'
  remoteHandle = new PouchDb('loading')
  remoteOnly = false
  selector: ISelector<any> | undefined = undefined
  filter: string | undefined = undefined
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

  constructor(props: Pick<Database, 'name'> & Partial<Pick<Database, 'host' | 'remoteOnly'>>) {
    Object.assign(this, props)
    this.reset()
  }
  reset = () => {
    if (this.findCacheGarbageCollectInterval) clearInterval(this.findCacheGarbageCollectInterval)
    this.findCache.clear()
    this.connected = false
    this.ready = false
    this.remoteHandle = new PouchDb(`${this.host}/${this.name}`, {
      skip_setup: true,
      fetch, // this allows for globalThis.fetch override for node
    })
    if (this.remoteOnly) {
      this.handle = this.remoteHandle
      this.connected = this.ready = true
    } else {
      this.handle = new PouchDb(this.name)
    }
    this.findCacheGarbageCollect()
  }
  connect = async ({currentUser}: {currentUser: User}) => {
    if (this.ready) {
      return
    }
    // Admins should always be remote-only
    if (currentUser.isAdmin) {
      this.handle = this.remoteHandle
      this.connected = this.ready = this.remoteOnly = true
      return
    }
    const connectP = waitForOnline().then(async () => {
      await this.handle
        .sync(this.remoteHandle, {filter: this.filter, retry: true, selector: this.selector})
        .catch(err => {
          console.log('Sync failed', err)
          throw err
        })
      this.handle.sync(this.remoteHandle, {retry: true, live: true})
      this.connected = true
    })
    // If local database is uninitialized, wait for connectP to complete
    const info = await this.handle.info()
    if (info.update_seq == 0) {
      await connectP
    }
    this.ready = true
  }
  assertReady = () => {
    if (!this.ready) {
      throw new DatabaseLoadingError()
    }
  }
  // Closes connections and deletes local database. Doesn't delete remote database.
  destroy = async () => {
    if (this.remoteOnly) {
      return this.close()
    }
    await this.handle.destroy()
    this.reset()
  }
  // Closes connections and frees memory. Doesn't delete local IndexedDB if exists.
  close = async () => {
    await this.handle.close()
    this.reset()
  }
  // Get a record from the database and converts date strings to dates
  async get<T extends IStandardFields>(id: string): Promise<T> {
    this.assertReady()
    const res = await this.handle
      .get<T>(id, {})
      .then(mapDateFields)
      .then(doc => {
        this.cacheDoc(doc)
        return doc
      })
      .catch(err => {
        throw err.status === 404 ? new NotFoundError(id) : err
      })
    return res
  }
  // Gets records from the database and converts date strings to dates
  async getMany<T extends IStandardFields>(ids: string[]): Promise<T[]> {
    this.assertReady()
    // The format for bulkGet is really strange, so just use find
    const res = await this.find({selector: {_id: {$in: ids}}})
    return res as T[]
  }
  async set<T extends IStandardFieldsCreate>(doc: T): Promise<T & IStandardFields> {
    this.assertReady()
    const now = new Date()
    const doc2 = {
      createdAt: now,
      ...(Object.rmUndefAttrs(doc) as T),
      version: doc.version ? doc.version + 1 : 0,
      _id: doc._id || String.uid(),
      updatedAt: now,
    }
    const res = await this.handle.put(doc2, {}).then(idAndRev => ({...doc2, _rev: idAndRev.rev}))
    return res
  }
  async setMany<T extends IStandardFieldsCreate>(docs: T[]) {
    this.assertReady()
    const now = new Date()
    const docs2 = docs.map(doc => {
      if (!doc._id) doc._id = String.uid()
      if (!doc.createdAt) doc.createdAt = now
      doc.updatedAt = now
    })
    const res = await this.handle.bulkDocs<any>(docs2, {}).then(idAndRevs => {
      const errors = idAndRevs
        .filter(idAndRev => 'error' in idAndRev)
        .map((idAndRev, i) => ({error: idAndRev, doc: docs2[i]}))
      if (errors.length) throw {...new Error('Put Errors'), errors}
      return idAndRevs
    })
    return res
  }
  /**
   * A smart find feature that:
   *   1. Detects and de-dup simultaneous duplicate queries (race queries)
   *   2. Sets a cach that can be accessed externally for hooks (stale while refresh)
   *   3. Uses db.get for simple getbyid queries
   */
  async find<T extends IStandardFields>(props: IFindProps<T>): Promise<T[]> {
    const key = JSON.stringify(props)
    const cache = {
      fetching: false,
      fetchP: undefined,
      value: undefined,
      error: undefined,
      time: Date.now(),
      ...this.findCache.get(key),
    }

    // if (props.selector?._id) {
    // 	// console.log('Find:', key)
    // 	if (cached.fetching) console.log('Find: hit')
    // 	else console.log('Find: miss', JSON.stringify(cached))
    // }

    if (cache.fetching) {
      return cache.fetchP as any
    }
    cache.fetching = true

    // If simple get by id, use this.get
    if (
      typeof props.selector?._id === 'string' &&
      // ...and there aren't other modifiers
      props.selector._keys().minusF(['_id', 'type']).length === 0 &&
      !props.sort &&
      !props.fields &&
      !props.skip
    ) {
      cache.fetchP = this.get<T>(props.selector._id).then(doc => {
        if (doc.deletedAt) throw new NotFoundError(props.selector!._id as string)
        return {docs: [doc]}
      })
    }
    // Else do full search
    else {
      const propsMapped = Object.copy({selector: {}, ...(props as any)})
      if (!propsMapped.selector.deletedAt) {
        propsMapped.selector.deletedAt = {$exists: false}
      }
      cache.fetchP = this.handle.find(propsMapped).then(res => {
        res.docs = res.docs.map(mapDateFields)
        return res
      })
    }

    cache.fetchP
      .then(res => {
        const previous = this.findCache.get(key)!
        this.findCache.set(key, {
          ...previous,
          fetching: false,
          value: res.docs,
          error: undefined,
          time: Date.now(),
        })
        res.docs.map(this.cacheDoc)
      })
      .catch(err => {
        const previous = this.findCache.get(key)!
        this.findCache.set(key, {
          ...previous,
          fetching: false,
          value: undefined,
          error: (err as Error) || new Error('Unknown error'),
          time: Date.now(),
        })
      })

    this.findCache.set(key, cache)
    const res = cache.fetchP.then(res => res.docs)
    return res
  }
  async findOne<T extends IStandardFields>(props: IFindProps<T>): Promise<T> {
    this.assertReady()
    const res = this.find({...props, limit: 1}).then(docs => docs?.[0] ?? throwNotFoundError())
    return res
  }
  async delete<T extends IStandardFields>(doc: T): Promise<T> {
    this.assertReady()
    const now = new Date()
    const doc2 = {
      ...doc,
      updatedAt: now,
      deletedAt: now,
    }
    const res = this.handle.put<T>(doc2, {}).then(idAndRev => ({...doc2, _rev: idAndRev.rev}))
    return res
  }
  deletePermanent = async (doc: {_id: string; _rev: string}) => {
    this.assertReady()
    const res = new Promise<any>((resolve, reject) => {
      this.handle.remove(doc, {}, (err, res) => {
        if (err) return reject(new Error('Error permanent delete'))
        resolve(null)
      })
    })
    return res
  }
  subscribe = (ids: string[], callback: (change: any) => void) => {
    this.assertReady()
    console.debug(`subscribe(${ids})`)

    // The _users database is banned from subscribing to changes, so we have to poll
    if (this.name === '_users') {
      const findProps: IFindProps<IStandardFields> = {selector: {_id: {$in: ids}}}
      const cacheKey = JSON.stringify(findProps)
      let previous = this.findCache.get(cacheKey)?.value.copy() as IStandardFields[]
      const interval = setInterval(async () => {
        const next = await this.find(findProps)
        previous?.forEach(doc => {
          let match = next.find(doc2 => doc2._id === doc._id)
          if (match && doc._rev !== match._rev) {
            match = mapDateFields(match)
            callback(match)
          }
        })
        previous = next
      }, 10000)
      return {
        cancel: () => {
          console.debug(`unsubscribe(${ids})`)
          clearInterval(interval)
        },
      }
    }

    const handle = this.handle
      .changes({
        since: 'now',
        live: true,
        include_docs: true,
        doc_ids: ids,
      })
      .on('change', ({doc}) => {
        doc = mapDateFields(doc)
        this.cacheDoc(doc)
        callback(doc)
      })
      .on('complete', info => {
        console.debug(`unsubscribe(${ids})`)
      })
      .on('error', err => {
        console.log(err)
      })
    return handle
  }

  cacheDoc = (doc: any) => {
    const findProps: IFindProps<IStandardFields> = {selector: {_id: {$in: [doc._id]}}}
    const cacheKey = JSON.stringify(findProps)
    const cacheNext = {
      time: Date.now(),
      fetching: false,
      value: [doc],
      error: undefined,
      fetchP: undefined,
    }
    this.findCache.set(cacheKey, cacheNext)
  }
  // async indexModels(models: any[]) {
  //   const res = Promise.all([
  //     this.handle.createIndex({index: {fields: ['type']}}),
  //     ...models.map(model =>
  //       this.handle.createIndex({
  //         index: {fields: model.indexes, name: model.type},
  //       }),
  //     ),
  //   ])
  //   return res
  // }
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

export const loadingDb = new Database({name: 'loading'})

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
      } catch (e) {
        if (e instanceof Error) {
          ;(e as any).orig = e
          e.message = `Value of ${obj._id}:${key} is not a date string.`
        }
        throw e
      }
    }
  return obj
}
export interface IStandardFieldsCreate {
  _id?: string
  createdAt?: Date
  updatedAt?: Date
  deletedAt?: Date
  version: number
}

export interface IStandardFields {
  _id: string
  _rev: string
  // _revs_info is included if option {revs_info: true} was passed to the get() call
  _revs_info?:
    | {
        rev: string
        status: 'available' | 'compacted' | 'not compacted' | 'missing'
      }[]
    | undefined
  _revisions?: {ids: string[]; start: number} | undefined
  _attachments?: {[attachmentId: string]: IAttachment} | undefined
  _conflicts?: string[] | undefined
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
  content_type: string

  /**
   * Database digest of the attachment
   */
  digest: string

  /**
   * Attachment is a stub
   */
  stub: true

  /**
   * Length of the attachment
   */
  length: number
}

/**
 * Full attachments are used to create new attachments or returned when the attachments option
 * is true.
 */
export interface IFullAttachment {
  /**
   * Mime type of the attachment
   */
  content_type: string

  /** MD5 hash, starts with "md5-" prefix; populated by PouchDB for new attachments */
  digest?: string | undefined

  /**
   * {string} if `binary` was `false`
   * {Blob|Buffer} if `binary` was `true`
   */
  data: string | Buffer
}

export type IAttachment = IStubAttachment | IFullAttachment

export interface IFindProps<P extends Record<string, any>> {
  selector?: ISelector<P>
  fields?: (keyof P)[]
  sort?: [Partial<Record<keyof P, 'asc' | 'desc'>>]
  limit?: number
  skip?: number
  useIndex?: string
}

export type ISelector<P extends Record<string, any>> =
  | Partial<P>
  | ({
      // $and Matches if all the selectors in the array match.
      $and?: ISelector<P>[]
      // $or Matches if any of the selectors in the array match. All selectors must use the same index.
      $or?: ISelector<P>[]
      // $nor Matches if none of the selectors in the array match.
      $nor?: ISelector<P>[]
    } & {
      [KEY in keyof P]?: {
        // $lt Match fields “less than” this one.
        $lt?: P[KEY]
        // $gt Match fields “greater than” this one.
        $gt?: P[KEY]
        // $lte Match fields “less than or equal to” this one.
        $lte?: P[KEY]
        // $gte Match fields “greater than or equal to” this one.
        $gte?: P[KEY]
        // $eq Match fields equal to this one.
        $eq?: P[KEY]
        // $ne Match fields not equal to this one.
        $ne?: P[KEY]
        // $exists True if the field should exist, false otherwise.
        $exists?: boolean
        // $type One of: “null”, “boolean”, “number”, “string”, “array”, or “object”.
        $type?: 'null' | 'boolean' | 'number' | 'string' | 'array' | 'object'
        // $in The document field must exist in the list provided.
        $in?: P[KEY][]
        // $and Matches if all the selectors in the array match.
        $and?: ISelector<P>[]
        // $nin The document field must not exist in the list provided.
        $nin?: P[KEY][]
        // $all Matches an array value if it contains all the elements of the argument array.
        $all?: any
        // $size Special condition to match the length of an array field in a document.
        $size?: number
        // $or Matches if any of the selectors in the array match. All selectors must use the same index.
        $or?: ISelector<P>[]
        // $nor Matches if none of the selectors in the array match.
        $nor?: ISelector<P>[]
        // $not Matches if the given selector does not match.
        $not?: ISelector<P>
        // $mod Matches documents where (field % Divisor == Remainder) is true, and only when the document field is an integer.
        $mod?: number
        // $regex A regular expression pattern to match against the document field.
        $regex?: string
        // $elemMatch Matches all documents that contain an array field with at least one element that matches all the specified query criteria.
        $elemMatch?: any
      }
    })
