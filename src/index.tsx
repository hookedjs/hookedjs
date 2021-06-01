import 'preact/devtools'
import './lib/polyfills'

import { h, render } from 'preact'

import App from './App.jsx'
import config from './lib/config.web'

const root = document.getElementById('root')

render(<App />, root!)

if (config.isProd)
	navigator.serviceWorker.register('/sw.js')
