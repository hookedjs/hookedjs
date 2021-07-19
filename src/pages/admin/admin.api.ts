import config from '#lib/config.node'
import { ForbiddenError } from '#lib/validation'
import { UserRoleEnum } from '#src/db/entity'

export default async function adminPlugin(app: FastifyInstance, options: FastifyOptions) {
	app.addHook('preValidation', async function adminAuthGuard(req, reply) {
		if (
			req.url.startsWith(`${config.apiPrefix}/admin`) 
			&& !req.user.roles.includes(UserRoleEnum.ADMIN as any)
		) {
			throw new ForbiddenError()
		}
	})
}