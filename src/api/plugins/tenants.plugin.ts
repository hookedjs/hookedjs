/**
 * API Endpoints for authentication that utilize emailed temporary passwords.
 * 
 * Better than direct DB auth, bc it's more secure and less prone to brute force.
 * 
 * Decisions:
 *  - Use cheap password hashing bc they are temporary and cheap = less CPU cost
 *  - Use email verification bc they are more secure and better promise that an
 *    account is not being shared between people
 */

import { throwForbiddenError } from '../../lib/validation'
import { AuthUsers, initTenantDbApi } from '../../pouch/databases'
import { addAdminToDb } from '../lib/pouch/permissions'

export const tenantDbPrefix = 't-'

export default async function authorizationPlugin(app: FastifyInstance, options: FastifyOptions) {
	/**
	 * Creates a tenant db for a user
	 */
	app.post('/api/tenants', async function postTenantEndpoint(req, reply) {
		const props: { name: string } = req.body as any
		if (!req.user.name) {
			throwForbiddenError()
		}
		const user = await AuthUsers.get(req.user.name)
		const tenantId = `${tenantDbPrefix}${String.uid()}`
		await initTenantDbApi(tenantId)
		user.defaultTenantId = user.defaultTenantId || tenantId
		user.tenants = user.tenants || []
		user.tenants.push({id: tenantId, name: props.name})
		await user.save()
		await addAdminToDb(req.user.name, tenantId)
		reply.send({id: tenantId})
	})

	/**
	 * Invites a user to a tenant
	 */
	app.post('/api/tenants/invite', async function postTenantInviteEndpoint(req, reply) {
		// TODO: Tenant invite
		// Check perms of user and that they have perm to invite users to the tenant
		// Get user
		// If email isn't a current user, create a new user for them
		// Add user to tenant
	})

}
