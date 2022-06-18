#!/usr/bin/env zx

/**
 * Util/Lib functions for zx scripts
 */

/* eslint-disable i18next/no-literal-string */

/* eslint-disable no-console */
// eslint-disable-next-line import/no-unresolved
import {startSpinner} from 'zx/experimental'

/**
 * Exports
 */

export const spinner = {
  async stop() {},
  async start(msg) {
    this.stop = await startSpinner(msg)
  },
}

export class HandledError extends Error {}
export function throwHandledError(message) {
  throw new HandledError(message)
}
export function throwError(message) {
  throw new Error(message)
}

if (!globalThis.$) {
  throwError('This script must be ran using zx (https://github.com/google/zx)')
}

export function noop() {}

export async function silenced(fn) {
  return async () => {
    const verboseBefore = $.verbose
    $.verbose = false
    const logStateBefore = log.disabled
    log.disable()
    await promisified(fn)()
    log.disabled = logStateBefore
    $.verbose = verboseBefore
  }
}

export function log(msg = '', shouldReplaceLast) {
  if (log.disabled) return
  const ind = '  '.repeat(log.indentation)
  return shouldReplaceLast ? process.stdout.write(ind + `${msg}\r`) : console.log(ind + msg)
}
log.disabled = false
log.disable = () => (log.disabled = true)
log.enable = () => (log.disabled = false)
log.indentation = 0
log.default = log
log.subdued = (msg, shouldReplaceLast) => log(chalk.gray(msg), shouldReplaceLast)
log.info = async (msg, shouldReplaceLast) => {
  const msgArray = Array.isArray(msg) ? msg : [msg]
  for (const m of msgArray) {
    await log(chalk.gray('• ' + m), shouldReplaceLast)
  }
}
log.announce = (msg, shouldReplaceLast) => log(chalk.black.bgGreen(msg), shouldReplaceLast)
log.warn = (msg, shouldReplaceLast) => log(chalk.white.bgOrange(msg), shouldReplaceLast)
log.error = (msg, shouldReplaceLast) => log(chalk.white.bgRed(msg), shouldReplaceLast)
log.newLine = () => log('')
log.say = async msg => !$.silent && $`say ${msg}`
log.pushStack = []
log.push = msg => {
  log.subdued('-> ' + msg)
  log.pushStack.push(msg)
  log.indentation++
}
log.pop = () => {
  log.indentation--
  log.subdued('<- ' + log.pushStack.pop())
}

export async function waitWithTimer(cmdPromise, prefix = '', logger = log.info) {
  let running = true
  let seconds = 0
  const resPromise = cmdPromise.finally(() => (running = false))
  while (running) {
    await logger(`${prefix}${seconds++}s`, seconds)
    await sleep(1000)
  }
  log.newLine()
  return await resPromise
}
