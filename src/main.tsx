import './lib/polyfills/web'

import { h, render } from 'preact'

import App from './App.jsx'
import config from './lib/config'

render(<App />, document.getElementById('app')!)
