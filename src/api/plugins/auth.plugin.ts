import { FormValidationErrorSet, throwFormValidationErrorSet } from '../../lib/validation'
import { AuthUsers, AuthUserStatusEnum, LoginProps, PasswordTmpProps } from '../../pouch/databases'
import config from '../lib/config.node'
import mail from '../lib/mail'

const TEN_MINUTES = 1000 * 60 * 10

export default async function authorizationPlugin(app: FastifyInstance, options: FastifyOptions) {
	// app.addHook('onRequest', async function setAuthHeaders(req, reply) {
	// 	if (req.url.startsWith('_session')) {
	// 		reply.headers({'cache-control': 'no-store, max-age=0'})
	// 		// await createConnection()
	// 	}
	// })
	// app.addHook('onRequest', async function setAuthContext(req, reply) {
	// 	try {await req.jwtVerify()}
	// 	catch (err) {req.user = { id: '', roles: [], createdAt: 0 }}
	// })

	/**
	 * Registers a user
	 */
	app.post('/api/register', async function postRegisterEndpoint(req, reply) {
		const props: any = req.body || {}
		const passwordTmp = createPasswordTmp()
		// create user
		const user = await AuthUsers.createOne({
			...props,
			_id: `org.couchdb.user:${props.name}`,
			roles: [],
			status: AuthUserStatusEnum.PENDING,
			tenants: [],
			defaultTenantId: '',
			passwordTmp: String(passwordTmp.toHash()),
			passwordTmpAt: new Date(),
		})
			.catch(e => {
				throw (
					e.status === 409 && new FormValidationErrorSet(req.body, 'email is already taken')
					|| e
				)
			})
		
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
			.send({data: Object.omit(user.values, ['passwordTmp', 'passwordTmpAt'])})
	})

	/**
	 * Logs a user in
	 */
	app.post('/api/login', async function postLoginEndpoint(req, reply) {
		// Validate props
		const props = new LoginProps(req.body)
		const tenMinutesAgo = new Date(Date.now() - TEN_MINUTES)
		const passwordHashed = String(props.password.toHash())

		// Get user
		const user = await AuthUsers.get(`org.couchdb.user:${props.name}`)
			.catch(e => {
				throw (
					e.type === 'NotFound' && new FormValidationErrorSet(req.query, 'email and/or password are invalid')
					|| e
				)
			})
		
		let { failedLoginAttempts = 0 } = user
		const {
			failedLoginAttemptAt = new Date(0),
			derived_key: derivedKeyOrig,
			salt: saltOrig,
			passwordTmpAt = new Date(0),
		} = user

		// Allow more logins after ten minutes after last failed login attempt	
		if (failedLoginAttemptAt < tenMinutesAgo) {
			user.failedLoginAttempts = failedLoginAttempts = 2
		}

		// Refuse if too many failed login attempts
		if (failedLoginAttempts >= 5) {
			throwFormValidationErrorSet(req.body, 'too many failed login attempts. retry again later.')
		}

		const isValidPasswordTmp = (
			passwordHashed === user.passwordTmp
			&& passwordTmpAt > tenMinutesAgo
		)

		// If isValidPasswordTmp, activate user and set activate tmp password
		if (isValidPasswordTmp) {
			user.status = AuthUserStatusEnum.ACTIVE
			// TODO: create user/tenant db
			delete user.derived_key
			delete user.salt
			user.password = user.passwordTmp
			await user.save()
		}

		if (user.status === AuthUserStatusEnum.PENDING) {
			throwFormValidationErrorSet(req.body, 'Please confirm your account with the code sent to your email.')
		}
		if (user.status === AuthUserStatusEnum.BANNED) {
			throwFormValidationErrorSet(req.body, 'Your account is blocked.')
		}

		// Get login response confirm creds and extract cookie token
		const loginRes = await fetch(
			config.dbUrl + '/_session',
			{
				method: 'POST',
				body: JSON.stringify({
					name: props.name,
					password: isValidPasswordTmp ? passwordHashed : props.password
				}),
			},
		)
		const loginResBody = await loginRes.json()
		if (loginResBody.error) {
			if (loginResBody.error === 'unauthorized') {
				user.failedLoginAttempts = failedLoginAttempts + 1
				user.failedLoginAttemptAt = new Date()
				await user.save()
				throwFormValidationErrorSet(req.body, 'email and/or password are invalid')
			}
			throw Object.assign(new Error(loginResBody.reason), {error: loginResBody.error})
		}

		// If passwordTmp, restore original user password
		if (isValidPasswordTmp) {
			delete user.password
			user.derived_key = derivedKeyOrig
			user.salt = saltOrig
		}

		delete user.failedLoginAttempts
		delete user.failedLoginAttemptAt
		delete user.passwordTmp
		delete user.passwordTmpAt
		if (user.isDirty) {
			await user.save()
		}

		reply
			.header('set-cookie', loginRes.headers.get('set-cookie'))
			.send({data: user.values})
	})
	
	/**
	 * Send a tmp password to user's email
	 */
	app.post('/api/passwordTmp', async function postPasswordTmp(req, reply) {
		const props = new PasswordTmpProps(req.body)

		// Get user
		const user = await AuthUsers.get(`org.couchdb.user:${props.name}`)
			.catch(e => {
				throw (
					e.type === 'NotFound' && new FormValidationErrorSet(req.query, 'name is invalid')
					|| e
				)
			})

		const passwordTmp = createPasswordTmp()
		user.passwordTmp = String(passwordTmp.toHash())
		user.passwordTmpAt = new Date()
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
		
		reply.send({})
	})

}

const passwordTmpCharset = '0123456789'
function createPasswordTmp(): string {
	return [...Array(8)]
		.reduce((acc) => acc += passwordTmpCharset[Math.floor(Math.random() * passwordTmpCharset.length)],'')
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
			Note: This code expires in 10 minutes.
		</p>
	`)
}

function createBorderedEmail(body: string) {
	return `
		<div style="background: #aaa; padding: 20px 20px 50px; text-align: center;">
			<div style="max-width: 400px; padding: 20px; border-radius: 8px; background: white; box-sizing: border-box;">
				${body}
			</div>
		</div>
	`
}