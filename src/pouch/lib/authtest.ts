// import {tenantDb, TenantPerson, userDb,UserProfile } from '../databases'
// import { cookieAuth, login } from './auth'

// export default async function test() {
// 	await login('admin', 'password')
// 	// const p = new Profile({name: 'Susie', age: 35, defaultTenant: 'tenantdb-admin'})
// 	// p._db = userDb.handle
// 	// await p.save()
// 	// 	.catch(e => console.dir(e))
// 	// const p2 = new Person({name: 'Susie', age: 35})
// 	// p2._db = tenantDb.handle
// 	// await p2.save()
// 	// 	.catch(e => console.dir(e))
// }
// test()

// export async function createUser(username: string, password: string) {
// 	const auth = await cookieAuth('admin', 'password')
// 		.catch(e => {console.dir(e); throw e})
// 	// TODO: Handle if auth.roles.includes('_admin')
// 	userDb.initUserDb(`userdb-${username}`)
// 	tenantDb.init(`tenant-${username}`)
// 	const p = new UserProfile({name: 'Susie', age: 35, defaultTenant: 'admin-tenant'})
// 	p.save()
// 	const p2 = new TenantPerson({name: 'Susie', age: 35})
// 	p2.save()
// }
// createUser('admin', 'password')