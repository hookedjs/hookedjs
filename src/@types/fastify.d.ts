import type { FastifyInstance as FastifyInstanceSrc } from 'fastify'

declare global {
	type FastifyInstance = FastifyInstanceSrc
	interface FastifyOptions {
		// secret: string
		prefix: string
		// domain: string
		// dev: boolean
	}
}

// declare module 'fastify' {
// 	interface FastifyRequest {
// 		hello: any
// 	}
// }
