import {useEffect} from 'preact/hooks'

import {config} from './config'
import {useInterval, useState, useUpdate} from './hooks'

export let isOnline = true
export let isOffline = false

const listeners = new Set<(isOnline: boolean) => void>()
export function listen(cb: (isOnline: boolean) => void) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}
export function unlisten(cb: (isOnline: boolean) => void) {
  listeners.delete(cb)
}

async function checkOnline() {
  const res = await fetch(config.db)
  isOnline = res.ok
  isOffline = !isOnline
  listeners.forEach(cb => cb(isOnline))
}
checkOnline()
setInterval(checkOnline, 10000)

export async function waitForOnline() {
  while (isOffline) {
    await sleep(1000)
  }
}

export function useIsOnline() {
  const refresh = useUpdate()
  useEffect(() => listen(refresh))
  return isOnline
}
