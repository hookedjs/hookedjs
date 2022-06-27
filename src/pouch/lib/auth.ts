import {config} from '#src/lib/config'
import {throwFormValidationErrorSet} from '#src/lib/validation'

import type {UserRoleEnum} from '../databases/Users'
import {connectDatabases, resetDatabases} from './DbProvider'

export interface Auth {
  ok: boolean
  name: string
  roles: UserRoleEnum[]
}

export async function login(username: string, password: string) {
  const auth = await cookieAuth(username, password).catch(e =>
    throwFormValidationErrorSet({username, password}, 'email and/or password invalid'),
  )
  localStorage.setItem('auth', JSON.stringify(auth))
  await connectDatabases()
  return auth
}

export async function logout() {
  await resetDatabases()
  await cookieClear()
  localStorage.removeItem('auth')
}

export function readAuth(): Auth {
  const auth = localStorage.getItem('auth')
  return auth ? JSON.parse(auth) : {}
}

export async function cookieAuth(username: string, password: string) {
  const res = await fetch(`${config.db}/_session`, {
    method: 'POST',
    body: JSON.stringify({name: username, password}),
    credentials: 'include',
    headers: {'Content-Type': 'application/json', Accept: 'application/json'},
  })
  if (!res.ok) throw new Error(`Could not login: ${res.status}`)
  const json = await res.json()
  return json as unknown as Auth
}

export async function cookieClear() {
  const res = await fetch(`${config.db}/_session`, {method: 'DELETE'})
  if (!res.ok) throw new Error(`Could not clear cookie: ${res.status}`)
}
