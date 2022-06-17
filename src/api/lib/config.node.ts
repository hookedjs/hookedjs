/* eslint-disable max-len */

/**
 * An interface for config variables
 */
import packageJson from '../../../package.json'

const pe = process.env as Record<string, string>
const isProd = pe.NODE_ENV === 'production'

const lambdaVars = ['jwtSecret', 'dbName', 'dbArn', 'dbSecretArn', 's3Bucket', 'region'] as const
const lambdaEnv = Object.pick(pe, lambdaVars)
const localVars = ['jwtSecret'] as const
const localEnv = Object.assign({jwtSecret: 'secret'}, Object.pick(pe, localVars))

const currentVars = isProd ? lambdaVars : localVars
const currentEnv = isProd ? lambdaEnv : localEnv

// @ts-ignore: env checker uncertainty
const missing = currentVars.filter(v => !currentEnv[v])
if (missing.length) throw new Error('Env is missing ' + missing)

export default {
  version: packageJson.version,
  isProd,
  gateway: 'https://localhost:3000',
  apiPrefix: '/api',
  dbUrl: 'https://localhost:3000/db',
  dbUser: 'admin',
  dbPass: 'Password8',
  smtpHost: 'smtp.ethereal.email',
  smtpPort: 587,
  smtpUser: 'manuela.gusikowski29@ethereal.email',
  smtpPass: 'fXvFzaqdCHBCS5pz5N',
  ...lambdaEnv,
  ...localEnv,
}
