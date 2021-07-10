window.addEventListener('submit', (e) => e.preventDefault())

import EmptyPath from 'mdi-paths-split/CheckboxBlankOutline'
import MarkedPath from 'mdi-paths-split/CheckboxMarked'
import {ComponentChildren, Fragment as F, FunctionalComponent, h} from 'preact'

import { useCallback, useEffect, useInterval, useRef, useState, useUpdateEffect } from '#lib/hooks'
import { IconSvg } from '#lib/icons'
import styled from '#lib/styled'
import { ValidationErrorSet } from '#src/lib/validation'

import { useMountedState } from './hooks'

/**
 * Hook that makes forms super easy and DRY
 * Note: Makes assumptions about server-side error handling
 */
export function useForm(): UseFormReturn {

	const [state, setState] = useState(formDefaultState)
	const FormComponentMemoized = useCallback(FormComponent, [])

	const formRef = useRef<HTMLFormElement>()
	let initialValues: FormJson = {}

	return {
		Component: FormComponentMemoized,
		state,
		resetState: () => setState(formDefaultState),
		resetStateAndValues: () => {resetValues(); setState(formDefaultState)}
	}

	function FormComponent({ children, onSubmit, onSubmitJson, ...formProps }: UseFormComponentProps) {
		const isMounted = useMountedState()
		
		const onSubmitP = onSubmit && (async (e: FormEvent) => onSubmit(e))
		const onSubmitJsonP = onSubmitJson && (async (data: FormJson) => onSubmitJson(data))

		useEffect(() => {initialValues = formToJson(formRef.current!)}, [])

		return <Form onSubmit={onSubmitStateWrapper} {...formProps} forwardRef={formRef}>{children}</Form>

		async function onSubmitStateWrapper(formEvent: FormEvent) {
			setState(last => ({ ...last, submitting: true }))
			try {
				if (onSubmitP) await onSubmitP(formEvent)
				if (onSubmitJsonP) await onSubmitJsonP(formToJson(formEvent.target))
				if (isMounted()) setState(last => ({ ...last, submitting: false, submitted: true, accepted: true, errors: {} }))
			} catch (error) {
				if (error instanceof ValidationErrorSet)
					setState(last => ({
						...last, submitting: false, submitted: true,
						errors: {
							form: { attrName: 'form', type: 'FormError', note: 'Please check form for errors.' },
							...error.context.errorSet
						}
					}))
				else
					setState(last => ({ ...last, submitting: false, submitted: true, errors: { form: error.message } }))
			}
		}
	}

	function resetValues() {
		for (const e of formRef.current!.elements as unknown as HTMLInputElement[]) {
			if (e.type !== 'submit') {
				if (e.type === 'checkbox') e.checked = initialValues[e.name] as boolean
				else e.value = initialValues[e.name] as any
			}
		}
	}
}
const formDefaultState: UseFormState = {
	submitting: false,
	submitted: false,
	accepted: false,
	errors: {}
}
interface UseFormState {
  submitting: boolean,
  submitted: boolean,
  accepted: boolean,
  // errors: Partial<Record<keyof LoginProps | 'form', any>>
  errors: Record<string, any>
}
type UseFormComponentProps = FormProps
interface UseFormReturn {
  Component: FunctionalComponent<UseFormComponentProps>
  state: UseFormState
  resetState: () => void
	resetStateAndValues: () => void
}


/**
 * A form with essential elements
 */
export type FormJson = Record<string, string | string[] | number | number[] | boolean | boolean[]>
interface FormProps extends Omit<h.JSX.HTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  onSubmit?: (formEvent: FormEvent) => any
  onSubmitJson?: (formValues: FormJson) => any
	useFormDataApi?: boolean
	reset?: () => void
	forwardRef?: Ref<any>
  children: ComponentChildren
}
interface FormEvent {
  preventDefault(): null;
  target: HTMLFormElement;
}
export function Form({ onSubmit, onSubmitJson, reset, children, class: className, ...formProps }: FormProps) {
	return (
		<FormForm class={`form ${className}`} onSubmit={onSubmitInner as any} {...formProps}>
			{children}
		</FormForm>
	)

	function onSubmitInner(formEvent: FormEvent) {
		formEvent.preventDefault()
		onSubmit?.(formEvent)
		onSubmitJson?.(formToJson(formEvent.target))
	}
}
const FormForm = styled.form`
  :root .form-error
    color: var(--danger)
`

