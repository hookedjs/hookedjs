import {Fragment as F, h} from 'preact'

import {ErrorBoundary, UnhandledErrorNotification} from './layout/components/ErrorBoundaries'
import {PortalFromContext} from './layout/components/Portal'
import Toast, {ToastFromContext} from './layout/components/Toast'
import {RouterComponent as Router} from './lib/router'
import {DbProvider} from './pouch'
import {routesByPath} from './routes'

export default function App() {
  return (
    <ErrorBoundary>
      <DbProvider>
        <StaleBrowserWarning />
        <UnhandledErrorNotification />
        <Router routesByPath={routesByPath} />
        <PortalFromContext />
        <ToastFromContext />
      </DbProvider>
    </ErrorBoundary>
  )

  function StaleBrowserWarning() {
    const isModern = 'fetch' in window && 'Promise' in window && 'assign' in Object && 'keys' in Object
    return isModern ? (
      <F />
    ) : (
      <Toast
        icon="error"
        placement="bottom"
        duration={-1}
        message={
          <span>
            Please use a modern browser and/or update. Internet Explorer is <i>not</i> supported.
          </span>
        }
      />
    )
  }
}

function setVh() {
  const vh = parseInt(document.body.style.getPropertyValue('--vh').slice(0, -2), 10)
  if (innerHeight !== vh) {
    document.body.style.setProperty('--vh', `${innerHeight}px`)
  }
}
addEventListener('load', setVh)
addEventListener('resize', setVh)
setInterval(setVh, 2e3)
