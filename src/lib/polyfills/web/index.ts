import '../iso'

globalThis.global = globalThis as any
;(globalThis as TSFIXME).isNode = false
;(globalThis as TSFIXME).isWeb = true
;(globalThis as TSFIXME).env = import.meta.env
;(globalThis as TSFIXME).isProd = import.meta.env.PROD