/**
 * A text input with label and error handling
 */
interface TextProps {
  name: string
  labelText: string
  error?: string
	disabled?: boolean
	divProps?: h.JSX.HTMLAttributes<HTMLDivElement> & {forwardRef?: Ref<any>}
	inputProps: h.JSX.HTMLAttributes<HTMLInputElement> & {forwardRef?: Ref<any>}
}
export function TextField({ name, labelText, error, disabled, inputProps, divProps }: TextProps) {
	return (
		<TextFieldDiv data-error={!!error} {...divProps}>
			<label>{labelText}</label>
			<input aria-label={labelText} name={name} {...inputProps} disabled={disabled}/>
			<div class="error">{error}</div>
		</TextFieldDiv>
	)
}
const TextFieldDiv = styled.div`
	:root
		--error-color: var(--danger)
		position: relative
		margin-bottom: 1.4rem
	:root>label
		padding: 1px 3px
		border-radius: 2px
		background: var(--white)
		color: var(--gray8)
		position: absolute
		top: -9px
		left: 8px
		font-size: .7rem
  :root>input
    display: block
		height: 3rem
		padding-top: .3rem
		padding-left: .8rem
	:root>input
		margin-top: 1px
		width: 200px
		max-width: 100%
  :root.hasError input
    border: 1px solid var(--error-color)
  :root>.error
    display: none
		padding: .2rem 0 0 2px
    color: var(--error-color)
		font-size: .7rem
	:root[data-error="true"]>label
		color: var(--error-color)
	:root[data-error="true"]>input
		border: 1px solid var(--error-color)
  :root[data-error="true"]>.error
    display: block
`

/**
 * A checkbox input with label and error handling
 */
interface BooleanFieldProps {
  labelText: ComponentChildren
	checkedLabelText?: ComponentChildren
  error?: string
	divProps?: h.JSX.HTMLAttributes<HTMLDivElement> & {forwardRef?: Ref<any>}
	inputProps: CheckboxProps['inputProps']
	type?: 'checkbox' | 'switch'
}
export function BooleanField(p: BooleanFieldProps) {
	const [checked, setChecked] = useState(p.inputProps?.checked)
	const toggleBox = useCallback(function _toggleBox() { setChecked(curr => !curr) }, [])
	const ref = useRef<HTMLInputElement>()

	// Keep the state in sync with dom
	useInterval(() => {
		if (ref.current && ref.current.checked !== checked)
			setChecked(ref.current.checked)
	}, 500)

	const Input = p.type === 'switch' ? Switch : Checkbox
	return (
		<BooleanFieldDiv data-error={!!p.error} class={p.type} {...p.divProps}>
			<div>
				<Input 
					inputProps={{
						...p.inputProps, 
						onClick: toggleBox, 
						checked: checked, 
						value: 'true', 
						forwardRef: p.inputProps.forwardRef || ref as Ref<HTMLInputElement>
					}} 
					hasError={!!p.error} 
				/>
				<div class='label' onClick={toggleBox}>
					{checked ? (p.checkedLabelText || p.labelText) : p.labelText}
				</div>
			</div>
			<div class="error">{p.error}</div>
		</BooleanFieldDiv>
	)
}
const BooleanFieldDiv = styled.div`
	:root
		margin-top: 1rem
		margin-bottom: 1rem
  :root>div:first-of-type
    display: flex
		flex-direction: row
		cursor: pointer
	:root.switch .label
		margin-left: .4rem
  :root .error
		padding: .2rem 0 0 2px
    display: none
    color: var(--danger)
  :root[data-error="true"] .error
    display: block
`

/**
 * Checkbox: A fancy wrapper for HTML Checkboxes, bc they are not style-able :-(
 */
