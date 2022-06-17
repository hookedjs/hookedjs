/**
 * An interface for config variables
 */

// @ts-ignore import meta env
const isProd = import.meta.env.NODE_ENV === 'production'

export default {
  apiPrefix: '/api',
  isProd,
}
