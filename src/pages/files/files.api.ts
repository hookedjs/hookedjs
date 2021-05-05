import * as cuid from 'cuid'

import fileStorage from '#lib/fileStorage'
import { RequiredError, throwForbiddenError, throwNotFoundError, throwValidationErrorSet } from '#lib/validation'
import { FileEntity, UserRoleEnum } from '#src/db/entity'

import { fileByIdEndpoint, fileEndpoint } from './files.lib'

export default async function filesPlugin(app: FastifyInstance, options: FastifyOptions) {
	app.post(fileEndpoint, async function createFile(req, reply) {
		const 
			id = cuid()
			,files = req.raw.files || {}
			,file = files?.file || throwValidationErrorSet({}, {file: new RequiredError('file')})
			,hasPrivs = req.user.roles.includes(UserRoleEnum.ADMIN) || throwForbiddenError()
		await fileStorage.put(id, file.data, file.mimetype)
		const record = await FileEntity.createSafe({
			id, createdById: req.user.id,
			name: file.name, type: file.mimetype, size: file.size, md5: file.md5
		})
			.catch(err => {
				if(err.message.includes('foreign key constraint fails')) throwForbiddenError()
				throw err
			})
		reply.code(201).send(record)
	})
	app.get(fileByIdEndpoint(':id'), async function getFile(req, reply) {
		const 
			{id} = req.params as Record<string, string>
			,record = await FileEntity.findOne({id}) || throwNotFoundError()
			,file = await fileStorage.get(id)
		reply
			.headers({'cache-control': 'public, max-age=86400'})
			.type(file.contentType)
			.send(file.data)
	})
}