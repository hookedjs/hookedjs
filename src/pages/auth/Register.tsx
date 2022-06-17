import {Logo} from '#src/layout/components/Logo'
import {BooleanField, ErrorMessage, FormJson, InputField, SubmitButton, useForm} from '#src/lib/forms'
import {useCallback} from '#src/lib/hooks'
import pstyled from '#src/lib/pstyled'
import qs from '#src/lib/queryStrings'
import {nav} from '#src/lib/router'
import {RegisterProps, RegisterPropsEnum, RegisterPropsExample} from '#src/pouch'
import {Paths} from '#src/routes'
import {AuthStore, ToastStore, useAuthStore} from '#src/stores'
import {h} from 'preact'

export default function Register() {
  const {from} = qs.parse()
  const [auth] = useAuthStore()
  const Form = useForm()
  const onSubmit = useCallback(_onSubmit, [])

  const {submitting, errors} = Form.state

  if (auth.name) nav(from || Paths.Dashboard, {replace: true})

  return (
    <RegisterDiv>
      <Logo size={4} style={{margin: '0 -10px 10px', textAlign: 'center', display: 'block'}} />
      <Form.Component onSubmitJson={onSubmit}>
        <InputField
          name={RegisterPropsEnum.givenName}
          labelText="First Name"
          inputProps={{
            placeholder: RegisterPropsExample.givenName,
            defaultValue: RegisterPropsExample.givenName,
            autoFocus: true,
          }}
          disabled={submitting}
          error={errors[RegisterPropsEnum.givenName]?.note}
        />
        <InputField
          name={RegisterPropsEnum.surname}
          labelText="Last Name"
          inputProps={{
            placeholder: RegisterPropsExample.surname,
            defaultValue: RegisterPropsExample.surname,
          }}
          disabled={submitting}
          error={errors[RegisterPropsEnum.surname]?.note}
        />
        <InputField
          name={RegisterPropsEnum.name}
          labelText="Email"
          inputProps={{
            type: 'email',
            placeholder: RegisterPropsExample.name,
            defaultValue: RegisterPropsExample.name,
          }}
          disabled={submitting}
          error={errors[RegisterPropsEnum.name]?.note}
        />
        <BooleanField
          inputProps={{
            name: RegisterPropsEnum.acceptedTerms,
            disabled: submitting,
            'aria-label': 'Do you agree to the terms at the following link? {put link here}',
          }}
          labelText={
            <span>
              Do you agree to these
              <br />
              terms?
            </span>
          }
          error={errors[RegisterPropsEnum.acceptedTerms]?.note}
        />
        <SubmitButton>Register</SubmitButton>
        <ErrorMessage errors={errors} />
      </Form.Component>
      <a href={`${Paths.Login}${location.search}#replace`}>Have an account?</a>
      <br />
      <a href={`${Paths.ForgotPassword}${location.search}#replace`}>Forgot your password?</a>
    </RegisterDiv>
  )

  async function _onSubmit(formValues: FormJson) {
    const values = new RegisterProps(formValues)
    await AuthStore.register(values)
    ToastStore.setValue({message: 'Welcome to Stacks!', placement: 'right'})
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
