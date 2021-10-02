/**
 * An interface for config variables
 */
import * as packageJson from '../../package.json'
import configIso from './config.iso'

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
if (missing.length)
	throw new Error('Env is missing ' + missing)

export default {
	version: packageJson.version,
	isProd,
	...configIso,
	...lambdaEnv,
	...localEnv,
}


