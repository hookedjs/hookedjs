import { getManager } from 'typeorm'

import config from '../lib/config'
import createConnection from './createConnection'

export default async function dbPlugin(app: FastifyInstance, options: FastifyOptions) {
	// Connect to DB on API requests
	app.addHook('onRequest', async (req, reply) => {
		if (req.url.startsWith(config.apiPrefix)) {
			reply.headers({'cache-control': 'no-store, max-age=0'})
			await createConnection()
		}
	})

	// DB Healthcheck
	app.get(`${config.apiPrefix}/dbtime`, async (req, reply) => {
		const time = await getManager().query('SELECT CURRENT_TIME()')
		reply.send(time[0]['CURRENT_TIME()'])
	})
}