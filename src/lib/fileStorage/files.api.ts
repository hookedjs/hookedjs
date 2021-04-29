import { NotFoundError, RequiredError, ValidationErrorSet } from '../validation'
import { fileByIdEndpoint, fileMetaByIdEndpoint } from './files.lib'
import fileStorage from './fileStorage'


export default async function filesPlugin(app: FastifyInstance, options: FastifyOptions) {
	app.post(fileByIdEndpoint(':id'), async (req, reply) => {
		const 
			{id} = req.params as Record<string, string>
			,files = req.raw.files || {}
			,file = files?.file
		if (!file)
			throw new ValidationErrorSet({}, {file: new RequiredError('file')})
		await fileStorage.put(id, file.data, file.mimetype)
		reply.code(201).send('success')
	})
	app.get(fileByIdEndpoint(':id'), async (req, reply) => {
		const {id} = req.params as Record<string, string>
		try {
			const file = await fileStorage.get(id)
			reply
			// .headers({'cache-control': 'public, max-age=86400'})
				.type(file.contentType)
				.send(file.data)
		} catch(err) {
			if (err.code === 'ENOENT')
				throw new NotFoundError()
			throw err
		}
	})
	app.get(fileMetaByIdEndpoint(':id'), async (req, reply) => {
		const {id} = req.params as Record<string, string>
		try {
			const file = await fileStorage.get(id)
			reply.send(Object.pick(file, ['contentType', 'createdAt']))
		} catch(err) {
			if (err.code === 'ENOENT')
				throw new NotFoundError()
			throw err
		}
	})
}