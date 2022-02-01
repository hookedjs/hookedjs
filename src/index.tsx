import 'preact/devtools'
import './lib/polyfills/web'

import { h, render } from 'preact'

import App from './App.jsx'
import config from './lib/config'

const root = document.getElementById('root')

render(<App />, root!)

if (config.isProd)
	navigator.serviceWorker.register('/sw.js')
