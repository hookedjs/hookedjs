import { AuthUsers } from '#src/pouch/databases'

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
		// @ts-ignore
		const user = await AuthUsers.get(props.name)
		reply.send({data: user})
	})

	// app.get('/api/_session', async function getAuthStatusHandler(req, reply) {
	// 	reply
	// 		.headers({'cache-control': 'no-store, max-age=0'})
	// 		.send(data)
	// })
	// app.delete('/api/_session', async function deleteAuthHandler(req, reply) {
	// 	const data = {}
	// 	reply
	// 		.headers({'cache-control': 'no-store, max-age=0'})
	// 		.send(data)
	// })
}

