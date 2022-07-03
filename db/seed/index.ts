import '../../src/lib/polyfills/node'

import casual from 'casual'

import config from '../../src/api/lib/config.node'
import '../../src/api/lib/pouch/init'
import {initP} from '../../src/api/lib/pouch/init'
import {
  TenantPersonRoleEnum,
  TenantPersons,
  TenantStatusEnum,
  Tenants,
  UserExample,
  UserStatusEnum,
  Users,
} from '../../src/pouch/databases'

main()

async function main() {
  await initP
  await createUser()
  process.exit(0)
}

async function createUser() {
  await (await Users.findOne().catch(() => {}))?.deletePermanent()
  const user = await Users.createOne({
    name: createUser.count === 0 ? UserExample.name : casual.email.toLowerCase(),
    password: config.dbPass,
    roles: [],
    status: UserStatusEnum.ACTIVE,
    givenName: createUser.count === 0 ? 'Sally' : casual.first_name,
    surname: createUser.count === 0 ? 'Fields' : casual.last_name,
  }).catch(logErrorAndExit)
  // console.log({user: user.values})

  const tenant = await Tenants.createOne({
    name: casual.company_name,
    status: TenantStatusEnum.ACTIVE,
  }).catch(logErrorAndExit)
  // console.log({tenant: tenant.values})

  await TenantPersons.createOne({
    tenantId: tenant._id,
    userId: user._id,
    role: TenantPersonRoleEnum.ADMIN,
  }).catch(logErrorAndExit)

  createUser.count++
  return user
}
createUser.count = 0

function logErrorAndExit(e: any): never {
  console.log(e)
  console.log(e.context)
  process.exit(1)
}
