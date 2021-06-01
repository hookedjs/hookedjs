import { throwNotFoundError } from '#lib/validation'
import { FileEntity } from '#src/db/entity'
import fileStorage from '#src/lib/fileStorage.node'

import { fileByIdEndpoint } from './files.api.lib'

export default async function filesPlugin(app: FastifyInstance, options: FastifyOptions) {
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