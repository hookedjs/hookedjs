/**
 * Creates a new random user by posting to the api
 * 
 * Usage:
 * 1. Start the stack: `pnpm dev`
 * 2. Run this script `npx ts-node -P tsconfig.node.json scripts/api/authRegister.ts`
 */
import '../../src/lib/polyfills/node'

import casual from 'casual'
import {inspect} from 'util'

import config from '../../src/api/lib/config.node'
import type { RegisterProps } from '../../src/pouch'

main()

async function main() {
	const props: RegisterProps = {
		// name: casual.email.toLowerCase(),
		name: 'zoey.blanda@yahoo.com',
		givenName: casual.first_name,
		surname: casual.last_name,
		acceptedTerms: true,
	}
		
	const res = await post(`${config.gateway}/api/register`, props)
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