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
  const res = await get(`http://127.0.0.1:5984/test/_all_docs?limit=21`)
  // const res = await get(`http://127.0.0.1:5984/test/_changes?filter=user/name`)
  // const res = await get(`http://127.0.0.1:5984/test/_design/d1/_view/new-view`)
  logDeep(res)
}

async function get(url: string) {
  const f = await fetch(url, {
    method: 'GET',
    headers: {
      cookie: 'AuthSession=YkBiLmNvbTo2MkIyMjQzMzrlURVpFdtvABepR_QH1SJ10xcemQ',
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
