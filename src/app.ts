import 'reflect-metadata'

import fastify from 'fastify'
import fileUploadPlugin from 'fastify-file-upload'
import helmetPlugin from 'fastify-helmet'
import fastifyPluginize from 'fastify-plugin'
import staticPlugin from 'fastify-static'
import * as fs from 'fs'
import * as glob from 'glob'
import * as helmet from 'helmet'
import * as path from 'path'

import config from './lib/config'
import { ForbiddenError, NotFoundError, ValidationErrorSet } from './lib/validation'

const 
	htmlPath = path.join(__dirname, '/html')
	,notFoundHtml = fs.readFileSync(path.join(htmlPath, '/not-found.html'))
	,app = fastify({
		logger: false,
		...!config.isProd ? {
			http2: true,
			https: { 
				allowHTTP1: true, 
				key: fs.readFileSync(__dirname + '/../ssl.key', 'utf8'), 
				cert: fs.readFileSync(__dirname + '/../ssl.crt', 'utf8'),
			},
		} : {}
	})

///////////////////////////////
// Default Headers
///////////////////////////////
app.addHook('onRequest', async function setHeaders(req, reply) {
	if (req.method === 'GET' || req.method === 'OPTIONS')
		reply.headers({'cache-control': 'public, max-age=86400'})
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
app.register(fileUploadPlugin, { limits: { fileSize: 50 * 1024 * 1024 }})
app.register(staticPlugin, { root: htmlPath })
app.get('/version', function getVersion(req, reply) {reply.send(config.version)})


///////////////////////////////
// Dynamic Modules
///////////////////////////////
const dynamicMiddlewares: string[] = glob.sync(`${__dirname}/**/*.api.ts`)
dynamicMiddlewares.forEach(file => {
	const plugin = require(file.slice(0, -3))?.default
	if (plugin) app.register(fastifyPluginize(plugin))
})


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


export default app


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

