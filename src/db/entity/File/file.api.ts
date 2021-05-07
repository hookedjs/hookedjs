import * as cuid from 'cuid'

import fileStorage from '#lib/fileStorage'
import { RequiredError, throwNotFoundError, throwValidationErrorSet } from '#lib/validation'
import { FileEntity } from '#src/db/entity'

import { fileByIdEndpoint, PostProps } from './file.api.lib'

export default async function filePlugin(app: FastifyInstance, options: FastifyOptions) {
	app.post(fileByIdEndpoint(':id'), async function upsertFile(req, reply) {
		const 
			id = cuid()
			,files = req.raw.files || {}
			,file = files?.file as PostProps || new PostProps(req.body) || throwValidationErrorSet({}, {file: new RequiredError('file')})
		await fileStorage.put(id, file.data, file.mimetype)
		reply.code(201).send()
	})
	app.get(fileByIdEndpoint(':id'), async function getFile(req, reply) {
		const 
			{id} = req.params as Record<string, string>
			,record = await FileEntity.findOne({id}) || throwNotFoundError()
			,file = await fileStorage.get(id)
		reply
			// .headers({'cache-control': 'public, max-age=86400'})
			.type(file.contentType)
			.send(file.data)
	})
}