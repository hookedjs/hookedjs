import {assertValid, assertValidSet} from '#src/lib/validation'

import {Collection, Database, ISelector, Model, createModelHooks} from '../lib'
import type {IStandardFields} from '../lib'
import type {User, Users} from './Users'

export type ITenantExtra = {
  name: string
  status: TenantStatusEnum
}
export interface ITenant extends IStandardFields, ITenantExtra {}
export interface ITenantCreate extends Partial<IStandardFields>, ITenantExtra {}

const db = new Database({name: 'tenants'})

export class Tenant extends Model<ITenantExtra> {
  db = db

  name: ITenantExtra['name']
  status: ITenantExtra['status']

  constructor(data: ITenantCreate) {
    super(data)
    Object.assign(this, data)
  }

  async validate() {
    return assertValidSet<IStandardFields & ITenantExtra>(this.values, {
      ...this.baseValidations(),
      name: assertValid('name', this.name, ['isRequired', 'isString', 'isNotEmpty']),
      status: assertValid('status', this.status, ['isRequired'], {
        isOneOfSet: TenantStatusSet,
      }),
    })
  }
}

class TenantCollection extends Collection<Tenant, ITenantCreate> {
  db = db
  model = Tenant

  async connect({currentUser}: {currentUser: User}) {
    // TODO: Table Segmentation
    // const selector: ISelector<ITenant> = {
    //   $or: [
    //     {
    //       name: {
    //         $eq: currentUser?._id ?? 'NEVER',
    //       },
    //     },
    //     // {
    //     //   name: {
    //     //     $eq: 'Name1',
    //     //   }
    //     // }
    //   ]
    // }

    // this.db.selector = selector
    await this.db.connect({currentUser})
  }
}
export const Tenants = new TenantCollection()

export const [useTenant, useTenants, useTenantCount, useTenantS, useTenantsS, useTenantCountS] =
  createModelHooks<Tenant>(Tenants)

enum TenantRoleEnum {
  ADMIN = '_admin',
}
const TenantRoleSet = new Set(Enum.getEnumValues(TenantRoleEnum))

export enum TenantStatusEnum {
  PENDING = 'pending',
  ACTIVE = 'active',
  DISABLED = 'disabled',
}
const TenantStatusSet = new Set(Enum.getEnumValues(TenantStatusEnum))

export const TenantExampleCreateFields: ITenantCreate = {
  name: 'Acme, Inc.',
  status: TenantStatusEnum.ACTIVE,
}

export const TenantExampleFields: ITenant = {
  ...Model.mockStandardFields,
  ...TenantExampleCreateFields,
}

export const TenantExample = new Tenant(TenantExampleFields)
export const TenantFieldsEnum = Enum.getEnumFromClassInstance(TenantExample)
