import { Fragment as F, h } from 'preact'

import PaddedPage from '#layout/components/PaddedPage'
import Section from '#layout/components/Section'
import qs from '#lib/queryStrings'
import {PageMetaStore, RouteType} from '#lib/router'
import CodeSnippet from '#src/layout/components/CodeSnippet'
import { ErrorMessage, InputField, SubmitButton, useForm } from '#src/lib/forms'
import { useCallback } from '#src/lib/hooks'
import { throwValidationErrorSet, ValueError } from '#src/lib/validation'
import { AuthUser, AuthUserFieldsEnum, AuthUsers, AuthUserStatusEnum, IAuthUserExtra, useAuthUserS } from '#src/pouch'
import { ToastStore } from '#src/stores'

export default function UserEntry({ route }: { route: RouteType }) {
	const
		{id} = qs.parse<Record<string,string>>(),
		entry = id
			? useAuthUserS('org.couchdb.user:' + id)
			: new AuthUser({
				_id: '',
				name: '',
				password: '',
				surname: '',
				givenName: '',
				roles: [],
				status: AuthUserStatusEnum.ACTIVE,
				tenants: [],
			})
	
	PageMetaStore.value = { title: entry.fullName }

	const Form = useForm()
	const onSubmit = useCallback(onSubmitCb, [])

	const { submitting, errors } = Form.state

	return <PaddedPage>
		<Section header1={route.title} backButton>
			<Form.Component onSubmitJson={onSubmit}>
				{Fields()}
				<SubmitButton>{id ? 'Save' : 'Submit'}</SubmitButton>
				<ErrorMessage>{errors.form?.note}</ErrorMessage>
			</Form.Component>
		</Section>

		{!!id && <Section header1='JSON'>
			<CodeSnippet snippet={entry.values}/>
		</Section>}
	</PaddedPage>

	async function onSubmitCb(formValues: any) {
		if ('password' in formValues && !formValues.password) delete formValues.password
		formValues._id = 'org.couchdb.user:' + formValues.name
		Object.assign(entry, formValues)
		if (entry.isDirty) {
			// If email has changed, verify that it's not already taken
			if (entry.name !== entry.valuesClean.name) {
				if (await AuthUsers.get(formValues._id).catch(() => {}))
					throwValidationErrorSet(entry, {name: new ValueError('name', 'email is already claimed')})
			}
			await entry.save()
		}
		ToastStore.setValue({message: 'Record saved!', icon: 'success', duration: 3e3, placement: 'right'})
		window.dispatchEvent(new Event('#stack-back'))
	}

	function Fields() {
		const fields: Record<'_id' & keyof IAuthUserExtra, any> = {
			_id: <InputField
				name={AuthUserFieldsEnum._id}
				labelText="_id"
				inputProps={{defaultValue: entry._id}}
				disabled={true} hidden={true}
				error={errors[AuthUserFieldsEnum._id]?.note}
			/>,
			name: <InputField
				name={AuthUserFieldsEnum.name}
				labelText="Email"
				inputProps={{autoFocus: !id, defaultValue: entry.name}}
				disabled={!!id || submitting}
				error={errors[AuthUserFieldsEnum.name]?.note}
			/>,
			password: <InputField
				name={AuthUserFieldsEnum.password}
				labelText="Password"
				inputProps={{autoFocus: !!id, type: 'password', defaultValue: entry.password}}
				disabled={submitting}
				error={errors[AuthUserFieldsEnum.password]?.note}
			/>,
			password_scheme: <InputField
				name={AuthUserFieldsEnum.password_scheme}
				labelText="password_scheme"
				inputProps={{defaultValue: entry.password_scheme}}
				disabled={true} hidden={true}
				error={errors[AuthUserFieldsEnum.password_scheme]?.note}
			/>,
			iterations: <InputField
				name={AuthUserFieldsEnum.iterations}
				labelText="iterations"
				inputProps={{type: 'number', defaultValue: entry.iterations}}
				disabled={true} hidden={true}
				error={errors[AuthUserFieldsEnum.iterations]?.note}
			/>,
			derived_key: <InputField
				name={AuthUserFieldsEnum.derived_key}
				labelText="derived_key"
				inputProps={{defaultValue: entry.derived_key}}
				disabled={true} hidden={true}
				error={errors[AuthUserFieldsEnum.derived_key]?.note}
			/>,
			salt: <InputField
				name={AuthUserFieldsEnum.salt}
				labelText="salt"
				inputProps={{defaultValue: entry.salt}}
				disabled={true} hidden={true}
				error={errors[AuthUserFieldsEnum.salt]?.note}
			/>,
			givenName: <InputField
				name={AuthUserFieldsEnum.givenName}
				labelText="First Name"
				inputProps={{defaultValue: entry.givenName}}
				disabled={submitting}
				error={errors[AuthUserFieldsEnum.givenName]?.note}
			/>,
			surname: <InputField
				name={AuthUserFieldsEnum.surname}
				labelText="Last Name"
				inputProps={{defaultValue: entry.surname}}
				disabled={submitting}
				error={errors[AuthUserFieldsEnum.surname]?.note}
			/>,
			roles: <InputField
				name={AuthUserFieldsEnum.roles}
				labelText="Roles"
				inputProps={{defaultValue: entry.roles.join(), isarray: true}}
				disabled={submitting}
				error={errors[AuthUserFieldsEnum.roles]?.note}
			/>,
			status: <InputField
				name={AuthUserFieldsEnum.status}
				labelText="Status"
				inputProps={{defaultValue: entry.status}}
				disabled={submitting}
				error={errors[AuthUserFieldsEnum.status]?.note}
			/>,
			tenants: <InputField
				name={AuthUserFieldsEnum.tenants}
				labelText="Tenants"
				inputProps={{defaultValue: entry.tenants.join(), isarray: true}}
				disabled={submitting}
				error={errors[AuthUserFieldsEnum.tenants]?.note}
			/>,
		}
		return Object.values(fields)
	}
}
