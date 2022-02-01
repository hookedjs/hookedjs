import { AuthUsers } from '#src/pouch/databases'

import config from '../lib/config.node'

export default async function authorizationPlugin(app: FastifyInstance, options: FastifyOptions) {
	app.addHook('onRequest', async function setAuthHeaders(req, reply) {
		if (req.url.startsWith('_session')) {
			reply.headers({'cache-control': 'no-store, max-age=0'})
			// await createConnection()
		}
	})
	// app.addHook('onRequest', async function setAuthContext(req, reply) {
	// 	try {await req.jwtVerify()}
	// 	catch (err) {req.user = { id: '', roles: [], createdAt: 0 }}
	// })

	app.post('/api/_session', async function authRegisterEndpoint(req, reply) {
		// If user doesn't exist, create it
		// If user is banned, throw error
		// If user is unconfirmed, throw error
		// If user is confirmed, return response


		// const props = {
		// 	// ...new RegisterProps(req.body),
		// 	roles: ['_tenant']
		// }
		// const user = await AuthUsers.get('org.couchdb.user:sallyfields@hookedjs.org')
		// TODO:
		// 1. create user or return 401
		const res = await fetch(
			config.dbUrl + '/_session',
			{
				method: 'POST',
				body: JSON.stringify(req.body)
			}
		)
		const user = await res.json()
		// 2. enhance user profile with more fields?
		// 2. create user/tenant db?
		// 3. Send email confirmation?
		// @ts-ignore
		// const user = await AuthUsers.get(props.name)
		reply.send({data: user})
	})

	app.get('/api/_session', async function getAuthStatusHandler(req, reply) {
		// TODO:
		// 1. get user
		// 2. check user status.
		reply
			.headers({'cache-control': 'no-store, max-age=0'})
			.send(data)
	})
	// app.delete('/api/_session', async function deleteAuthHandler(req, reply) {
	// 	const data = {}
	// 	reply
	// 		.headers({'cache-control': 'no-store, max-age=0'})
	// 		.send(data)
	// })
}

