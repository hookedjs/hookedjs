import '../../src/lib/polyfills/node'
import '../../src/api/lib/pouch/init'

import * as casual from 'casual'

import {
	AuthUsers,
	AuthUserStatusEnum,
} from '../../src/pouch/databases'

sleep(1000).then(main)

async function main() {
	await createUser()
	process.exit(0)
}

async function createUser() {
	// const name = casual.email.toLowerCase()
	const name = 'sallyfields@hookedjs3.org'
	const user = await AuthUsers.createOne({
		name,
		roles: [],
		password: 'Password8',
		status: AuthUserStatusEnum.ACTIVE,
		givenName: casual.first_name,
		surname: casual.last_name,
		tenants: [],
		defaultTenantId: '',
	})
		.catch(e => {
			console.log(e)
			console.log(e.context)
			process.exit(1)
		})

	await user.createTenant('Acme Incs.')

	console.log({user: user.values})

	return user
}
