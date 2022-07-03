import '../iso'
import './pouchdb'
import './window'

;(globalThis as TSFIXME).isNode = true
;(globalThis as TSFIXME).isWeb = false
;(globalThis as TSFIXME).env = process.env
;(globalThis as TSFIXME).isProd = process.env.NODE_ENV === 'production'
