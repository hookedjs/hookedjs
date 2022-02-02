import { ComponentChildren, h } from 'preact'

import PaddedPage from '#layout/components/PaddedPage'
import Section from '#layout/components/Section'
import qs from '#lib/queryStrings'
import {PageMetaStore, RouteType} from '#lib/router'
import CodeSnippet from '#src/layout/components/CodeSnippet'
import { ErrorMessage, InputField, SubmitButton, useForm } from '#src/lib/forms'
import { useCallback } from '#src/lib/hooks'
import { AuthUser, AuthUserFieldsEnum, AuthUserStatusEnum, IAuthUserExtra, useAuthUserS } from '#src/pouch'
import type { IStandardFields } from '#src/pouch/lib/Database'
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
			<Form.Component onSubmitJson={onSubmit as any}>
				{Fields()}
				<SubmitButton>{id ? 'Save' : 'Submit'}</SubmitButton>
				<ErrorMessage errors={errors}/>
			</Form.Component>
		</Section>

		{!!id && <Section header1='JSON'>
			<CodeSnippet snippet={entry.values}/>
		</Section>}
	</PaddedPage>

	async function onSubmitCb(formValues: Record<keyof (Pick<IStandardFields, '_id' | 'deletedAt'> & IAuthUserExtra), any>) {
		// _id is calculated from name in _users
		formValues._id = 'org.couchdb.user:' + formValues.name
		
		// Map fields
		formValues.tenants = JSON.parse(formValues.tenants)

		// Scrub optional fields that are empty
		if (!formValues.deletedAt) delete formValues.deletedAt
		if (!formValues.password) delete formValues.password
		if (!formValues.password_scheme) delete formValues.password_scheme
		if (!formValues.iterations) delete formValues.iterations
		if (!formValues.derived_key) delete formValues.derived_key
		if (!formValues.salt) delete formValues.salt
		if (!formValues.bannedAt) delete formValues.bannedAt
		if (!formValues.bannedReason) delete formValues.bannedReason
		if (!formValues.failedLoginAttemptAt) delete formValues.failedLoginAttemptAt
		if (!formValues.failedLoginAttempts) delete formValues.failedLoginAttempts
		
		Object.assign(entry, formValues)
		await entry.save()
		ToastStore.setValue({message: 'Record saved!', icon: 'success', duration: 3e3, placement: 'right'})
		dispatchEvent(new Event('#stack-back'))
	}

	function Fields() {
		const fields: Record<keyof (Pick<IStandardFields, '_id' | 'deletedAt'> & IAuthUserExtra), ComponentChildren> = {
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
				inputProps={{autoFocus: !id, type: 'email', defaultValue: entry.name}}
				disabled={!!id || submitting}
				error={errors[AuthUserFieldsEnum.name]?.note}
			/>,
			password: <InputField
				name={AuthUserFieldsEnum.password}
				labelText="Password"
				inputProps={{autoFocus: !!id, defaultValue: entry.password}}
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
				inputProps={{defaultValue: JSON.stringify(entry.tenants), isarray: true}}
				disabled={submitting}
				error={errors[AuthUserFieldsEnum.tenants]?.note}
			/>,
			defaultTenantId: <InputField
				name={AuthUserFieldsEnum.defaultTenantId}
				labelText="Default Tenant ID"
				inputProps={{defaultValue: entry.defaultTenantId}}
				disabled={submitting}
				error={errors[AuthUserFieldsEnum.defaultTenantId]?.note}
			/>,
			deletedAt: <InputField
				name={AuthUserFieldsEnum.deletedAt}
				labelText="Deleted At"
				inputProps={{type: 'date', defaultValue: entry.deletedAt?.toISOString() ?? ''}}
				disabled={submitting}
				error={errors[AuthUserFieldsEnum.deletedAt]?.note}
			/>,
			bannedAt: <InputField
				name={AuthUserFieldsEnum.bannedAt}
				labelText="Banned At"
				inputProps={{type: 'date', defaultValue: entry.bannedAt?.toISOString() ?? ''}}
				disabled={submitting}
				error={errors[AuthUserFieldsEnum.bannedAt]?.note}
			/>,
			bannedReason: <InputField
				name={AuthUserFieldsEnum.bannedReason}
				labelText="Banned Reason"
				inputProps={{defaultValue: entry.bannedReason}}
				disabled={submitting}
				error={errors[AuthUserFieldsEnum.bannedReason]?.note}
			/>,
			failedLoginAttemptAt: <InputField
				name={AuthUserFieldsEnum.failedLoginAttemptAt}
				labelText="Failed Login Attempt At"
				inputProps={{type: 'date', defaultValue: entry.failedLoginAttemptAt?.toISOString() ?? ''}}
				disabled={submitting}
				error={errors[AuthUserFieldsEnum.failedLoginAttemptAt]?.note}
			/>,
			failedLoginAttempts: <InputField
				name={AuthUserFieldsEnum.failedLoginAttempts}
				labelText="Failed Login Attempts"
				inputProps={{defaultValue: entry.failedLoginAttempts, type: 'number'}}
				disabled={submitting}
				error={errors[AuthUserFieldsEnum.failedLoginAttempts]?.note}
			/>,
			passwordTmpAt: <InputField
				name={AuthUserFieldsEnum.passwordTmpAt}
				labelText="Temporary Password At"
				inputProps={{type: 'date', defaultValue: entry.passwordTmpAt?.toISOString() ?? ''}}
				disabled={submitting}
				error={errors[AuthUserFieldsEnum.passwordTmpAt]?.note}
			/>,
			passwordTmp: <InputField
				name={AuthUserFieldsEnum.passwordTmp}
				labelText="Temp Password"
				inputProps={{defaultValue: entry.passwordTmp}}
				disabled={submitting}
				error={errors[AuthUserFieldsEnum.passwordTmp]?.note}
			/>,
		}
		return Object.values(fields)
	}
}
