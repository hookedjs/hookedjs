import {useMount, useState} from '#src/lib/hooks'
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
    await initDatabases()
    setIsLoading(false)
  }
}

export async function initDatabases() {
  const currentUser = await dbs.Users.getCurrent()
  if (!currentUser) return
  await dbs.Users.connect()
  await dbs.TenantPersons.connect({currentUser})
  await dbs.Tenants.connect({currentUser})
}

export async function resetDatabases() {
  await dbs.Users.db.destroy()
  dbs.Users.current = undefined
  await dbs.TenantPersons.db.destroy()
  await dbs.Tenants.db.destroy()
}
