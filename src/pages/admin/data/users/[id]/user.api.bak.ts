import { UserEntity } from '#src/db'
import { FormValidationErrorSet } from '#src/lib/validation'

import { userByIdEndpoint, UserPatchProps,userRestoreEndpoint } from './user.lib'

export default async function userPlugin(app: FastifyInstance, options: FastifyOptions) {
	// TODO: Refactor the '/api/admin' endpoints to be public and less crud-y
	app.get(userByIdEndpoint(':id'), async (req, reply) => {
		const 
			{id} = req.params as Record<string, string>
			,user = await UserEntity.findOne({id})
		if (!user)
			throw new FormValidationErrorSet({id}, 'id invalid')
		reply.send(user)
	})
	app.patch(userByIdEndpoint(':id'), async (req, reply) => {
		const 
			{id} = req.params as Record<string, string>
			,user = await UserEntity.findOne({id})
		if (!user)
			throw new FormValidationErrorSet({id}, 'id invalid')
		
		const props = new UserPatchProps(req.body)
		Object.assign(user, props)
		await user.saveSafe()
		reply.code(204).send()
	})
	app.delete(userByIdEndpoint(':id'), async (req, reply) => {
		const 
			{id} = req.params as Record<string, string>
			,user = await UserEntity.findOne({id})
		if (!user)
			throw new FormValidationErrorSet({id}, 'id invalid')
		
		await user.softRemove()
		reply.code(204).send()
	})
	app.post(userRestoreEndpoint(':id'), async (req, reply) => {
		const {id} = req.params as Record<string, string>
		await UserEntity.getRepository().restore(id)
		reply.code(204).send()
	})
}