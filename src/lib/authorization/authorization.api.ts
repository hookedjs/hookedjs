import jwtPlugin from 'fastify-jwt'

import createConnection from '#src/db/createConnection.node'
import { UserEntity, UserRoleEnum, UserStatusEnum } from '#src/db/entity'

import config from '../config.node'
import { ForbiddenError, FormValidationErrorSet, RequiredError, ValidationErrorSet } from '../validation'
import { authEndpoint, authLoginEndpoint, authRefreshEndpoint, authRegisterEndpoint, LoginProps, RegisterProps } from './authorization.api.lib'


export default async function authorizationPlugin(app: FastifyInstance, options: FastifyOptions) {
	app.register(jwtPlugin, { secret: config.jwtSecret, verify: {maxAge: '30d'}})
	app.addHook('onRequest', async function setAuthHeaders(req, reply) {
		if (req.url.startsWith(authEndpoint)) {
			reply.headers({'cache-control': 'no-store, max-age=0'})
			await createConnection()
		}
	})
	app.addHook('onRequest', async function setAuthContext(req, reply) {
		try {await req.jwtVerify()}
		catch (err) {req.user = { id: '', roles: [], createdAt: 0 }}
	})
	app.post(authLoginEndpoint, async function authLoginEndpoint(req, reply) {
		const props = new LoginProps(req.body)
		const user = await UserEntity.findOne({ where: { email: props.email } })
		if (!(user && await user.comparePassword(props.password)))
			throw new FormValidationErrorSet(req.body, 'email and/or password invalid')
		const token = app.jwt.sign({ id: user.id, roles: user.roles as any, createdAt: Date.now() })
		reply.send({data: {token, id: user.id, roles: user.roles}})
	})
	app.post(authRefreshEndpoint, async function authRefreshEndpoint(req, reply) {
		if (!req.user.id)
			throw new ValidationErrorSet({}, {Authorization: new RequiredError('authorization')})
		const user = await UserEntity.findOne({ where: { id: req.user.id } })
		if (!user) throw new Error('User in token was somehow deleted...?')
		const
			passwordChanged = req.user.createdAt < user.passwordUpdatedAt.getTime()
			,isBanned = user.status === UserStatusEnum.BANNED
		if (!user || passwordChanged || isBanned) 
			throw new ForbiddenError()
		const token = app.jwt.sign({ id: user.id, roles: user.roles as any, createdAt: Date.now() })
		reply.send({data: {token, id: user.id, roles: user.roles}})
	})
	app.post(authRegisterEndpoint, async function authRegisterEndpoint(req, reply) {
		const props = {
			...new RegisterProps(req.body),
			roles: [UserRoleEnum.TENANT_ADMIN]
		}
		const user = await UserEntity.createSafe(props)
		const token = app.jwt.sign({ id: user.id, roles: user.roles as any, createdAt: Date.now() })
		reply.send({data: {token, id: user.id, roles: user.roles}})
	})

	app.get(authEndpoint, async function getAuthStatusHandler(req, reply) {
		reply
			.headers({'cache-control': 'no-store, max-age=0'})
			.send(req.user)
	})
}