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
  await dbs.Users.db.initRemoteDb()
  await dbs.TenantPersons.db.initRemoteDb()
  await dbs.Tenants.db.initRemoteDb()
}

export async function resetDatabases() {
  dbs.Users.current = undefined
  await dbs.Users.db.destroy()
  await dbs.TenantPersons.db.destroy()
  await dbs.Tenants.db.destroy()
}
