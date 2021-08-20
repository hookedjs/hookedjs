import { h } from 'preact'

import { Logo } from '#layout/components/Logo'
import { ErrorMessage, FormJson, InputField, SubmitButton, useForm } from '#lib/forms'
import { useCallback } from '#lib/hooks'
import qs from '#lib/queryStrings'
import { nav } from '#lib/router'
import pstyled from '#src/lib/pstyled'
import { LoginProps, LoginPropsEnum, LoginPropsExample } from '#src/pouch'
import { Paths } from '#src/routes'
import { AuthStore, ToastStore, useAuthStore } from '#src/stores'

export default function Login() {
	const { from } = qs.parse()
	const [auth] = useAuthStore()
	const Form = useForm()
	const onSubmit = useCallback(_onSubmit, [])
	
	const { submitting, errors } = Form.state
	
	if (auth.username) nav(from || Paths.Dashboard, { replace: true })

	return <LoginDiv>
		<Logo size={4} style={{margin: '0 -10px 10px', textAlign: 'center', display: 'block'}} />
		<Form.Component onSubmitJson={onSubmit}>
			<InputField
				name={LoginPropsEnum.email}
				labelText="Email"
				inputProps={{
					placeholder: LoginPropsExample.email,
					defaultValue: LoginPropsExample.email,
					autoFocus: true,
				}}
				disabled={submitting}
				error={errors[LoginPropsEnum.email]?.note}
			/>
			<InputField
				name={LoginPropsEnum.password}
				labelText="Password"
				inputProps={{
					type: 'password',
					placeholder: '********',
					value: LoginPropsExample.password,
				}}
				disabled={submitting}
				error={errors[LoginPropsEnum.password]?.note}
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
		await AuthStore.login(values)
		ToastStore.setValue({ message: 'Welcome to Stacks!', placement: 'right' })
	}
}
const LoginDiv = pstyled.div`
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
