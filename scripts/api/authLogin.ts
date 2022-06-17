/**
 * Creates a new random user by posting to the api
 *
 * Usage:
 * 1. Start the stack: `pnpm dev`
 * 2. Run ./authRegister or ./authPasswordRequest to get a passwordTmp
 * 2. Run this script `npx ts-node -P tsconfig.node.json scripts/api/authLogin.ts`
 */
import config from '../../src/api/lib/config.node'
import '../../src/lib/polyfills/node'
import type {LoginProps} from '../../src/pouch'

main()

async function main() {
  const props: LoginProps = {
    name: 'sallyfields@hookedjs.org',
    password: '52243012',
    // name: 'admin@hookedjs.org',
    // password: 'Password8',
  }

  const res = await fetch(`${config.gateway}/api/login`, {
    method: 'POST',
    body: JSON.stringify(props),
  })
  console.log({setCookie: res.headers.get('set-cookie')})
}
