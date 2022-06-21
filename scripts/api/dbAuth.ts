/**
 * Creates a new random user by posting to the api
 *
 * Usage:
 * 1. Start the stack: `pnpm dev`
 * 2. Run ./authRegister or ./authPasswordRequest to get a passwordTmp
 * 2. Run this script `npx ts-node -P tsconfig.node.json scripts/api/authLogin.ts`
 */
import '../../src/lib/polyfills/node'

import {LoginProps} from '../../src/pouch'

// import config from '../../src/api/lib/config.node'

main()

async function main() {
  const props: LoginProps = {
    name: 'b@b.com',
    password: 'Password8',
  }

  const res = await fetch(`http://127.0.0.1:5984/_session`, {
    method: 'POST',
    body: JSON.stringify(props),
  })
  console.log({setCookie: res.headers.get('set-cookie')})
}
