import { UserEntity } from '#src/db'
import { FormValidationErrorSet } from '#src/lib/validation'

import { userByIdEndpoint } from './user.lib'

export default async function userPlugin(app: FastifyInstance, options: FastifyOptions) {
	app.get(userByIdEndpoint(':id'), async (req, reply) => {
		const 
			{id} = req.params as Record<string, string>
			,user = await UserEntity.findOne({id})
		if (!user)
			throw new FormValidationErrorSet({id}, 'user id invalid')
		user.passwordHash = '*******'
		reply.send(user)
	})
}