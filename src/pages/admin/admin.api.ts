import { UserRole } from '../../db'
import config from '../../lib/config'
import { ForbiddenError } from '../../lib/validation'

export default async function adminPlugin(app: FastifyInstance, options: FastifyOptions) {
	app.addHook('preValidation', async (req, reply) => {
		if (
			req.url.startsWith(`${config.apiPrefix}/admin`) 
			&& !req.user.roles.includes(UserRole.ADMIN)
		) {
			throw new ForbiddenError()
		}
	})
}