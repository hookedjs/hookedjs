import {useInterval, useLayoutEffectDeep, useState} from '#src/lib/hooks'
import {
  ValueError,
  assertAttrsWithin,
  assertValid,
  assertValidSet,
  isDefined,
  isDefinedAndNotNull,
} from '#src/lib/validation'
import {useAuthStore} from '#src/stores'

import {Collection, Database, Model, createModelHooks, readAuth} from '../lib'
import type {IStandardFields} from '../lib'

export type IUserExtra = {
  name: string
  type?: 'user'
  roles: UserRoleEnum[]
  password?: string
  password_scheme?: string
  iterations?: number
  derived_key?: string
  salt?: string
  passwordTmp?: string
  passwordTmpAt?: Date
  passwordTmpFailCount?: number
  bannedAt?: Date
  bannedReason?: string
  givenName: string
  surname: string
  status: UserStatusEnum
}
interface IUser extends IStandardFields, IUserExtra {}
interface IUserCreate extends Partial<IStandardFields>, IUserExtra {}

const db = new Database({name: '_users', remoteOnly: true})

export class User extends Model<IUserExtra> {
  db = db

  name: IUserExtra['name']
  type = 'user'
  password: IUserExtra['password']
  password_scheme: IUserExtra['password_scheme']
  iterations: IUserExtra['iterations']
  derived_key: IUserExtra['derived_key']
  salt: IUserExtra['salt']
  passwordTmp: IUserExtra['passwordTmp']
  passwordTmpAt: IUserExtra['passwordTmpAt']
  passwordTmpFailCount: IUserExtra['passwordTmpFailCount']
  bannedAt: IUserExtra['bannedAt']
  bannedReason: IUserExtra['bannedReason']
  givenName: IUserExtra['givenName']
  surname: IUserExtra['surname']
  roles: IUserExtra['roles']
  status: IUserExtra['status']

  get fullName() {
    return `${this.givenName} ${this.surname}`
  }

  get isAdmin() {
    return this.roles.includes(UserRoleEnum.ADMIN)
  }
  get isTenant() {
    return this.roles.excludes(UserRoleEnum.ADMIN)
  }

  constructor(data: IUserCreate) {
    super(data)
    Object.assign(this, data)
  }

  // Ensure password never hangs around
  async save() {
    // Ensure _id always matches name
    this._id = `org.couchdb.user:${this.name}`
    await super.save()
    // refresh to ensure password is replaced by derived_key,salt,iterations
    await this.refresh()
    return this
  }

  async validate() {
    return assertValidSet<IStandardFields & IUserExtra>(this.values, {
      ...this.baseValidations(),
      _id: assertValid(
        '_id',
        this._id,
        ['isRequired', 'isString'],
        {
          isEqual: {expected: `org.couchdb.user:${this.name}`},
        },
        [!!this.valuesClean._id && this.valuesClean._id !== this.values._id && new ValueError('_id cannot be changed')],
      ),
      name: assertValid('name', this.name, ['isRequired', 'isString', 'isTruthy', 'isEmail'], {}, [
        !!this.valuesClean._id && this.name !== this.valuesClean.name && new ValueError('email cannot be changed'),
      ]),
      type: assertValid('type', this.type, ['isRequired', 'isString'], {
        isEqual: {expected: 'user'},
      }),
      password:
        isDefinedAndNotNull(this.password) &&
        assertValid('password', this.password, ['isRequired', 'isString', 'isTruthy']),
      password_scheme: false,
      iterations: false,
      derived_key: false,
      salt: false,
      passwordTmp:
        isDefined(this.passwordTmp) && assertValid('passwordTmp', this.passwordTmp, ['isString', 'isTruthy']),
      passwordTmpAt: isDefined(this.passwordTmpAt) && assertValid('passwordTmpAt', this.passwordTmpAt, ['isDate']),
      passwordTmpFailCount:
        isDefined(this.passwordTmpFailCount) &&
        assertValid('passwordTmpFailCount', this.passwordTmpFailCount, ['isNumber']),
      givenName: assertValid('givenName', this.givenName, ['isRequired', 'isString'], {
        isLongerThan: 2,
        isShorterThan: 30,
      }),
      surname: assertValid('surname', this.surname, ['isRequired', 'isString'], {isLongerThan: 2, isShorterThan: 30}),
      status: assertValid('status', this.status, ['isRequired'], {
        isOneOfSet: UserStatusSet,
      }),
      bannedAt: isDefined(this.bannedAt) && assertValid('bannedAt', this.bannedAt, ['isDate']),
      bannedReason:
        isDefined(this.bannedReason) && assertValid('bannedReason', this.bannedReason, ['isString', 'isTruthy']),
      roles: assertValid('roles', this.roles, ['isRequired', 'isArray'], {
        arrayValuesAreOneOfSet: UserRoleSet,
      }),
    })
  }

  async ban(reason: IUserExtra['bannedReason']) {
    this.status = UserStatusEnum.BANNED
    this.bannedAt = new Date()
    this.bannedReason = reason
    await this.save()
  }
}

class UserCollection extends Collection<User, IUserCreate> {
  model = User
  db = db

