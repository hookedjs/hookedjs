/**
 * An interface for config variables
 */

// @ts-ignore import meta env
const env = process.env ?? globalThis.import.meta.env
const isProd = (env.NODE_ENV ?? env.NODE_ENV) === 'production'

const config = {
  gateway: 'https://localhost:3000',
  get api() {
    return `${this.gateway}/api`
  },
  get db() {
    return `${this.gateway}/db`
  },
  isProd,
}

export {config}
