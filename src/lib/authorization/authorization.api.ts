import jwtPlugin from 'fastify-jwt'

import { createConnection, UserEntity, UserStatusEnum } from '#src/db'

import config from '../config'
import { ForbiddenError, FormValidationErrorSet, RequiredError, ValidationErrorSet } from '../validation'
import { authEndpoint, authLoginEndpoint, authRefreshEndpoint, LoginProps } from './authorization.lib'


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
	app.post(authLoginEndpoint, async function createLoginToken(req, reply) {
		const props = new LoginProps(req.body)
		const user = await UserEntity.findOne({ where: { email: props.email } })
		if (!(user && await user.comparePassword(props.password)))
			throw new FormValidationErrorSet(req.body, 'email and/or password invalid')
		const token = app.jwt.sign({ id: user.id, roles: user.roles, createdAt: Date.now() })
		reply.send({token})
	})
	app.post(authRefreshEndpoint, async function createRefreshToken(req, reply) {
		if (!req.user.id)
			throw new ValidationErrorSet({}, {Authorization: new RequiredError('authorization')})
		const user = await UserEntity.findOne({ where: { id: req.user.id } })
		if (!user) throw new Error('User in token was somehow deleted...?')
		const
			passwordChanged = req.user.createdAt < user.passwordUpdatedAt.getTime()
			,isBanned = user.status === UserStatusEnum.BANNED
		if (!user || passwordChanged || isBanned) 
			throw new ForbiddenError()
		const token = app.jwt.sign({ id: user.id, roles: user.roles, createdAt: Date.now() })
		reply.send({token})
	})
	app.get(authEndpoint, async function getAuthStatusHandler(req, reply) {
		reply
			.headers({'cache-control': 'no-store, max-age=0'})
			.send(req.user)
	})
}