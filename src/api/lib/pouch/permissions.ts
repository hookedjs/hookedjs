import config from '../config.node'

export async function addAdminToDb(userName: string, dbId: string) {
	const current = await fetch(`${config.dbUrl}/${dbId}/_security`).then(res => res.json())
	const next = {
		method: 'PUT',
		body: JSON.stringify({
			...current,
			admins: {
				...current?.admins,
				names: [...current?.admins?.names ?? [], userName],
				roles: ['_admin']
			},
		}),
	}
	const res = await fetch(`${config.dbUrl}/${dbId}/_security`, next)
		.then(res => res.json())
	if(res.error) {
		throw new Error(res.error)
	}
	return res
}
