import { Fragment as F, h } from 'preact'
import { useCallback } from 'preact/hooks'

import { Logo } from '#lay/components/Logo'
import { BooleanField, ErrorMessage, FormJson, SubmitButton, TextField, useForm } from '#lib/forms'
import qs from '#lib/queryStrings'
import { nav } from '#lib/router'
import styled from '#lib/styled'
import { assertAttrsWithin, assertValid, assertValidSet } from '#src/lib/validation'
import { Paths } from '#src/routes'
import { AuthStore, ToastStore } from '#src/stores'
import { Roles } from '#src/stores'

export default function Login() {
	const { from } = qs.parse()
	const [auth] = AuthStore.use()
	const Form = useForm()
	const onSubmit = useCallback(_onSubmit, [])
	
	const { submitting, errors } = Form.state
	
	if (auth.id) nav(from || Paths.Dashboard, { replace: true })

	return <LoginDiv>
		<Logo size={4} style={{margin: '0 -10px 10px', textAlign: 'center', display: 'block'}} />
		<Form.Component onSubmitJson={onSubmit}>
			<TextField
				name={LoginPropsEnum.email}
				labelText="Email"
				inputProps={{
					type: 'text',
					placeholder: LoginPropsPlaceholder.email,
					value: LoginPropsPlaceholder.email,
					autoFocus: true,
				}}
				disabled={submitting}
				error={errors[LoginPropsEnum.email]?.note}
			/>
			<TextField
				name={LoginPropsEnum.password}
				labelText="Password"
				inputProps={{
					type: 'password',
					placeholder: '********',
					value: LoginPropsPlaceholder.password,
				}}
				disabled={submitting}
				error={errors[LoginPropsEnum.password]?.note}
			/>
			<BooleanField
				inputProps={{
					name: LoginPropsEnum.asAdmin, 
					disabled: submitting, 
					'aria-label': 'Sign-in as tenant?' 
				}}
				labelText='Tenant Mode'
				checkedLabelText='Admin Mode'
				error={errors[LoginPropsEnum.asAdmin]?.note}
				type="switch"
			/>
			<SubmitButton class="large">Login</SubmitButton>
			<ErrorMessage>{errors.form?.note}</ErrorMessage>
		</Form.Component>
		<div>
			<a href={`${Paths.Register}${location.search}#replace`}>Need an account?</a><br />
			<a href={`${Paths.ForgotPassword}${location.search}#replace`}>Forgot your password?</a>
		</div>
	</LoginDiv>

	async function _onSubmit(formValues: FormJson) {
		const values = new LoginProps(formValues)
		if (values.asAdmin) AuthStore.loginAsAdmin()
		else AuthStore.loginAsTenant()
		ToastStore.value = { message: 'Welcome to Stacks!', location: 'right' }
	}
}
const LoginDiv = styled.div`
	:root input:not([type="checkbox"])
		width: 100%
	:root form svg.empty
		fill: var(--gray6)
	@media (max-width: 700px)
		:root
			margin-top: 5vh
		:root form
			margin-top: 20px
`

export class LoginProps {
	email = ''
	password = ''
	asAdmin = false
	constructor(props: any) {
		assertAttrsWithin(props, this)
		assertValidSet<LoginProps>(props, {
			email: assertValid('email', props.email, ['isDefined', 'isString', 'isEmail']),
			password: assertValid('password', props.password, ['isDefined', 'isString', 'isNoneEmpty']),
			asAdmin: assertValid('asAdmin', props.asAdmin, ['isDefined', 'isBoolean']),
		})
		Object.assign(this, props)
	}
}
export const LoginPropsPlaceholder = new LoginProps({
	email: 'admin@example.com',
	password: 'Password8',
	asAdmin: false,
})
export const LoginPropsEnum = Enum.getEnumFromClassInstance(LoginPropsPlaceholder)