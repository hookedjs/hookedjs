import {ErrorMessage, FormJson, InputField, SubmitButton, useForm} from '#src/lib/forms'
import {useCallback} from '#src/lib/hooks'
import {RouteType, getParentPath, nav} from '#src/lib/router'
import {assertAttrsWithin, assertValid, assertValidSet} from '#src/lib/validation'
import {ToastStore} from '#src/stores'
import {Fragment as F, h} from 'preact'

import PaddedPage from './components/PaddedPage'
import Section from './components/Section'

export default function FillerCreateFactory({route}: {route: RouteType}) {
  const parent = getParentPath()
  const Form = useForm()
  const onSubmit = useCallback(_onSubmit, [])

  const {submitting, errors} = Form.state

  return (
    <PaddedPage>
      <Section header1={route.title} fullHeight backButton>
        <Form.Component onSubmitJson={onSubmit}>
          <InputField
            name={CreatePropsEnum.title}
            labelText="Title"
            inputProps={{
              type: 'text',
              autoFocus: true,
            }}
            disabled={submitting}
            error={errors[CreatePropsEnum.title]?.note}
          />
          <SubmitButton>Submit</SubmitButton>
          <ErrorMessage errors={errors} />
        </Form.Component>
      </Section>
    </PaddedPage>
  )

  async function _onSubmit(formValues: FormJson) {
    const values = new CreateProps(formValues)
    ToastStore.setValue({
      message: 'Record created!',
      icon: 'success',
      duration: 3e3,
      placement: 'right',
    })
    dispatchEvent(new Event('#stack-pop'))
    nav(parent + '/home', {replace: true})
  }
}

const recordPlaceholder = {
  title: 'Placeholder',
} as const

export class CreateProps {
  title = ''
  constructor(props: any) {
    assertAttrsWithin(props, this)
    assertValidSet<CreateProps>(props, {
      title: assertValid('title', props.title, ['isDefined', 'isString'], {
        isLongerThan: 2,
        isShorterThan: 30,
      }),
    })
    Object.assign(this, props)
  }
}
export const CreatePropsPlaceholder = new CreateProps({
  title: recordPlaceholder.title,
})
export const CreatePropsEnum = Enum.getEnumFromClassInstance(CreatePropsPlaceholder)
