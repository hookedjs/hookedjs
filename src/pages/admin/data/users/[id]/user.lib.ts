import { UserRoleEnum, UserRoleSet } from '#src/db/types'
import env from '#src/lib/config'
import { assertAttrsWithin, assertValid, assertValidSet } from '#src/lib/validation'

export const userEndpoint = `${env.apiPrefix}/admin/users`
export function userByIdEndpoint(id: string) { return `${userEndpoint}/${id}` }
export function userRestoreEndpoint(id: string) { return `${userEndpoint}/${id}/restore` }

export class UserPatchProps {
		email = ''
		password = ''
		roles: UserRoleEnum[] = null as any
		givenName = ''
		surname = ''
		constructor(props: any) {
			assertAttrsWithin(props, this)
			assertValidSet<UserPatchProps>(props, {
				email: 'email' in props && assertValid('email', props.email, ['isDefined', 'isString', 'isEmail']),
				password: 'password' in props && assertValid('password', props.password, ['isDefined', 'isString', 'isNoneEmpty', 'isPassword']),
				roles: 'roles' in props && assertValid('roles', props.roles, ['isRequired', 'isArray', 'isNoneEmpty'], { arrayValuesAreOneOfSet: UserRoleSet }),
				givenName: 'givenName' in props && assertValid('givenName', props.givenName, ['isDefined', 'isString', 'isNoneEmpty']),
				surname: 'surname' in props && assertValid('surname', props.surname, ['isDefined', 'isString', 'isNoneEmpty']),
			})
			Object.assign(this, props)
			Object.rmFalseyAttrs(this, true)
		}
}
export const UserPatchPropsExample = new UserPatchProps({
	email: 'admin@example.com',
	password: 'Password8',
	roles: [UserRoleEnum.ADMIN],
	givenName: 'Sally',
	surname: 'Fields',
})
export const UserPatchPropsEnum = Enum.getEnumFromClassInstance(UserPatchPropsExample)

