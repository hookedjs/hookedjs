/**
 * An interface for config variables
 */

import configIso from './config.iso'

// @ts-ignore import meta env
const isProd = import.meta.env.NODE_ENV === 'production'

export default {
	...configIso,
	isProd,
}


