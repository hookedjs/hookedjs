import CodeSnippet from '#src/layout/components/CodeSnippet'
import PaddedPage from '#src/layout/components/PaddedPage'
import Section from '#src/layout/components/Section'
import {ErrorMessage, InputField, SubmitButton, useForm} from '#src/lib/forms'
import {useCallback} from '#src/lib/hooks'
import qs from '#src/lib/queryStrings'
import {PageMetaStore, RouteType} from '#src/lib/router'
import {ITenantExtra, Tenant, TenantFieldsEnum, TenantStatusEnum, useTenantS} from '#src/pouch'
import type {IStandardFields} from '#src/pouch/lib/Database'
import {ToastStore} from '#src/stores'
import {ComponentChildren, h} from 'preact'

export default function TenantEntry({route}: {route: RouteType}) {
  const {id} = qs.parse<Record<string, string>>()
  const entry = id
    ? useTenantS(id)[0]
    : new Tenant({
        _id: '',
        name: '',
        status: TenantStatusEnum.ACTIVE,
      })

  PageMetaStore.value = {title: entry.name}

  const Form = useForm()
  const onSubmit = useCallback(onSubmitCb, [])

  const {submitting, errors} = Form.state

  return (
    <PaddedPage>
      <Section header1={route.title} backButton>
        <Form.Component onSubmitJson={onSubmit as any}>
          {Fields()}
          <SubmitButton>{id ? 'Save' : 'Submit'}</SubmitButton>
          <ErrorMessage errors={errors} />
        </Form.Component>
      </Section>

      {!!id && (
        <Section header1="JSON">
          <CodeSnippet snippet={entry.values} />
        </Section>
      )}
    </PaddedPage>
  )

  async function onSubmitCb(formValues: Record<keyof (Pick<IStandardFields, '_id' | 'deletedAt'> & ITenantExtra), any>) {
    // Scrub optional fields that are empty
    if (!formValues.deletedAt) delete formValues.deletedAt

    Object.assign(entry, formValues)
    await entry.save()
    ToastStore.setValue({
      message: 'Record saved!',
      icon: 'success',
      duration: 3e3,
      placement: 'right',
    })
    dispatchEvent(new Event('#stack-back'))
  }

  function Fields() {
    const fields: Record<keyof (Pick<IStandardFields, '_id'> & ITenantExtra), ComponentChildren> = {
      _id: (
        <InputField
          name={TenantFieldsEnum._id}
          labelText="_id"
          inputProps={{defaultValue: entry._id}}
          disabled={true}
          hidden={true}
          error={errors[TenantFieldsEnum._id]?.note}
        />
      ),
      name: (
        <InputField
          name={TenantFieldsEnum.name}
          labelText="Email"
          inputProps={{autoFocus: !id, type: 'email', defaultValue: entry.name}}
          disabled={!!id || submitting}
          error={errors[TenantFieldsEnum.name]?.note}
        />
      ),
      status: (
        <InputField
          name={TenantFieldsEnum.status}
          labelText="Status"
          inputProps={{defaultValue: entry.status}}
          disabled={submitting}
          error={errors[TenantFieldsEnum.status]?.note}
        />
      ),
    }
    return Object.values(fields)
  }
}
