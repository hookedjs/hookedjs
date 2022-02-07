import '../../src/lib/polyfills/node'
import '../../src/api/lib/pouch/init'

import casual from 'casual'

import config from '../../src/api/lib/config.node'
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
	const user = await AuthUsers.createOne({
		name: 'sallyfields@hookedjs.org',
		// name: casual.email.toLowerCase(),
		password: config.dbPass,
		roles: [],
		status: AuthUserStatusEnum.ACTIVE,
		// givenName: casual.first_name,
		givenName: 'Sally',
		// surname: casual.last_name,
		surname: 'Fields',
		tenants: [],
		defaultTenantId: '',
	})
		.catch(e => {
			console.log(e)
			console.log(e.context)
			process.exit(1)
		})

	console.log({user: user.values})

	return user
}
