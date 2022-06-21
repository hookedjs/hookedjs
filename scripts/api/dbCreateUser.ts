/**
 * Creates a new random user by posting to the api
 *
 * Usage:
 * 1. Start the stack: `pnpm dev`
 * 2. Run this script `npx ts-node -P tsconfig.node.json scripts/api/authRegister.ts`
 */
import '../../src/lib/polyfills/node'

import {inspect} from 'util'

main()

async function main() {
  const props = {
    _id: 'org.couchdb.user:b@b.com',
    name: 'b@b.com',
    type: 'user',
    password: 'Password8',
    roles: [],
  }

  const res = await put(`http://127.0.0.1:5984/_users/org.couchdb.user:b@b.com`, props)
  logDeep(res)
}

async function put(url: string, body: any) {
  const f = await fetch(url, {
    method: 'PUT',
    body: JSON.stringify(body),
    headers: {
      cookie: 'AuthSession=YWRtaW46NjJCMjEzMTY6WHKZ_MsP72fTxVEokGdUP',
    },
  })
  const json = await f.json()
  return json
}

function logDeep(obj: any, additionalObjs: any[] = []) {
  console.log(dump(obj), ...additionalObjs.map(dump))
  function dump(_obj: any) {
    return inspect(_obj, {depth: null})
  }
}
