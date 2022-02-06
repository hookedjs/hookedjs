/**
 * API Endpoints for authentication that utilize emailed temporary passwords.
 * 
 * Better than direct DB auth, bc it's more secure and less prone to brute force.
 * 
 * Decisions:
 *  - Use cheap password hashing bc they are temporary and cheap = less CPU cost
 *  - Use email verification bc they are more secure and better promise that an
 *    account is not being shared between people
 */

import crypto from 'crypto'

import { FormValidationErrorSet, throwFormValidationErrorSet } from '../../lib/validation'
import { AuthUsers, AuthUserStatusEnum, LoginProps, PasswordRequestProps, RegisterProps } from '../../pouch/databases'
import config from '../lib/config.node'
import mail from '../lib/mail'

// @ts-ignore: ts-node is unaware of webcrypto
const getRandomValues = crypto.webcrypto.getRandomValues

const TEN_MINUTES = 1000 * 60 * 10

export default async function authorizationPlugin(app: FastifyInstance, options: FastifyOptions) {
	/**
	 * Registers a user
	 */
	app.post('/api/register', async function postRegisterEndpoint(req, reply) {
		const props = new RegisterProps(req.body)
		const passwordTmp = createPasswordTmp()
		const now = new Date()
		// create user
		const user = await AuthUsers.createOne({
			...props,
			roles: [],
			status: AuthUserStatusEnum.PENDING,
			tenants: [],
			defaultTenantId: '',
			passwordTmp: passwordTmp.toHash(),
			passwordTmpAt: now,
			passwordTmpFailCount: 0,
		})
			.catch(async e => {
				if (e.status === 409) { // 409 means exists
					const existing = await AuthUsers.get(props.name)
					// If passwordTmp is expired, create a new one
					if (
						!existing.passwordTmpAt || existing.passwordTmpAt.getTime() < now.getTime() - TEN_MINUTES
					) {
						existing.passwordTmp = passwordTmp.toHash()
						existing.passwordTmpAt = now
						existing.passwordTmpFailCount = 0
						await existing.save()
					}
					return existing
				}
				throw e
			})

		// If passwordTmp is not new, user existed and already had a current passwordTmp so ignore this request
		if (user.passwordTmpAt?.getTime() !== now.getTime()) {
			reply.send({})
			return
		}
		
		mail.send({
			to: user.name,
			subject: 'Welcome to HookedJS!',
			html: createWelcomeEmail(passwordTmp),
		}).then(mailRes => {
			console.log({
				passwordTmp: passwordTmp,
				emailPreview: mail.getTestMessageUrl(mailRes),
			})
		})

		reply
			.send({
				// WARNING: this is a security risk, do not send the passwordTmp to the client
				passwordTmp,
			})
	})

	/**
	 * Logs a user in
	 */
	app.post('/api/login', async function postLoginEndpoint(req, reply) {
		// Validate props
		const props = new LoginProps(req.body)
		const genericError = new FormValidationErrorSet({...props, password: '********'}, 'email and/or password are invalid')

		// Get user
		const user = await AuthUsers.get(props.name)
			.catch(e => {
				throw e.type === 'NotFound' ? genericError : e
			})

		// Refuse if user has no active passwordTmp
		if (!(user.passwordTmp && typeof user.passwordTmpFailCount === 'number')) {
			throw genericError
		}
		// Refuse if too many failed login attempts
		if (user.passwordTmpFailCount > 2) {
			delete user.derived_key
			delete user.salt
			delete user.iterations
			delete user.password_scheme
			delete user.passwordTmp
			delete user.passwordTmpAt
			delete user.passwordTmpFailCount
			await user.save()
			throw genericError
		}
		// Refuse if password is wrong and track failed login attempt
		if (!crypto.timingSafeEqual(Buffer.from(props.password.toHash()), Buffer.from(user.passwordTmp))) {
			user.passwordTmpFailCount++
			await user.save()
			throw genericError
		}
		// Refuse if user is banned
		if (user.status === AuthUserStatusEnum.BANNED) {
			throwFormValidationErrorSet(req.body, 'Your account is blocked.')
		}

		// All checks pass!

		// activate tmp password for user
		user.password = user.passwordTmp
		await user.save()

		// Get login response confirm creds and extract cookie token
		const loginRes = await fetch(
			config.dbUrl + '/_session',
			{
				method: 'POST',
				body: JSON.stringify({
					name: props.name,
					password: user.passwordTmp
				}),
			},
		)
		const loginResBody = await loginRes.json()
		if (loginResBody.error) {
			if (loginResBody.error === 'unauthorized') {
				user.passwordTmpFailCount++
				await user.save()
				throw genericError
			}
			throw Object.assign(new Error(loginResBody.reason), {error: loginResBody.error})
		}
		
		user.status = AuthUserStatusEnum.ACTIVE
		delete user.password
		delete user.derived_key
		delete user.salt
		delete user.iterations
		delete user.password_scheme
		delete user.passwordTmp
		delete user.passwordTmpAt
		delete user.passwordTmpFailCount
		await user.save()

		reply
			.header('set-cookie', loginRes.headers.get('set-cookie'))
			.send({user: user.values})
	})
	
	/**
	 * Send a tmp password to user's email
	 */
	app.post('/api/passwordRequest', async function postPasswordRequest(req, reply) {
		const props = new PasswordRequestProps(req.body)
		const user = await AuthUsers.get(props.name).catch(() => {})
		const now = new Date()

		// If not user, pretend it's a valid request by returning 200
		if (!user) {
			reply.send({})
			return
		}

		// If user requested a password reset too recently, ignore request
		if (
			user.passwordTmpAt && user.passwordTmpAt.getTime() > now.getTime() - TEN_MINUTES
		) {
			reply.send({})
			return
		}

		const passwordTmp = createPasswordTmp()
		user.passwordTmp = String(passwordTmp.toHash())
		user.passwordTmpAt = now
		user.passwordTmpFailCount = 0
		await user.save()
		
		mail.send({
			to: user.name,
			subject: 'HookedJS: Your temporary password',
			html: createWelcomeEmail(passwordTmp),
		}).then(mailRes => {
			console.log({
				passwordTmp: passwordTmp,
				emailPreview: mail.getTestMessageUrl(mailRes),
			})
		})
		
		reply.send({
			// WARNING: this is a security risk, do not send the passwordTmp to the client
			passwordTmp,
		})
	})

}

function createPasswordTmp(): string {
	const passwordTmp = String(getRandomValues(new Uint32Array(1))[0])
		.slice(-8)
		.padStart(8, '0')
	return passwordTmp
}

function createWelcomeEmail(passwordTmp: string) {
	return createBorderedEmail(`
		<h1>Welcome to HookedJS!</h1>
		<p>
			Please confirm your account with the following code:
		</p>
		<p>
			<b style="font-size: 3em; letter-spacing: .2em">${passwordTmp}</b>
		</p>
		<p>
			This code expires in 10 minutes or 3 failed attempts.
		</p>
	`)
}

function createBorderedEmail(body: string) {
	return `
		<div style="background: #aaa; padding: 20px 20px 50px; text-align: center;">
			<div style="padding: 20px; border-radius: 8px; background: white; box-sizing: border-box;">
				${body}
			</div>
		</div>
	`
}