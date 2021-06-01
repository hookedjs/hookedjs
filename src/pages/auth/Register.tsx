import { h } from 'preact'
import { useCallback } from 'preact/hooks'

import { Logo } from '#layout/components/Logo'
import { BooleanField, ErrorMessage, FormJson, SubmitButton, TextField, useForm } from '#lib/forms'
import qs from '#lib/queryStrings'
import { nav } from '#lib/router'
import styled from '#lib/styled'
import { assertAttrsWithin, assertValid, assertValidSet } from '#src/lib/validation'
import { Paths } from '#src/routes'
import { AuthStore, ToastStore } from '#src/stores'
import { Roles } from '#src/stores'

export default function Register() {
	const { from } = qs.parse()
	const [auth] = AuthStore.use()
	const Form = useForm()
	const onSubmit = useCallback(_onSubmit, [])
	
	const { submitting, errors } = Form.state

	if (auth.id) nav(from || Paths.Dashboard, { replace: true })

	return <RegisterDiv>
		<Logo size={4} style={{ margin: '0 -10px 10px', textAlign: 'center', display: 'block' }} />
		<Form.Component onSubmitJson={onSubmit}>
			<TextField
				name={RegisterPropsEnum.givenName}
				labelText="First Name"
				inputProps={{
					type: 'text',
					placeholder: RegisterPropsPlaceholder.givenName,
					value: RegisterPropsPlaceholder.givenName,
					autoFocus: true,
				}}
				disabled={submitting}
				error={errors[RegisterPropsEnum.givenName]?.note}
			/>
			<TextField
				name={RegisterPropsEnum.surname}
				labelText="Last Name"
				inputProps={{
					type: 'text',
					placeholder: RegisterPropsPlaceholder.surname,
					value: RegisterPropsPlaceholder.surname,
				}}
				disabled={submitting}
				error={errors[RegisterPropsEnum.surname]?.note}
			/>
			<TextField
				name={RegisterPropsEnum.email}
				labelText="Email"
				inputProps={{
					type: 'text',
					placeholder: RegisterPropsPlaceholder.email,
					value: RegisterPropsPlaceholder.email,
				}}
				disabled={submitting}
				error={errors[RegisterPropsEnum.email]?.note}
			/>
			<TextField
				name={RegisterPropsEnum.password}
				labelText="Password"
				inputProps={{
					type: 'password',
					placeholder: '********',
					value: RegisterPropsPlaceholder.password,
				}}
				disabled={submitting}
				error={errors[RegisterPropsEnum.password]?.note}
			/>
			<BooleanField
				inputProps={{ name: RegisterPropsEnum.acceptedTerms, disabled: submitting, 'aria-label': 'Do you agree to the terms at the following link? {put link here}'}}
				labelText={<span>Do you agree to these<br/>terms?</span>}
				error={errors[RegisterPropsEnum.acceptedTerms]?.note}
			/>
			<BooleanField
				inputProps={{ name: RegisterPropsEnum.asAdmin, disabled: submitting, 'aria-label': 'Sign-in as tenant?' }}
				labelText='Tenant Mode'
				checkedLabelText='Admin Mode'
				error={errors[RegisterPropsEnum.asAdmin]?.note}
				type="switch"
			/>
			<SubmitButton class="large">Register</SubmitButton>
			<ErrorMessage>{errors.form?.note}</ErrorMessage>
		</Form.Component>
		<a href={`${Paths.Login}${location.search}#replace`}>Have an account?</a><br />
		<a href={`${Paths.ForgotPassword}${location.search}#replace`}>Forgot your password?</a>
	</RegisterDiv>

	async function _onSubmit(formValues: FormJson) {
		const values = new RegisterProps(formValues)
		if (values.asAdmin) AuthStore.loginAsAdmin()
		else AuthStore.loginAsTenant()
		ToastStore.value = { message: 'Welcome to Stacks!', location: 'right' }
	}
}
const RegisterDiv = styled.div`
	:root input:not([type="checkbox"])
		width: 100%
	:root form svg.empty
		fill: var(--gray6)
	@media (max-width: 700px)
		:root form
			margin-top: 20px
`

const userPlaceholder = {
	email: 'admin@example.com',
	roles: [Roles.admin],
	password: 'Password8',
	givenName: 'Sally',
	surname: 'Fields',
} as const

export class RegisterProps {
	email = ''
	password = ''
	givenName = ''
	surname = ''
	acceptedTerms = ''
	asAdmin = ''
	constructor(props: any) {
		assertAttrsWithin(props, this)
		assertValidSet<RegisterProps>(props, {
			email: assertValid('email', props.email, ['isDefined', 'isString', 'isEmail']),
			password: assertValid('password', props.password, ['isDefined', 'isString', 'isNoneEmpty', 'isPassword']),
			givenName: assertValid('givenName', props.givenName, ['isDefined', 'isString', 'isNoneEmpty']),
			surname: assertValid('surname', props.surname, ['isDefined', 'isString', 'isNoneEmpty']),
			acceptedTerms: assertValid('accept terms', props.acceptedTerms, ['isDefined', 'isBoolean', 'isTruthy']),
			asAdmin: assertValid('asAdmin', props.asAdmin, ['isDefined', 'isBoolean']),
		})
		Object.assign(this, props)
	}
}
export const RegisterPropsPlaceholder = new RegisterProps({
	email: userPlaceholder.email,
	password: userPlaceholder.password,
	givenName: userPlaceholder.givenName,
	surname: userPlaceholder.surname,
	acceptedTerms: true,
	asAdmin: false,
})
export const RegisterPropsEnum = Enum.getEnumFromClassInstance(RegisterPropsPlaceholder)
