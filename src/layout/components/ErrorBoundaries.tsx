import {ComponentChildren, Fragment as F, h} from 'preact'

import {useEffect, useErrorBoundary, useState} from '../../lib/hooks'
import Toast from './Toast'

/**
 * Catch Promise Rejection Errors
 * Place this component once, at the top of your app
 */
export function UnhandledErrorNotification() {
  const [promiseErrorEvent, setPromiseErrorEvent] = useState<any>(null)
  useEffect(listenForPromiseErrors, [])
  return promiseErrorEvent ? <ErrorC /> : <F />

  function listenForPromiseErrors() {
    addEventListener('unhandledrejection', handleReject)
    return () => removeEventListener('unhandledrejection', handleReject)

    function handleReject(eventNext: any) {
      setPromiseErrorEvent(eventNext)
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
  // useEffect on runtimeError does not work, so just report every time
  // useEffect(reportRuntimeError, [runtimeError])
  reportRuntimeError()
  return (
    <F>
      {children}
      {runtimeError ? <ErrorC /> : ''}
    </F>
  )
  function reportRuntimeError() {
    if (runtimeError) {
      console.log(runtimeError)
    }
  }
}

function ErrorC() {
  return (
    <Toast
      icon="error"
      placement="bottom"
      duration={-1}
      message={
        <span>
          Something went wrong on this page! Shoot. Maybe&nbsp;
          <a href="javascript:location.reload()">refresh</a>?
        </span>
      }
    />
  )
}
