import jwtPlugin from 'fastify-jwt'

import { assertAttrsWithin, assertValid, assertValidSet } from '../../lib/validation'
// import { UserEntity, UserRoleEnum, UserStatusEnum } from '../../db/entity'
import { ForbiddenError, FormValidationErrorSet, RequiredError, ValidationErrorSet } from '../../lib/validation'
import config from '../lib/config.node'

const authEndpoint = `${config.authPrefix}`
const authLoginEndpoint = `${authEndpoint}/login`
const authRefreshEndpoint = `${authEndpoint}/refresh`
const authRegisterEndpoint = `${authEndpoint}/register`

class LoginProps {
		email = ''
		password = ''
		constructor(props: any) {
			assertAttrsWithin(props, this)
			assertValidSet<LoginProps>(props, {
				email: assertValid('email', props.email, ['isDefined', 'isString', 'isEmail']),
				password: assertValid('password', props.password, ['isDefined', 'isString', 'isNoneEmpty']),
			})
			Object.assign(this, props)
		}
}
const LoginPropsExample = new LoginProps({
	email: 'admin@example.com',
	password: 'Password8',
})
const LoginPropsEnum = Enum.getEnumFromClassInstance(LoginPropsExample)


class RegisterProps {
		email = ''
		password = ''
		givenName = ''
		surname = ''
		acceptedTerms = false
		constructor(props: any) {
			assertAttrsWithin(props, this)
			assertValidSet<RegisterProps>(props, {
				email: assertValid('email', props.email, ['isDefined', 'isString', 'isEmail']),
				password: assertValid('password', props.password, ['isDefined', 'isString', 'isNoneEmpty', 'isPassword']),
				givenName: assertValid('givenName', props.givenName, ['isDefined', 'isString', 'isNoneEmpty']),
				surname: assertValid('surname', props.surname, ['isDefined', 'isString', 'isNoneEmpty']),
				acceptedTerms: assertValid('acceptedTerms', props.acceptedTerms, ['isDefined', 'isBoolean', 'isTruthy']),
			})
			Object.assign(this, props)
		}
}
export const RegisterPropsExample = new RegisterProps({
	email: 'admin@example.com',
	password: 'Password8',
	givenName: 'Sally',
	surname: 'Fields',
	acceptedTerms: true,
})
export const RegisterPropsEnum = Enum.getEnumFromClassInstance(RegisterPropsExample)

const user = {id: '', roles: [], status: 'active', passwordUpdatedAt: new Date(), comparePassword(password: string): boolean {return true}}


export default async function authorizationPlugin(app: FastifyInstance, options: FastifyOptions) {
	app.register(jwtPlugin, { secret: config.jwtSecret, verify: {maxAge: '30d'}})
	app.addHook('onRequest', async function setAuthHeaders(req, reply) {
		if (req.url.startsWith(authEndpoint)) {
			reply.headers({'cache-control': 'no-store, max-age=0'})
			// await createConnection()
		}
	})
	app.addHook('onRequest', async function setAuthContext(req, reply) {
		try {await req.jwtVerify()}
		catch (err) {req.user = { id: '', roles: [], createdAt: 0 }}
	})
	app.post(authLoginEndpoint, async function authLoginEndpoint(req, reply) {
		const props = new LoginProps(req.body)
		// const user = await UserEntity.findOne({ where: { email: props.email } })
		if (!(user && await user.comparePassword(props.password)))
			throw new FormValidationErrorSet(req.body, 'email and/or password invalid')
		const token = app.jwt.sign({ id: user.id, roles: user.roles, createdAt: Date.now() })
		reply.send({data: {token, id: user.id, roles: user.roles}})
	})
	app.post(authRefreshEndpoint, async function authRefreshEndpoint(req, reply) {
		if (!req.user.id)
			throw new ValidationErrorSet({}, {Authorization: new RequiredError('authorization')})
		// const user = await UserEntity.findOne({ where: { id: req.user.id } })
		if (!user) throw new Error('User in token was somehow deleted...?')
		const
			passwordChanged = req.user.createdAt < user.passwordUpdatedAt.getTime()
			,isBanned = user.status === 'banned'
		if (!user || passwordChanged || isBanned) 
			throw new ForbiddenError()
		const token = app.jwt.sign({ id: user.id, roles: user.roles, createdAt: Date.now() })
		reply.send({data: {token, id: user.id, roles: user.roles}})
	})
	app.post(authRegisterEndpoint, async function authRegisterEndpoint(req, reply) {
		const props = {
			...new RegisterProps(req.body),
			roles: ['_tenant']
		}
		// const user = await UserEntity.createSafe(props)
		const token = app.jwt.sign({ id: user.id, roles: user.roles, createdAt: Date.now() })
		reply.send({data: {token, id: user.id, roles: user.roles}})
	})

	app.get(authEndpoint, async function getAuthStatusHandler(req, reply) {
		reply
			.headers({'cache-control': 'no-store, max-age=0'})
			.send(req.user)
	})
}