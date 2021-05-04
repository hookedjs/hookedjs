import { UserRoleEnum, UserRoleSet } from '#src/db/types'
import env from '#src/lib/config'
import { assertAttrsWithin, assertValid, assertValidSet } from '#src/lib/validation'

export const usersEndpoint = `${env.apiPrefix}/admin/users`

export class UserPostProps {
		email = ''
		password = ''
		roles: UserRoleEnum[] = []
		givenName = ''
		surname = ''
		acceptedTerms = false
		constructor(props: any) {
			assertAttrsWithin(props, this)
			assertValidSet<UserPostProps>(props, {
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
export const UserPostPropsExample = new UserPostProps({
	email: 'admin@example.com',
	password: 'Password8',
	roles: [UserRoleEnum.ADMIN],
	givenName: 'Sally',
	surname: 'Fields',
	acceptedTerms: true,
})
export const UserPostPropsEnum = Enum.getEnumFromClassInstance(UserPostPropsExample)

