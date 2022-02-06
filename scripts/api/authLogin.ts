/**
 * Creates a new random user by posting to the api
 * 
 * Usage:
 * 1. Start the stack: `pnpm dev`
 * 2. Run ./authRegister or ./authPasswordRequest to get a passwordTmp
 * 2. Run this script `npx ts-node -P tsconfig.node.json scripts/api/authLogin.ts`
 */
import '../../src/lib/polyfills/node'

import {inspect} from 'util'

import config from '../../src/api/lib/config.node'
import type { LoginProps } from '../../src/pouch'

main()

async function main() {
	const props: LoginProps = {
		name: 'zoey.blanda@yahoo.com',
		password: '68213396',
	}
		
	const res = await post(`${config.gateway}/api/login`, props)
	logDeep(res)
}

async function post(url: string, body: any) {
	const f = await fetch(url, {
		method: 'POST',
		body: JSON.stringify(body),
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