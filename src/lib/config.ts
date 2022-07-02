/**
 * An interface for config variables
 */

const config = {
  gateway: 'https://localhost:3000',
  get api() {
    return `${this.gateway}/api`
  },
  get db() {
    return `${this.gateway}/db`
  },
  isProd: (globalThis as any).isProd,
}

export {config}
