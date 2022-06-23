import {ValueError, assertValid, isDefined, isDefinedAndNotNull} from '#src/lib/validation'

import type {Database, IStandardFields} from './Database'

export abstract class Model<ExtraFields extends Record<string, any>> {
  abstract db: Database

  _id: IStandardFields['_id']
  _rev: IStandardFields['_rev']
  // _revs_info is included if option {revs_info: true} was passed to the get() call
  _revs_info?: IStandardFields['_revs_info']
  _revisions?: IStandardFields['_revisions']
  _attachments?: IStandardFields['_attachments']
  _conflicts?: IStandardFields['_conflicts']
  createdAt: IStandardFields['createdAt']
  updatedAt: IStandardFields['updatedAt']
  deletedAt?: IStandardFields['deletedAt']
  version: IStandardFields['version']

  constructor(data: Partial<IStandardFields> & ExtraFields) {
    const now = new Date()
    Object.assign(
      this,
      {
        _id: data._id || String.uid(),
        createdAt: now,
        updatedAt: now,
        version: 0,
      },
      data,
    )
    this.valuesClean = this.values
  }

  get values() {
    const sanitized = Object.rmUndefAttrs(
      Object.omit(this, ['db', 'values', 'valuesClean', 'isClean', 'isDirty']),
    ) as IStandardFields & ExtraFields
    return sanitized
  }
  valuesClean: IStandardFields & ExtraFields
  get isClean() {
    return Object.isEqual(this.values, this.valuesClean)
  }
  get isDirty() {
    return !this.isClean
  }

  async refresh() {
    const _id = this._id
    for (const key of Object.keys(this.values)) {
      delete this[key as keyof this]
    }
    return Object.assign(this, await this.db.get(_id))
  }
  async save() {
    Object.rmUndefAttrs(this, true)
    if (this.isClean) return this
    await this.validate()
    Object.assign(this, await this.db.set(this.values))
    this.valuesClean = this.values
    return this
  }
  async delete() {
    return Object.assign(this, await this.db.delete(this.values))
  }
  async deletePermanent() {
    await this.db.deletePermanent(this.values)
  }
  subscribe(callback: (doc: Model<any> & ExtraFields) => any) {
    return this.db.subscribe([this._id], doc => {
      callback(Object.assign(this, doc) as any)
    })
  }

  async validate() {
    throw new Error('validate() must be implemented by subclass')
  }
  baseValidations() {
    return {
      _rev:
        isDefinedAndNotNull(this._rev) &&
        assertValid('_rev', this._rev, ['isRequired', 'isString'], {
          isLongerThan: 25,
          isShorterThan: 60,
        }),
      _revs_info: false,
      _revisions: false,
      _attachments: false,
      _conflicts: false,
      _id: assertValid('_id', this._id, ['isRequired', 'isString', 'isNotEmpty']),
      createdAt: isDefined(this.createdAt) && assertValid('createdAt', this.createdAt, ['isDate']),
      updatedAt: isDefined(this.updatedAt) && assertValid('updatedAt', this.updatedAt, ['isDate']),
      deletedAt: isDefined(this.deletedAt) && assertValid('deletedAt', this.deletedAt, ['isDate']),
      version: isDefined(this.version) && assertValid('version', this.version, ['isNumber']),
    } as const
  }

  async isFieldUnique(fieldName: keyof this) {
    const existing = await this.db.findOne<any>({selector: {[fieldName]: this[fieldName]}}).catch(() => null)
    const isUnique = !existing || existing._id === this._id
    return isUnique
  }
  async validateFieldIsUnique(fieldName: keyof this, errorMessage?: string) {
    return typeof fieldName !== 'string' || (await this.isFieldUnique(fieldName))
      ? false
      : new ValueError(fieldName, errorMessage || `${fieldName} is invalid`)
  }

  static mockStandardFields: IStandardFields = {
    _id: '72ff88753a64d9bb2cd014d7f803573b',
    _rev: '72ff88753a64d9bb2cd014d7f803573b',
    _revs_info: undefined,
    _revisions: undefined,
    _attachments: undefined,
    _conflicts: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: undefined,
    version: 0,
  }
}

export default Model
