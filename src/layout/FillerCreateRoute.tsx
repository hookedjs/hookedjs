import { Fragment as F, h } from 'preact'

import { ErrorMessage, FormJson, SubmitButton, TextField, useForm } from '#lib/forms'
import { useCallback } from '#lib/hooks'
import { nav, RouteType } from '#lib/router'
import { assertAttrsWithin, assertValid, assertValidSet } from '#src/lib/validation'
import { ToastStore } from '#src/stores'

import BackButton from './components/BackButton'
import PaddedPage from './components/PaddedPage'
import Section from './components/Section'

export default function FillerCreateFactory({ route }: { route: RouteType }) {
	const stackPath = location.pathname.split('/').slice(0, -1).join('/')
	const listPath = stackPath + '/home'
	const Form = useForm()
	const onSubmit = useCallback(_onSubmit, [])

	const { submitting, errors } = Form.state

	return <PaddedPage>
		<Section header1={route.title} fullHeight backButton>
			<Form.Component onSubmitJson={onSubmit}>
				<TextField
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
				<ErrorMessage>{errors.form?.note}</ErrorMessage>
			</Form.Component>
		</Section>
	</PaddedPage>

	async function _onSubmit(formValues: FormJson) {
		const values = new CreateProps(formValues)
		ToastStore.value = {message: 'Record created!', icon: 'success', duration: 3e3, location: 'right'}
		window.dispatchEvent(new Event('#stack-pop'))
		nav(listPath, { replace: true }) 
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
			title: assertValid('title', props.title, ['isDefined', 'isString'], { isLongerThan: 2, isShorterThan: 30}),
		})
		Object.assign(this, props)
	}
}
export const CreatePropsPlaceholder = new CreateProps({
	title: recordPlaceholder.title,
})
export const CreatePropsEnum = Enum.getEnumFromClassInstance(CreatePropsPlaceholder)