import { UserEntity } from '#src/db'

import { UserPostProps, usersEndpoint } from './users.lib'

export default async function usersPlugin(app: FastifyInstance, options: FastifyOptions) {
	app.get(usersEndpoint, async function getUsers(req, reply) {
		const props = req.query as any
		const users = await UserEntity.find({
			withDeleted: 'withDeleted' in props && props.withDeleted !== 'false'
		})
		reply.send(users)
	})
	app.post(usersEndpoint, async function createUser(req, reply) {
		const props = new UserPostProps(req.body)
		const user = await UserEntity.createSafe(props)
		reply.code(201).send()
	})
}