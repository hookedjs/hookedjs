import 'preact/devtools'
import './lib/polyfills'

import { h, render } from 'preact'

import App from './App.jsx'
import config from './lib/config.web'
import { networkStatusRefresh } from './lib/network'

const root = document.getElementById('root')

networkStatusRefresh().then(() => {
	render(<App />, root!)
})

if (config.isProd) {
	navigator.serviceWorker.register('/sw.js')
}
