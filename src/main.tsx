import {h, render} from 'preact'

import App from './App.jsx'
import config from './lib/config'
import './lib/polyfills/web'

render(<App />, document.getElementById('app')!)
