import fastify from 'fastify'
// import fileUploadPlugin from 'fastify-file-upload'
import fastifyPluginize from 'fastify-plugin'
import glob from 'glob'

import '../lib/polyfills/node'
import {ForbiddenError, NotFoundError, ValidationErrorSet} from '../lib/validation'
import config from './lib/config.node'
import './lib/pouch/init'

const app = fastify({
  logger: true,
})

app.get(`${config.apiPrefix}/version`, function getVersion(req, reply) {
  reply.send(config.version)
})

///////////////////////////////
// Default Headers
// ///////////////////////////////
// app.addHook('onRequest', async function setHeaders(req, reply) {
// 	if (req.method === 'GET' || req.method === 'OPTIONS')
// 		reply.headers({'cache-control': 'public, max-age=86400'})
// })

///////////////////////////////
// Plugins
///////////////////////////////
// app.register(fileUploadPlugin, { limits: { fileSize: 50 * 1024 * 1024 }})

///////////////////////////////
// Dynamic Modules
///////////////////////////////
const dynamicMiddlewares: string[] = glob.sync(`${__dirname}/plugins/*.plugin.ts`)
dynamicMiddlewares.forEach(file => {
  const plugin = require(file.slice(0, -3))?.default
  if (plugin) app.register(fastifyPluginize(plugin))
})

///////////////////////////////
// Not Found / Error Handling
///////////////////////////////
app.setNotFoundHandler(function notFoundHandler(req, reply) {
  reply.code(404).headers({'cache-control': 'no-store, max-age=0'}).type('text/html').send('Not Found')
})
app.setErrorHandler(async function errorHandler(error, req, reply) {
  req.log.error(error as any, error.message)
  reply.headers({'cache-control': 'no-store, max-age=0'})
  if (error instanceof NotFoundError) reply.code(404).type('text/html').send('Not Found')
  else if (error instanceof ForbiddenError) reply.code(403).send({error})
  else if (error instanceof ValidationErrorSet) reply.code(400).send({error})
  else reply.code(500).send({error: new InternalServerError(error.message)})
})

app.listen(process.env.PORT || 5001, process.env.ADDRESS || '0.0.0.0', (err, address) => {
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
    entity: any
    errorSet: Record<string, string>
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
