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

import { nanoid } from 'nanoid'

import { initTenantDbApi } from '../../pouch'

export const tenantDbPrefix = 't-'

import { AuthUsers } from '../../pouch'

export default async function authorizationPlugin(app: FastifyInstance, options: FastifyOptions) {
	/**
	 * Creates a tenant db for a user
	 */
	app.post('/api/tenant', async function postTenantEndpoint(req, reply) {
		// TODO: Test if normal users are allowed to create database?
		// TODO: initTenantDbApi should return a scoped handle to the tenant db and TenantPerson and TenantPersons

		const props: { name: string } = req.body as any

		// TODO: Check that auth cookie is present and valid and matches props.name
		
		const user = await AuthUsers.get(props.name)

		const tenantId = `${tenantDbPrefix}${nanoid(10)}`
		initTenantDbApi(tenantId)

		user.defaultTenantId = user.defaultTenantId || tenantId
		user.tenants = user.tenants || []
		user.tenants.push({id: tenantId, name: props.name})
		await user.save()

		// TODO: Grant permissions to current user
		
		reply.send({id: tenantId})
	})

	/**
	 * Invites a user to a tenant
	 */
	app.post('/api/tenant/invite', async function postTenantInviteEndpoint(req, reply) {
		// TODO: Tenant invite
		// Check perms of user and that they have perm to invite users to the tenant
		// Get user
		// If email isn't a current user, create a new user for them
		// Add user to tenant
	})

}
