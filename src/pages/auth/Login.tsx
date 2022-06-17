import {Logo} from '#src/layout/components/Logo'
import {ErrorMessage, FormJson, InputField, SubmitButton, useForm} from '#src/lib/forms'
import {useCallback} from '#src/lib/hooks'
import pstyled from '#src/lib/pstyled'
import qs from '#src/lib/queryStrings'
import {nav} from '#src/lib/router'
import {LoginProps, LoginPropsEnum, LoginPropsExample} from '#src/pouch'
import {Paths} from '#src/routes'
import {AuthStore, ToastStore, useAuthStore} from '#src/stores'
import {h} from 'preact'

export default function Login() {
  const {from} = qs.parse()
  const [auth] = useAuthStore()
  const Form = useForm()
  const onSubmit = useCallback(_onSubmit, [])

  const {submitting, errors} = Form.state

  if (auth.name) nav(from || Paths.Dashboard, {replace: true})

  return (
    <LoginDiv>
      <Logo size={4} style={{margin: '0 -10px 10px', textAlign: 'center', display: 'block'}} />
      <Form.Component onSubmitJson={onSubmit}>
        <InputField
          name={LoginPropsEnum.name}
          labelText="Email"
          inputProps={{
            placeholder: LoginPropsExample.name,
            defaultValue: LoginPropsExample.name,
            autoFocus: true,
          }}
          disabled={submitting}
          error={errors[LoginPropsEnum.name]?.note}
        />
        <InputField
          name={LoginPropsEnum.password}
          labelText="Password"
          inputProps={{
            type: 'password',
            placeholder: '********',
            defaultValue: LoginPropsExample.password,
          }}
          disabled={submitting}
          error={errors[LoginPropsEnum.password]?.note}
        />
        <SubmitButton>Login</SubmitButton>
        <ErrorMessage errors={errors} />
      </Form.Component>
      <div>
        <a href={`${Paths.Register}${location.search}#replace`}>Need an account?</a>
        <br />
        <a href={`${Paths.ForgotPassword}${location.search}#replace`}>Forgot your password?</a>
      </div>
    </LoginDiv>
  )

  async function _onSubmit(formValues: FormJson) {
    const values = new LoginProps(formValues)
    await AuthStore.login(values)
    ToastStore.setValue({message: 'Welcome to Stacks!', placement: 'right'})
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
