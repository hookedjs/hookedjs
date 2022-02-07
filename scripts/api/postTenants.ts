/**
 * Creates a new random user by posting to the api
 * 
 * Usage:
 * 1. Start the stack: `pnpm dev`
 * 2. Run this script `npx ts-node -P tsconfig.node.json scripts/api/postTenants.ts`
 */
import '../../src/lib/polyfills/node'

import config from '../../src/api/lib/config.node'
// import type { PasswordRequestProps } from '../../src/pouch'

main()

async function main() {
	const props: any = {
		name: 'Acme, Inc',
	}
	window.document.cookie = document.cookie = 'AuthSession=c2FsbHlmaWVsZHNAaG9va2VkanMub3JnOjYyMDA5MEUyOt7yDhWCdj3xh7mJIg_0Sr_j3KQC'
		
	const res = await fetch(
		`${config.gateway}/api/tenants`,
		{
			method: 'POST',
			body: JSON.stringify(props),
		}
	).then(res => res.json())
	console.log(res)
}
