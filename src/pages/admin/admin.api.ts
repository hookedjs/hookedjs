import { UserRoleEnum } from '#src/db'
import config from '#src/lib/config'
import { ForbiddenError } from '#src/lib/validation'

export default async function adminPlugin(app: FastifyInstance, options: FastifyOptions) {
	app.addHook('preValidation', async function adminAuthGuard(req, reply) {
		if (
			req.url.startsWith(`${config.apiPrefix}/admin`) 
			&& !req.user.roles.includes(UserRoleEnum.ADMIN)
		) {
			// TODO: Re-enable permission guard
			// throw new ForbiddenError()
		}
	})
}