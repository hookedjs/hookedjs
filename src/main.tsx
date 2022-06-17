import './lib/polyfills/web'

import {h, render} from 'preact'

import App from './App.jsx'

render(<App />, document.getElementById('app')!)
