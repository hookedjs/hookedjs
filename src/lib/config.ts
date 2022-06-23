/**
 * An interface for config variables
 */

// @ts-ignore import meta env
const isProd = import.meta.env.NODE_ENV === 'production'

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
