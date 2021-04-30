import { UserRole, UserRoleSet } from '../../../../db/types'
import env from '../../../../lib/config'
import { assertAttrsWithin, assertValid, assertValidSet } from '../../../../lib/validation'
export const usersEndpoint = `${env.apiPrefix}/admin/users`

export class UserCreateProps {
		email = ''
		password = ''
		roles: UserRole[] = []
		givenName = ''
		surname = ''
		acceptedTerms = false
		constructor(props: any) {
			assertAttrsWithin(props, this)
			assertValidSet<UserCreateProps>(props, {
				email: assertValid('email', props.email, ['isDefined', 'isString', 'isEmail']),
				password: assertValid('password', props.password, ['isDefined', 'isString', 'isNoneEmpty', 'isPassword']),
				roles: assertValid('roles', props.roles, ['isRequired', 'isArray', 'isNoneEmpty'], { arrayValuesAreOneOfSet: UserRoleSet }),
				givenName: assertValid('givenName', props.givenName, ['isDefined', 'isString', 'isNoneEmpty']),
				surname: assertValid('surname', props.surname, ['isDefined', 'isString', 'isNoneEmpty']),
				acceptedTerms: assertValid('acceptedTerms', props.acceptedTerms, ['isDefined', 'isBoolean', 'isTruthy']),
			})
			Object.assign(this, props)
		}
}
export const UserCreatePropsExample = new UserCreateProps({
	email: 'admin@example.com',
	password: 'Password8',
	roles: [UserRole.ADMIN],
	givenName: 'Sally',
	surname: 'Fields',
	acceptedTerms: true,
})
export const UserCreatePropsEnum = Enum.getEnumFromClassInstance(UserCreatePropsExample)

