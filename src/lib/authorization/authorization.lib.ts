import { assertAttrsWithin, assertValid, assertValidSet } from '../validation'

export const authEndpoint = '/auth'
export const authLoginEndpoint = `${authEndpoint}/login`
export const authRefreshEndpoint = `${authEndpoint}/refresh`

export class LoginProps {
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
export const LoginPropsExample = new LoginProps({
	email: 'admin@example.com',
	password: 'Password8',
})
export const LoginPropsEnum = Enum.getEnumFromClassInstance(LoginPropsExample)
