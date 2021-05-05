import * as glob from 'glob'
import { getManager } from 'typeorm'

import { ForbiddenError, FormValidationErrorSet } from '#lib/validation'

import config from '../lib/config'
import createConnection from './createConnection'
import { UserRoleEnum } from './entity'

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

	// CRUD
	app.addHook('preValidation', async function adminAuthGuard(req, reply) {
		if (
			req.url.startsWith(`${config.apiPrefix}/crud`) 
			&& !req.user.roles.includes(UserRoleEnum.ADMIN)
		) {
			throw new ForbiddenError()
		}
	})
	const entityFiles: string[] = glob.sync(`${__dirname}/entity/**/entity.ts`)
	entityFiles.forEach(file => {
		const entity = require(file.slice(0, -3))?.default
		if (entity) app.register(entityCrudPluginGenerator(entity))
	})
}

function entityCrudPluginGenerator(entity: any) {
	const prefix = `${config.apiPrefix}/crud/${entity.name.toLowerCase().replace('entity', '')+'s'}`
	return async function crudPlugin(app: FastifyInstance, options: FastifyOptions) {
		app.post(prefix, async function crudCreate(req, reply) {
			const record = await entity.createSafe(req.body)
			reply.code(201).send(record)
		})

		app.get(prefix, async function crudReadMany(req, reply) {
			const props = req.query as any
			const records = await entity.find({
				withDeleted: 'withDeleted' in props && props.withDeleted !== 'false'
			})
			reply.send(records)
		})
	
		app.get(`${prefix}/:id`, async function crudReadOne(req, reply) {
			const 
				{id} = req.params as Record<string, string>
				,record = await entity.findOne({id})
			if (!record)
				throw new FormValidationErrorSet({id}, 'id invalid')
			reply.send(record)
		})
	
		app.patch(`${prefix}/:id`, async function crudUpdate(req, reply) {
			const 
				{id} = req.params as Record<string, string>
				,record = await entity.findOne({id})
			if (!record)
				throw new FormValidationErrorSet({id}, 'id invalid')
		
			Object.assign(record, req.body)
			await record.saveSafe()
			reply.code(200).send(record)
		})
	
		app.delete(`${prefix}/:id`, async function crudDelete(req, reply) {
			const 
				{id} = req.params as Record<string, string>
				,record = await entity.findOne({id})
			if (!record)
				throw new FormValidationErrorSet({id}, 'id invalid')
		
			await record.softRemove()
			reply.code(204).send()
		})
		app.post(`${prefix}/:id/restore`, async function crudDeleteRestore(req, reply) {
			const 
				{id} = req.params as Record<string, string>
				,record = await entity.findOne({id, withDeleted: true})
			if (!record)
				throw new FormValidationErrorSet({id}, 'id invalid')
			await entity.getRepository().restore(id)
			reply.code(204).send()
		})
	}
}
