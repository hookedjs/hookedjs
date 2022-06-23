import '../../src/lib/polyfills/node'

import casual from 'casual'

import config from '../../src/api/lib/config.node'
import '../../src/api/lib/pouch/init'
import {TenantPersons, UserStatusEnum, Users} from '../../src/pouch/databases'

sleep(1000).then(main)

async function main() {
  const user = await createUser()
  process.exit(0)
}

/*
async indexModels(models: any[]) {
    const res = Promise.all([
      this._db.createIndex({index: {fields: ['type']}}),
      ...models.map(model =>
        this._db.createIndex({
          index: {fields: model.indexes, name: model.type},
        }),
      ),
    ])
    return res
  }
  */

async function createUser() {
  const user = await Users.createOne({
    name: 'sallyfields@hookedjs.org',
    // name: casual.email.toLowerCase(),
    password: config.dbPass,
    roles: [],
    status: UserStatusEnum.ACTIVE,
    // givenName: casual.first_name,
    givenName: 'Sally',
    // surname: casual.last_name,
    surname: 'Fields',
  }).catch(e => {
    console.log(e)
    console.log(e.context)
    process.exit(1)
  })

  console.log({user: user.values})

  return user
}
