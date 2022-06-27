import {assertValid, assertValidSet} from '#src/lib/validation'

import {Collection, Database, ISelector, Model, createModelHooks} from '../lib'
import type {IStandardFields} from '../lib'
import type {User, Users} from './Users'

export type ITenantPersonExtra = {
  userId: string
  tenantId: string
  role: TenantPersonRoleEnum
}
export interface ITenantPerson extends IStandardFields, ITenantPersonExtra {}
export interface ITenantPersonCreate extends Partial<IStandardFields>, ITenantPersonExtra {}

const db = new Database({name: 'tenantPersons'})

export class TenantPerson extends Model<ITenantPersonExtra> {
  db = db

  userId: ITenantPersonExtra['userId']
  tenantId: ITenantPersonExtra['tenantId']
  role: ITenantPersonExtra['role']

  constructor(data: ITenantPersonCreate) {
    super(data)
    Object.assign(this, data)
  }

  async validate() {
    return assertValidSet<IStandardFields & ITenantPersonExtra>(this.values, {
      ...this.baseValidations(),
      userId: assertValid('userId', this.userId, ['isRequired', 'isString', 'isNotEmpty']),
      tenantId: assertValid('userId', this.userId, ['isRequired', 'isString', 'isNotEmpty']),
      role: assertValid('role', this.role, ['isRequired'], {
        isOneOfSet: TenantPersonRoleSet,
      }),
    })
  }
}

class TenantPersonCollection extends Collection<TenantPerson, ITenantPersonCreate> {
  db = db
  model = TenantPerson

  async connect({currentUser}: {currentUser: User}) {
    // const selector: ISelector<ITenantPerson> = {
    //   $or: [
    //     {
    //       userId: {
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
export const TenantPersons = new TenantPersonCollection()

export const [
  useTenantPerson,
  useTenantPersons,
  useTenantPersonCount,
  useTenantPersonS,
  useTenantPersonsS,
  useTenantPersonCountS,
] = createModelHooks<TenantPerson>(TenantPersons)

export enum TenantPersonRoleEnum {
  ADMIN = '_admin',
}
const TenantPersonRoleSet = new Set(Enum.getEnumValues(TenantPersonRoleEnum))

export const TenantPersonExampleCreateFields: ITenantPersonCreate = {
  userId: '1234',
  tenantId: '5678',
  role: TenantPersonRoleEnum.ADMIN,
}

export const TenantPersonExampleFields: ITenantPerson = {
  ...Model.mockStandardFields,
  ...TenantPersonExampleCreateFields,
}

export const TenantPersonExample = new TenantPerson(TenantPersonExampleFields)
const TenantPersonFieldsEnum = Enum.getEnumFromClassInstance(TenantPersonExample)
