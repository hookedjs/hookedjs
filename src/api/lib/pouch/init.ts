import {connectDatabases, createDatabases} from '#src/pouch'

import config from '../../lib/config.node'

export const initP = init()

async function init() {
  await cookieAuth(config.dbUser, config.dbPass)
  await createDatabases()
  await connectDatabases()
}

async function cookieAuth(username: string, password: string) {
  const res = await fetch(`${config.dbUrl}/_session`, {
    method: 'POST',
    body: JSON.stringify({name: username, password}),
  })
  if (!res.ok) throw new Error(`Could not login: ${res.status}`)
  const json = await res.json()
  localStorage.setItem('auth', JSON.stringify(json))
  const cookieRaw = res.headers.get('set-cookie')
  const cookie = cookieRaw ? cookieRaw.split(';')[0] : ''
  window.document.cookie = document.cookie = `${cookie} ${document.cookie}`
  return json as unknown as {ok: boolean; name: string; roles: string[]}
}
