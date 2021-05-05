import config from '#lib/config'
import { assertAttrsWithin, assertValid, assertValidSet } from '#lib/validation'

export const profileEndpoint = `${config.apiPrefix}/auth/profile`

export class ProfilePatchProps {
		email = ''
		password = ''
		givenName = ''
		surname = ''
		constructor(props: any) {
			assertAttrsWithin(props, this)
			assertValidSet<ProfilePatchProps>(props, {
				email: 'email' in props && assertValid('email', props.email, ['isDefined', 'isString', 'isEmail']),
				password: 'password' in props && assertValid('password', props.password, ['isDefined', 'isString', 'isNoneEmpty', 'isPassword']),
				givenName: 'givenName' in props && assertValid('givenName', props.givenName, ['isDefined', 'isString', 'isNoneEmpty']),
				surname: 'surname' in props && assertValid('surname', props.surname, ['isDefined', 'isString', 'isNoneEmpty']),
			})
			Object.assign(this, props)
			Object.rmFalseyAttrs(this, true)
		}
}
export const ProfilePatchPropsExample: ProfilePatchProps = {
	email: 'admin@example.com',
	password: 'Password8',
	givenName: 'Sally',
	surname: 'Fields',
}
export const ProfilePatchPropsEnum = Enum.getEnumFromClassInstance(ProfilePatchPropsExample)

