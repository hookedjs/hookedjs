import { Fragment, h } from 'preact'

import {ErrorBoundary, UnhandledErrorNotification} from './layout/components/ErrorBoundaries'
import Toast, { ToastFromContext } from './layout/components/Toast'
import { RouterComponent as Router } from './lib/router'
import { routesByPath } from './routes'

export default function App() {
	return (
		<ErrorBoundary>
			<StaleBrowserWarning />
			<UnhandledErrorNotification />
			<Router routesByPath={routesByPath} />
			<ToastFromContext />
		</ErrorBoundary>
	)

	function StaleBrowserWarning() {
		const isModern = (
			'fetch' in window &&
			'Promise' in window &&
			'assign' in Object &&
			'keys' in Object
		)
		return isModern
			? <Fragment />
			: <Toast
				icon="error"
				location="bottom"
				duration={-1}
				message={<span>Please use a modern browser and/or update. Internet Explorer is <i>not</i> supported.</span>}
			/>

	}
}

function setVh() {
	const vh = parseInt(document.body.style.getPropertyValue('--vh').slice(0, -2), 10)
	if (window.innerHeight !== vh) {
		document.body.style.setProperty('--vh', `${window.innerHeight}px`)
	}
}
window.addEventListener('load', setVh)
window.addEventListener('resize', setVh)
setInterval(setVh, 2e3)