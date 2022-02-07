import config from '../config.node'

export async function addAdminToDb(userName: string, tableId: string) {
	const current = await fetch(`${config.dbUrl}/${tableId}/_security`).then(res => res.json())
	const res = await fetch(`${config.dbUrl}/${tableId}/_security`, {
		method: 'POST',
		body: JSON.stringify({
			...current,
			admins: {
				...current?.admins,
				names: [...current?.admins?.names ?? [], userName]
			},
		}),
	})
		.then(res => res.json())
	return res
}