  current: User | undefined = undefined
  getCurrentP: Promise<User> | undefined = undefined
  async getCurrent() {
    // De-dup multiple simultaneous calls to getCurrent
    if (this.getCurrentP) {
      return this.getCurrentP
    }
    if (this.current) {
      return this.current
    }
    const auth = readAuth()
    if (auth?.roles?.includes(UserRoleEnum.ADMIN)) {
      this.current = adminUserStub
    } else if (readAuth()?.name) {
      const name = readAuth().name
      this.getCurrentP = this.get(`org.couchdb.user:${name}`)
      this.current = await this.getCurrentP
    } else {
      this.current = undefined
    }
    this.getCurrentP = undefined
    return this.current
  }
}
export const Users = new UserCollection()

export const [useUser, useUsers, useUserCount, useUserS, useUsersS, useUserCountS] = createModelHooks<User>(Users)

export function useCurrentUser() {
  const [auth] = useAuthStore()
  const [user, setUser] = useState(Users.current || UserLoadingFields)
  useLayoutEffectDeep(refresh, [auth])
  useInterval(refresh, 60000)

  // Activate suspense if loading
  if (Users.getCurrentP) {
    throw Users.getCurrentP
  }
  return user

  function refresh() {
    Users.getCurrent().then(next => {
      setUser(next || UserLoadingFields)
    })
  }
}

export enum UserRoleEnum {
  ADMIN = '_admin',
}
// const UserRoleSet = new Set(Enum.getEnumValues(UserRoleEnum))
const UserRoleSet = new Set(Enum.getEnumValues(UserRoleEnum))

export enum UserStatusEnum {
  PENDING = 'pending',
  ACTIVE = 'active',
  BANNED = 'banned',
}
const UserStatusSet = new Set(Enum.getEnumValues(UserStatusEnum))

const UserExampleCreateFields: IUserCreate = {
  name: 'sallyfields@hookedjs.org',
  password: 'Password8',
  bannedAt: undefined,
  bannedReason: undefined,
  surname: 'Sally',
  givenName: 'Fields',
  roles: [],
  status: UserStatusEnum.ACTIVE,
}

const UserExampleFields: IUser = {
  ...Model.mockStandardFields,
  ...UserExampleCreateFields,
  password: undefined,
  password_scheme: 'pbkdf2',
  iterations: 10,
  derived_key: 'test',
  salt: 'test',
}

const UserLoadingFields: IUser & {fullName: string; isAdmin: boolean; isTenant: boolean} = {
  ...UserExampleFields,
  name: '',
  surname: '',
  givenName: '',
  fullName: '',
  isAdmin: false,
  isTenant: true,
}

export const UserExample = new User(UserExampleFields)
export const UserFieldsEnum = Enum.getEnumFromClassInstance(UserExample)

export class LoginProps {
  name = ''
  password = ''
  constructor(props: any) {
    assertAttrsWithin(props, this)
    assertValidSet<LoginProps>(props, {
      name: assertValid('name', props.name, ['isDefined', 'isString', 'isEmail']),
      password: assertValid('password', props.password, ['isDefined', 'isTruthy']),
    })
    props.name = props.name.toLowerCase()
    Object.assign(this, props)
  }
}
export const LoginPropsExample = new LoginProps(Object.pick(UserExampleCreateFields, ['name', 'password']))
export const LoginPropsEnum = Enum.getEnumFromClassInstance(LoginPropsExample)

export class PasswordRequestProps {
  name = ''
  constructor(props: any) {
    assertAttrsWithin(props, this)
    assertValidSet<PasswordRequestProps>(props, {
      name: assertValid('name', props.name, ['isDefined', 'isString', 'isEmail']),
    })
    props.name = props.name.toLowerCase()
    Object.assign(this, props)
  }
}
export const PasswordRequestPropsExample = new PasswordRequestProps(Object.pick(UserExampleCreateFields, ['name']))
export const PasswordRequestPropsEnum = Enum.getEnumFromClassInstance(PasswordRequestPropsExample)

export class RegisterProps {
  name = ''
  givenName = ''
  surname = ''
  acceptedTerms = false
  constructor(props: any) {
    assertAttrsWithin(props, this)
    assertValidSet<RegisterProps>(props, {
      name: assertValid('name', props.name, ['isDefined', 'isString', 'isEmail']),
      givenName: assertValid('givenName', props.givenName, ['isDefined', 'isString'], {
        isLongerThan: 2,
        isShorterThan: 30,
      }),
      surname: assertValid('surname', props.surname, ['isDefined', 'isString'], {isLongerThan: 2, isShorterThan: 30}),
      acceptedTerms: assertValid('acceptedTerms', props.acceptedTerms, ['isDefined', 'isBoolean', 'isTruthy']),
    })
    props.name = props.name.toLowerCase()
    Object.assign(this, props)
  }
}
export const RegisterPropsExample = new RegisterProps({
  ...Object.pick(UserExampleCreateFields, ['name', 'givenName', 'surname']),
  acceptedTerms: true,
})
export const RegisterPropsEnum = Enum.getEnumFromClassInstance(RegisterPropsExample)

const adminUserStub = new User({
  _id: 'admin',
  _rev: '',
  version: 0,
  name: 'admin@hookedjs.org',
  createdAt: new Date(),
  updatedAt: new Date(),
  roles: [UserRoleEnum.ADMIN],
  password: undefined,
  password_scheme: undefined,
  iterations: undefined,
  derived_key: undefined,
  salt: undefined,
  givenName: 'Admin',
  surname: 'Admin',
  status: UserStatusEnum.ACTIVE,
  bannedAt: undefined,
  bannedReason: undefined,
})
