import '../lib/polyfills/node'

import fastify from 'fastify'
import helmetPlugin from 'fastify-helmet'
const proxyPlugin = require('fastify-http-proxy')
import staticPlugin from 'fastify-static'
import * as fs from 'fs'
import * as helmet from 'helmet'
import * as path from 'path'

import { ForbiddenError, NotFoundError, ValidationErrorSet } from '../lib/validation'
import config from './lib/config.node'

const 
	htmlPath = path.join(__dirname, '/../../web-build')
	,notFoundHtml = fs.readFileSync(path.join(htmlPath, '/index.html'))
	,app = fastify({
		logger: true,
		http2: true,
		https: { 
			allowHTTP1: true, 
			key: fs.readFileSync(__dirname + '/../../snowpack.key', 'utf8'), 
			cert: fs.readFileSync(__dirname + '/../../snowpack.crt', 'utf8'),
		},
	})


///////////////////////////////
// Plugins
///////////////////////////////
app.register(helmetPlugin, { 
	prefix: config.apiPrefix,
	contentSecurityPolicy: {
		directives: {
			...helmet.contentSecurityPolicy.getDefaultDirectives(),
			'script-src': ['\'self\'', 'https: \'unsafe-inline\''],
		},
	},
})
app.register(proxyPlugin, {upstream: 'http://0.0.0.0:5001', prefix: '/api', rewritePrefix: '/api'})
app.register(proxyPlugin, {upstream: 'http://0.0.0.0:5984', prefix: '/db'})
app.register(staticPlugin, { root: htmlPath })


///////////////////////////////
// Not Found / Error Handling
///////////////////////////////
app.setNotFoundHandler(function notFoundHandler(req, reply) { 
	reply
		.code(404)
		.headers({'cache-control': 'no-store, max-age=0'})
		.type('text/html')
		.send(notFoundHtml) 
})
app.setErrorHandler(async function errorHandler(error, req, reply) {
	req.log.error(error as any, error.message)
	reply.headers({'cache-control': 'no-store, max-age=0'})
	if (error instanceof NotFoundError)
		reply.code(404).type('text/html').send(notFoundHtml)
	else if (error instanceof ForbiddenError)
		reply.code(403).send({ error })
	else if (error instanceof ValidationErrorSet)
		reply.code(400).send({ error })
	else
		reply.code(500).send({ error: new InternalServerError(error.message) })
})

app.listen(process.env.PORT || 8080, process.env.ADDRESS || '0.0.0.0', (err, address) => {
	if (err) throw err
	app.log.info(`server listening on ${address}`)
})


///////////////////////////////
// Errors
///////////////////////////////
class InternalServerError extends Error {
	type = 'InternalServerError'
	note: string
	context: {
		entity: any,
		errorSet: Record<string, string>,
	}
	constructor(message: string, entity?: any) {
		super(message)
		this.note = message
		this.context = {
			entity,
			errorSet: {},
		}
	}
}

