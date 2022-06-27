import {config} from '#src/lib/config'
import {useMount, useState} from '#src/lib/hooks'
import PouchDb from 'pouchdb'
import type {ComponentChildren} from 'preact'

import * as dbs from '../databases'

/**
 * Does not render children until auth has settled.
 */
export function DbProvider({children}: {children: ComponentChildren}) {
  const [isLoading, setIsLoading] = useState(true)
  useMount(watchLoading)
  return isLoading ? null : (children as any)

  async function watchLoading() {
    await connectDatabases()
    setIsLoading(false)
  }
}

export async function connectDatabases() {
  const currentUser = await dbs.Users.getCurrent()
  if (!currentUser) return
  await dbs.Users.connect({currentUser})
  await dbs.TenantPersons.connect({currentUser})
  await dbs.Tenants.connect({currentUser})
}

/**
 * Creates the databases if they don't exist
 */
export async function createDatabases() {
  await initDb(dbs.Users.db.name)
  await initDb(dbs.TenantPersons.db.name)
  await initDb(dbs.Tenants.db.name)

  async function initDb(dbName: string) {
    const res = await fetch(`${config.db}/${dbName}`, {
      method: 'PUT',
    })
    if (res.status === 412) {
      // No-op -- database already exists
      return
    }
    if (!res.ok) {
      throw new Error(`Unexpected error creating database db: ${config.db}/${dbName}:${res.status}`)
    }
  }

  async function indexModels() {
    // Users.db.handle.createIndex({
    //   index: {fields: [UserFieldsEnum.], name: model.type},
    // })
    // Tenants.db.handle.createIndex({
    //   index: {fields: [UserFieldsEnum.], name: model.type},
    // })
  }
}

export async function resetDatabases() {
  dbs.Users.current = undefined
  await dbs.Users.db.destroy()
  await dbs.TenantPersons.db.destroy()
  await dbs.Tenants.db.destroy()
}
