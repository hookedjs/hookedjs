import { assertAttrsWithin, assertValid, assertValidSet } from '#lib/validation'
import config from '#src/lib/config.iso'

export const authEndpoint = `${config.apiPrefix}/auth`
export const authLoginEndpoint = `${authEndpoint}/login`
export const authRefreshEndpoint = `${authEndpoint}/refresh`
export const authRegisterEndpoint = `${authEndpoint}/register`

export enum DbUserRoleEnum {
  ADMIN = '_admin',
}
export const DbUserRoleSet = new Set(Enum.getEnumValues(DbUserRoleEnum))

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
	email: 'tenant@hookedjs.org',
	password: 'password',
})
export const LoginPropsEnum = Enum.getEnumFromClassInstance(LoginPropsExample)


export class RegisterProps {
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