interface CheckboxProps {
	divProps?: h.JSX.HTMLAttributes<HTMLDivElement> & {forwardRef?: Ref<any>}
	inputProps: Omit<h.JSX.HTMLAttributes<HTMLInputElement>, 'name'> & {
		name: string
		'aria-label': string
		forwardRef?: Ref<any>
	}
	hasError?: boolean
}
export function Checkbox({ divProps = {}, inputProps, hasError }: CheckboxProps) {
	const [checked, setChecked] = useState(inputProps.checked || inputProps.default || false)
	useUpdateEffect(function _pullDown() { setChecked(inputProps.checked || false) }, [inputProps.checked])
	const onClick = useCallback(_onClick, [])
	return (
		<CheckboxDiv {...divProps} class={divProps.class + ' checkbox'} ref={divProps.forwardRef} data-checked={checked} data-error={hasError}>
			<IconSvg fill="var(--gray6)" class="marked" path={MarkedPath} />
			<IconSvg fill="var(--gray4)" class="empty" path={EmptyPath} />
			<input type="checkbox" {...inputProps} ref={inputProps.forwardRef!} checked={checked} onClick={onClick} />
		</CheckboxDiv>
	)
	function _onClick(e: any) {
		setChecked(curr => !curr)
		if (inputProps.onClick) (inputProps as any).onClick(e)
	}
}
const CheckboxDiv = styled.div`
	:root
		position: relative
		margin-top: -2px
		margin-bottom: -8px
		cursor: pointer
	:root input
		opacity: 0
	:root svg
		cursor: pointer
		position: absolute
		top: 0
		left: 0
		border-radius: 3px
    border: 1px solid hsla(0,0%,0%,0)
	:root .marked
		display: none
	:root .empty
		display: initial
	:root[data-checked="true"] .marked
		display: initial
	:root[data-checked="true"] .empty
		display: none
	:root[data-error="true"] svg
		border-radius: 3px
    border: 1px solid var(--danger)
`

export function Switch({ divProps = {}, inputProps, hasError }: CheckboxProps) {
	const [checked, setChecked] = useState(inputProps.checked || inputProps.default || false)
	useUpdateEffect(function _pullDown() { setChecked(inputProps.checked || false) }, [inputProps.checked])
	const onClick = useCallback(_onClick, [])
	return (
		<SwitchDiv {...divProps} class={divProps + ' switch'} ref={divProps.forwardRef} data-checked={checked} data-error={hasError}>
			<div class='switch-button'>
				<div class='track' onClick={onClick} />
				<div class='circle' onClick={onClick} />
			</div>
			<input type="checkbox" {...inputProps} ref={inputProps.forwardRef!} checked={checked} onClick={onClick} />
		</SwitchDiv>
	)
	function _onClick(e: any) {
		setChecked(curr => !curr)
		if (inputProps.onClick) (inputProps as any).onClick(e)
	}
}
const SwitchDiv = styled.div`
	:root
		position: relative
		cursor: pointer
		color: var(--gray6)
	:root[data-checked="true"]
		color: var(--secondary)
	:root>.switch-button
		display: block
		padding: 4px 0
		margin-top: -4px
		border-radius: 3px
		border: 1px solid hsla(0,0%,0%,0)
	:root>.switch-button>div
		background: currentColor
		border-radius: 15px
	:root>input
		position: absolute
		top: 0
		left: 0
		opacity: 0
	:root>.switch-button>.track
		opacity: .6
		width: 36px
		height: 14px
		margin: 3px 0 0
	:root>.switch-button>.circle
		transition: .1s margin linear
		width: 20px
		height: 20px
		margin-top: -17px
	:root[data-checked="true"]>.switch-button>.circle
		margin-left: 16px
	:root[data-error="true"]>.switch-button
		padding: 4px
    border: 1px solid var(--danger)
`

export function ErrorMessage({ children, class: className = '', forwardRef, ...buttonProps }: h.JSX.HTMLAttributes<HTMLDivElement> & {forwardRef?: Ref<any>}) {
	return children ? (
		<div class={`form-error-message ${className}`} {...buttonProps} ref={forwardRef}>{children}</div>
	) : <F></F>
}

export function SubmitButton({ children, class: className = '', forwardRef, ...buttonProps }: h.JSX.HTMLAttributes<HTMLButtonElement> & {forwardRef?: Ref<any>}) {
	return (
		<button style={{marginBottom:'.3rem'}} class={`form-submit-button ${className}`} {...buttonProps} ref={forwardRef} type="submit">{children}</button>
	)
}

/**
 * Extracts form values from a <form> ref, such as e.target from form.onSubmit
 * Is more friendly than the FormData api, but isn't compatible with 
 * multipart/form-data encoding -- which is required if there are file inputs.
 * For example, FormData handles checkboxes weirdly
 */
export function formToJson(formElement: HTMLFormElement): FormJson {
	const reqBody: FormJson = {}
	for (const e of formElement.elements as unknown as HTMLInputElement[]) {
		if (e.type !== 'submit')
			reqBody[e.name] = e.type === 'checkbox' ? e.checked : e.value
	}
	return reqBody
}
