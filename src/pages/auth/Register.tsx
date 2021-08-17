import { h } from 'preact'

import { Logo } from '#layout/components/Logo'
import { BooleanField, ErrorMessage, FormJson, SubmitButton, InputField, useForm } from '#lib/forms'
import { useCallback } from '#lib/hooks'
import qs from '#lib/queryStrings'
import { nav } from '#lib/router'
import pstyled from '#src/lib/pstyled'
import { RegisterProps, RegisterPropsEnum, RegisterPropsExample } from '#src/pouch'
import { Paths } from '#src/routes'
import { AuthStore, ToastStore, useAuthStore } from '#src/stores'

export default function Register() {
	const { from } = qs.parse()
	const [auth] = useAuthStore()
	const Form = useForm()
	const onSubmit = useCallback(_onSubmit, [])
	
	const { submitting, errors } = Form.state

	if (auth.username) nav(from || Paths.Dashboard, { replace: true })

	return <RegisterDiv>
		<Logo size={4} style={{ margin: '0 -10px 10px', textAlign: 'center', display: 'block' }} />
		<Form.Component onSubmitJson={onSubmit}>
			<InputField
				name={RegisterPropsEnum.givenName}
				labelText="First Name"
				inputProps={{
					type: 'text',
					placeholder: RegisterPropsExample.givenName,
					value: RegisterPropsExample.givenName,
					autoFocus: true,
				}}
				disabled={submitting}
				error={errors[RegisterPropsEnum.givenName]?.note}
			/>
			<InputField
				name={RegisterPropsEnum.surname}
				labelText="Last Name"
				inputProps={{
					type: 'text',
					placeholder: RegisterPropsExample.surname,
					value: RegisterPropsExample.surname,
				}}
				disabled={submitting}
				error={errors[RegisterPropsEnum.surname]?.note}
			/>
			<InputField
				name={RegisterPropsEnum.email}
				labelText="Email"
				inputProps={{
					type: 'text',
					placeholder: RegisterPropsExample.email,
					value: RegisterPropsExample.email,
				}}
				disabled={submitting}
				error={errors[RegisterPropsEnum.email]?.note}
			/>
			<InputField
				name={RegisterPropsEnum.password}
				labelText="Password"
				inputProps={{
					type: 'password',
					placeholder: '********',
					value: RegisterPropsExample.password,
				}}
				disabled={submitting}
				error={errors[RegisterPropsEnum.password]?.note}
			/>
			<BooleanField
				inputProps={{ name: RegisterPropsEnum.acceptedTerms, disabled: submitting, 'aria-label': 'Do you agree to the terms at the following link? {put link here}'}}
				labelText={<span>Do you agree to these<br/>terms?</span>}
				error={errors[RegisterPropsEnum.acceptedTerms]?.note}
			/>
			<SubmitButton class="large">Register</SubmitButton>
			<ErrorMessage>{errors.form?.note}</ErrorMessage>
		</Form.Component>
		<a href={`${Paths.Login}${location.search}#replace`}>Have an account?</a><br />
		<a href={`${Paths.ForgotPassword}${location.search}#replace`}>Forgot your password?</a>
	</RegisterDiv>

	async function _onSubmit(formValues: FormJson) {
		const values = new RegisterProps(formValues)
		await AuthStore.register(values)
		ToastStore.setValue({ message: 'Welcome to Stacks!', location: 'right' })
	}
}
const RegisterDiv = pstyled.div`
	:root input:not([type="checkbox"])
		width: 100%
	:root form svg.empty
		fill: var(--gray6)
	@media (max-width: 700px)
		:root form
			margin-top: 20px
`
