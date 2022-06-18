#!/usr/bin/env zx
import {startSpinner} from './zx-lib.mjs'

const about = `
/**
 * myscript.mjs
 * - what i do
 * - why i do
 * - how i do
 *
 */

 npx zx myscript.mjs <arg1> <arg2> [--verbose] [--silent]
`

$.verbose = argv.verbose
$.silent = argv.silent

export default async function main(props = {}) {
  try {
    const _props = parseProps(props)
    await log.push('script')
    await log.info('props: ' + JSON.stringify(_props))

    const {arg1, flag1} = _props

    // Put the top level code here

    // Use spinners to loading
    // const stopSpinner = startSpinner('Loading');

    // throw HandledError to avoid dumping stack traces

    await log.pop()
  } catch (e) {
    await spinner.stop()
    await log.say('error merge failed')
    throw e
  }
}

export const spinner = {
  async stop() {},
  async start(msg) {
    this.stop = await startSpinner(msg)
  },
}

function parseProps(props) {
  const [, positionalArg1, ...rest1] = props._ || []
  const {_, arg1: propArg1, flag1, verbose, silent, ...rest2} = props
  const arg1 = _?.[1] ?? propArg1 ?? positionalArg1
  if (!arg1 || rest1.length || Object.keys(rest2).length) {
    if (isCalled) exitWithHelp()
    throwHandledError('Invalid props:' + JSON.stringify(props))
  }
  return {arg1, flag1, verbose, silent}
}

function exitWithHelp() {
  log(about)
  process.exit(1)
}

// If script is being called directly, run it
const isCalled = process.argv[2].split('/').pop() === import.meta.url.split('/').pop()
if (isCalled) {
  $.verbose = argv.verbose
  $.silent = argv.silent
  if (!globalThis.$) {
    throwError('This script must be ran using zx (https://github.com/google/zx)')
  }
  main(argv).then(() => process.exit(0))
}

/**
 * Util/Lib functions for zx scripts
 */

export class HandledError extends Error {}
export function throwHandledError(message) {
  throw new HandledError(message)
}
export function throwError(message) {
  throw new Error(message)
}

/**
 * Pretty logs
 * - has a shouldReplaceLast option to replace the former line
 * - log.info accepts an array and will print each array item on a new line
 */
export function log(msg = '', shouldReplaceLast) {
  const ind = '  '.repeat(log.indentation)
  return shouldReplaceLast ? process.stdout.write(ind + `${msg}\r`) : console.log(ind + msg)
}
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

// Wraps a fn with logging disabled
async function silenced(fn) {
  return async () => {
    const verboseBefore = $.verbose
    $.verbose = false
    await promisify(fn)()
    $.verbose = verboseBefore
  }
}

function promisify(fn) {
  return async () => fn()
}
