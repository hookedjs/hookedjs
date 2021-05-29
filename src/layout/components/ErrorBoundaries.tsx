import { ComponentChildren, Fragment as F, h } from 'preact'
import { useEffect, useErrorBoundary, useState } from 'preact/hooks'

import styled from '#lib/styled'

import Toast from './Toast'

/**
 * Catch Promise Rejection Errors
 * Place this component once, at the top of your app
 */
export function UnhandledErrorNotification() {
	const [promiseErrorEvent, setPromiseErrorEvent] = useState<any>(null)
	useEffect(listenForPromiseErrors, [])
	return promiseErrorEvent ? <ErrorC/> : <F />

	function listenForPromiseErrors() {
		window.addEventListener('unhandledrejection', handleReject)
		return () => window.removeEventListener('unhandledrejection', handleReject)

		function handleReject(eventNext: any) {
			setPromiseErrorEvent(eventNext)
			// TODO: Log the error somewhere
		}
	}
}

/**
 * Catch runtime/synchronous errors
 * Wrap Components in this to catch the errors near the Component
 * Note: It cannot detect/catch promise rejections.
 */
export function ErrorBoundary({children}: {children: ComponentChildren}) {
	const [runtimeError] = useErrorBoundary()
	useEffect(reportRuntimeError, [runtimeError])
	return <F>{children}{runtimeError ? <ErrorC/> : ''}</F>
	function reportRuntimeError() {
		if (runtimeError) {
			console.error(runtimeError)
			// TODO: Log the error somewhere
		}
	}
}

function ErrorC() {
	return (
		<Toast 
			icon="error" 
			location="bottom" 
			duration={-1} 
			message={<span>
				Something went wrong on this page! Shoot. Maybe&nbsp;
				<a href="javascript:location.reload()">refresh</a>?
			</span>}
		/>
	)
}

