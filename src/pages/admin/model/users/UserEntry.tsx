import CodeSnippet from '#src/layout/components/CodeSnippet'
import PaddedPage from '#src/layout/components/PaddedPage'
import Section from '#src/layout/components/Section'
import {ErrorMessage, InputField, SubmitButton, useForm} from '#src/lib/forms'
import {useCallback} from '#src/lib/hooks'
import qs from '#src/lib/queryStrings'
import {PageMetaStore, RouteType} from '#src/lib/router'
import {IUserExtra, User, UserFieldsEnum, UserStatusEnum, useUserS} from '#src/pouch'
import type {IStandardFields} from '#src/pouch/lib/Database'
import {ToastStore} from '#src/stores'
import {ComponentChildren, h} from 'preact'

export default function UserEntry({route}: {route: RouteType}) {
  const name = route.vars?.name
  const entry = name
    ? useUserS('org.couchdb.user:' + name)[0]
    : new User({
        _id: '',
        name: '',
        surname: '',
        givenName: '',
        roles: [],
        status: UserStatusEnum.ACTIVE,
      })

  PageMetaStore.value = {title: entry.fullName}

  const Form = useForm()
  const onSubmit = useCallback(onSubmitCb, [])

  const {submitting, errors} = Form.state

  return (
    <PaddedPage>
      <Section header1={route.title} backButton>
        <Form.Component onSubmitJson={onSubmit as any}>
          {Fields()}
          <SubmitButton>{name ? 'Save' : 'Submit'}</SubmitButton>
          <ErrorMessage errors={errors} />
        </Form.Component>
      </Section>

      {!!name && (
        <Section header1="JSON">
          <CodeSnippet snippet={entry.values} />
        </Section>
      )}
    </PaddedPage>
  )

  async function onSubmitCb(formValues: Record<keyof (Pick<IStandardFields, '_id' | 'deletedAt'> & IUserExtra), any>) {
    // _id is calculated from name in _users
    formValues._id = 'org.couchdb.user:' + formValues.name

    // Scrub optional fields that are empty
    if (!formValues.deletedAt) delete formValues.deletedAt
    if (!formValues.password) delete formValues.password
    if (!formValues.password_scheme) delete formValues.password_scheme
    if (!formValues.iterations) delete formValues.iterations
    if (!formValues.derived_key) delete formValues.derived_key
    if (!formValues.salt) delete formValues.salt
    if (!formValues.passwordTmp) delete formValues.passwordTmp
    if (!formValues.passwordTmpAt) delete formValues.passwordTmpAt
    if (!formValues.passwordTmpFailCount) delete formValues.passwordTmpFailCount
    if (!formValues.bannedAt) delete formValues.bannedAt
    if (!formValues.bannedReason) delete formValues.bannedReason

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
    const fields: Record<keyof (Pick<IStandardFields, '_id' | 'deletedAt'> & IUserExtra), ComponentChildren> = {
      _id: (
        <InputField
          name={UserFieldsEnum._id}
          labelText="_id"
          inputProps={{defaultValue: entry._id}}
          disabled={true}
          hidden={true}
          error={errors[UserFieldsEnum._id]?.note}
        />
      ),
      type: (
        <InputField
          name={UserFieldsEnum.type}
          labelText="type"
          inputProps={{defaultValue: entry.type}}
          disabled={true}
          hidden={true}
          error={errors[UserFieldsEnum.type]?.note}
        />
      ),
      name: (
        <InputField
          name={UserFieldsEnum.name}
          labelText="Email"
          inputProps={{autoFocus: !name, type: 'email', defaultValue: entry.name}}
          disabled={!!name || submitting}
          error={errors[UserFieldsEnum.name]?.note}
        />
      ),
      password: (
        <InputField
          name={UserFieldsEnum.password}
          labelText="Password"
          inputProps={{autoFocus: !!name, defaultValue: entry.password}}
          disabled={submitting}
          error={errors[UserFieldsEnum.password]?.note}
        />
      ),
      password_scheme: (
        <InputField
          name={UserFieldsEnum.password_scheme}
          labelText="password_scheme"
          inputProps={{defaultValue: entry.password_scheme}}
          disabled={true}
          hidden={true}
          error={errors[UserFieldsEnum.password_scheme]?.note}
        />
      ),
      iterations: (
        <InputField
          name={UserFieldsEnum.iterations}
          labelText="iterations"
          inputProps={{type: 'number', defaultValue: entry.iterations}}
          disabled={true}
          hidden={true}
          error={errors[UserFieldsEnum.iterations]?.note}
        />
      ),
      derived_key: (
        <InputField
          name={UserFieldsEnum.derived_key}
          labelText="derived_key"
          inputProps={{defaultValue: entry.derived_key}}
          disabled={true}
          hidden={true}
          error={errors[UserFieldsEnum.derived_key]?.note}
        />
      ),
      salt: (
        <InputField
          name={UserFieldsEnum.salt}
          labelText="salt"
          inputProps={{defaultValue: entry.salt}}
          disabled={true}
          hidden={true}
          error={errors[UserFieldsEnum.salt]?.note}
        />
      ),
      passwordTmp: (
        <InputField
          name={UserFieldsEnum.passwordTmp}
          labelText="Temp Password"
          inputProps={{defaultValue: entry.passwordTmp}}
          disabled={submitting}
          error={errors[UserFieldsEnum.passwordTmp]?.note}
        />
      ),
      passwordTmpAt: (
        <InputField
          name={UserFieldsEnum.passwordTmpAt}
          labelText="Temp password created At"
          inputProps={{
            type: 'date',
            defaultValue: entry.passwordTmpAt?.toISOString() ?? '',
          }}
          disabled={submitting}
          error={errors[UserFieldsEnum.passwordTmpAt]?.note}
        />
      ),
      passwordTmpFailCount: (
        <InputField
          name={UserFieldsEnum.passwordTmpFailCount}
          labelText="Temp password failed login Attempts"
          inputProps={{
            defaultValue: entry.passwordTmpFailCount,
            type: 'number',
          }}
          disabled={submitting}
          error={errors[UserFieldsEnum.passwordTmpFailCount]?.note}
        />
      ),
      givenName: (
        <InputField
          name={UserFieldsEnum.givenName}
          labelText="First Name"
          inputProps={{defaultValue: entry.givenName}}
          disabled={submitting}
          error={errors[UserFieldsEnum.givenName]?.note}
        />
      ),
      surname: (
        <InputField
          name={UserFieldsEnum.surname}
          labelText="Last Name"
          inputProps={{defaultValue: entry.surname}}
          disabled={submitting}
          error={errors[UserFieldsEnum.surname]?.note}
        />
      ),
      roles: (
        <InputField
          name={UserFieldsEnum.roles}
          labelText="Roles"
          inputProps={{defaultValue: entry.roles.join(), isarray: true}}
          disabled={submitting}
          error={errors[UserFieldsEnum.roles]?.note}
        />
      ),
      status: (
        <InputField
          name={UserFieldsEnum.status}
          labelText="Status"
          inputProps={{defaultValue: entry.status}}
          disabled={submitting}
          error={errors[UserFieldsEnum.status]?.note}
        />
      ),
      deletedAt: (
        <InputField
          name={UserFieldsEnum.deletedAt}
          labelText="Deleted At"
          inputProps={{
            type: 'date',
            defaultValue: entry.deletedAt?.toISOString() ?? '',
          }}
          disabled={submitting}
          error={errors[UserFieldsEnum.deletedAt]?.note}
        />
      ),
      bannedAt: (
        <InputField
          name={UserFieldsEnum.bannedAt}
          labelText="Banned At"
          inputProps={{
            type: 'date',
            defaultValue: entry.bannedAt?.toISOString() ?? '',
          }}
          disabled={submitting}
          error={errors[UserFieldsEnum.bannedAt]?.note}
        />
      ),
      bannedReason: (
        <InputField
          name={UserFieldsEnum.bannedReason}
          labelText="Banned Reason"
          inputProps={{defaultValue: entry.bannedReason}}
          disabled={submitting}
          error={errors[UserFieldsEnum.bannedReason]?.note}
        />
      ),
    }
    return Object.values(fields)
  }
}
