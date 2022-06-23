/**
 * API Endpoints for authentication that utilize emailed temporary passwords.
 *
 * Better than direct DB auth, bc it's more secure and less prone to brute force.
 *
 * Decisions:
 *  - Use cheap password hashing bc they are temporary and cheap = less CPU cost
 *  - Use email verification bc they are more secure and better promise that an
 *    account is not being shared between people
 *  - Use admin db password as master password for all new users so that the API
 *    can act on behalf of any user (aka impose aka impersonate aka masquerade).
 *    TODO: Extend couchdb/pouchdb to support password validation bypass for cookie
 *    auth. Ideally it could just check for an admin auth cookie, but an API key
 *    in the header is also an option.
 */
import crypto from 'crypto'
import {customAlphabet} from 'nanoid'

import {FormValidationErrorSet, throwFormValidationErrorSet} from '../../lib/validation'
import {LoginProps, PasswordRequestProps, RegisterProps, UserStatusEnum, Users} from '../../pouch'
import config from '../lib/config.node'
import mail from '../lib/mail'

const LIFESPAN = 1000 * 60 * 10

export default async function authorizationPlugin(app: FastifyInstance, options: FastifyOptions) {
  /**
   * Inject user context into requests
   */
  app.addHook('onRequest', async function setAuthContext(req, reply) {
    req.user = {name: '', roles: []}
    try {
      req.user = await fetch(`${config.dbUrl}/_session`, {
        headers: {cookie: req.headers.cookie || ''},
      })
        .then(res => res.json())
        .then(res => res.userCtx)
    } catch (err) {}
    console.log(req.user.name)
  })

  /**
   * Registers a user
   */
  app.post('/api/register', async function postRegisterEndpoint(req, reply) {
    const props = new RegisterProps(req.body)
    const passwordTmp = createPasswordTmp()
    const now = new Date()
    // create user
    const user = await Users.createOne({
      ...props,
      roles: [],
      status: UserStatusEnum.PENDING,
      password: config.dbPass,
      passwordTmp: passwordTmp.toHash(),
      passwordTmpAt: now,
      passwordTmpFailCount: 0,
    }).catch(async e => {
      if (e.status === 409) {
        // 409 means exists
        const existing = await Users.get(props.name)
        // If passwordTmp is expired, create a new one
        if (!existing.passwordTmpAt || existing.passwordTmpAt.getTime() < now.getTime() - LIFESPAN) {
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

    mail
      .send({
        to: user.name,
        subject: `Verification code ${passwordTmp}`,
        html: createWelcomeEmail(passwordTmp),
      })
      .then(mailRes => {
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

  /**
   * Logs a user in
   */
  app.post('/api/login', async function postLoginEndpoint(req, reply) {
    const props = new LoginProps(req.body)
    const genericError = new FormValidationErrorSet(
      {...props, password: '********'},
      'email and/or password are invalid',
    )

    const user = await Users.get(props.name).catch(e => {
      throw e.type === 'NotFound' ? genericError : e
    })

    if (!req.user.roles.includes('_admin')) {
      await checkPassword()
    }
    if (user.status === UserStatusEnum.BANNED) {
      throwFormValidationErrorSet(req.body, 'Your account is blocked.')
    }

    // All checks pass!

    // Get login response and extract cookie token
    const loginRes = await fetch(config.dbUrl + '/_session', {
      method: 'POST',
      body: JSON.stringify({
        name: props.name,
        password: config.dbPass,
      }),
      headers: {cookie: ';'}, // bypasses global admin cookie
    })

    user.status = UserStatusEnum.ACTIVE
    delete user.passwordTmp
    delete user.passwordTmpAt
    delete user.passwordTmpFailCount
    await user.save()

    reply.header('set-cookie', loginRes.headers.get('set-cookie')).send({
      user: Object.omit(user.values, ['derived_key', 'salt', 'iterations', 'password_scheme']),
    })

    async function checkPassword() {
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
      // Refuse if password is wrong
      if (!crypto.timingSafeEqual(Buffer.from(props.password.toHash()), Buffer.from(user.passwordTmp))) {
        user.passwordTmpFailCount++
        await user.save()
        throw genericError
      }
    }
  })

  /**
   * Send a tmp password to user's email
   */
  app.post('/api/passwordRequest', async function postPasswordRequest(req, reply) {
    const props = new PasswordRequestProps(req.body)
    const user = await Users.get(props.name).catch(() => {})
    const now = new Date()

    // If not user, pretend it's a valid request by returning 200
    if (!user) {
      reply.send({})
      return
    }

    // If user requested a password reset too recently, ignore request
    if (user.passwordTmpAt && user.passwordTmpAt.getTime() > now.getTime() - LIFESPAN) {
      reply.send({})
      return
    }

    const passwordTmp = createPasswordTmp()
    user.passwordTmp = passwordTmp.toHash()
    user.passwordTmpAt = now
    user.passwordTmpFailCount = 0
    await user.save()

    mail
      .send({
        to: user.name,
        subject: `Verification code ${passwordTmp}`,
        html: createWelcomeEmail(passwordTmp),
      })
      .then(mailRes => {
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

const createPasswordTmp = customAlphabet('0123456789', 6)

function createWelcomeEmail(passwordTmp: string) {
  return createBorderedEmail(`
		<h1>Hello from HookedJS!</h1>
		<p>
			Finish logging in with your verification code: <b style="letter-spacing: .2em">${passwordTmp}</b>
		</p>
		<p>
			This code is unique to you, expires in 10 minutes or 3 failed attempts.
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
