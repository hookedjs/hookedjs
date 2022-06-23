import '../iso'

globalThis.global = globalThis as any
;(globalThis as TSFIXME).isNode = false
;(globalThis as TSFIXME).isWeb = true
