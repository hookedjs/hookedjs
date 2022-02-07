import type fastify, { FastifyInstance as FastifyInstanceSrc } from 'fastify'

declare global {
	type FastifyInstance = FastifyInstanceSrc
	interface FastifyOptions {
		// secret: string
		prefix: string
		// domain: string
		// dev: boolean
	}
}

declare module 'fastify' {
	interface FastifyRequest {
		user: { name: string, roles: string[] }
	}
}
