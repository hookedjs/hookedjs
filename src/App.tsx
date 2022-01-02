import { h } from 'preact'

import {ErrorBoundary, UnhandledErrorNotification} from './layout/components/ErrorBoundaries'
import { PortalFromContext } from './layout/components/Portal'
import { ToastFromContext } from './layout/components/Toast'
import { RouterComponent as Router } from './lib/router'
import { StaleBrowserWarning } from './layout/components/StaleBrowserWarning'
import { DbProvider } from './pouch'
import { routesByPath } from './routes'

export default function App() {
	return (
		<ErrorBoundary>
			<UnhandledErrorNotification />
			<DbProvider>
				<StaleBrowserWarning />
				<Router routesByPath={routesByPath} />
				<PortalFromContext />
				<ToastFromContext />
			</DbProvider>
		</ErrorBoundary>
	)
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