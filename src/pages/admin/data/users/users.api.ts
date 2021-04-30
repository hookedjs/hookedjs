import { UserEntity } from '../../../../db'
import { UserCreateProps, usersEndpoint } from './users.lib'

export default async function usersPlugin(app: FastifyInstance, options: FastifyOptions) {
	app.get(usersEndpoint, async function getUsers(req, reply) {
		const users = await UserEntity.find()
		users.forEach(u => u.passwordHash = '*******' )
		reply.send(users)
	})
	app.post(usersEndpoint, async function createUser(req, reply) {
		const props = new UserCreateProps(req.body)
		const user = await UserEntity.createSafe(props)
		user.passwordHash = '*******'
		reply.code(201).send('success')
	})
}