import * as dbs from '#src/pouch/databases'

import config from '../../lib/config.node'

cookieAuth(config.dbUser, config.dbPass)
dbs.initAuthDbApi()

async function cookieAuth(username: string, password: string) {
	const res = await fetch(`${config.dbUrl}/_session`, {
		method: 'POST',
		body: JSON.stringify({name: username, password}),
	})
	if (!res.ok) throw new Error(`Could not login: ${res.status}`)
	const json = await res.json()
	const setCookie = res.headers.get('set-cookie')

	const cookie = setCookie ? setCookie.split(';')[0] : ''
	window.document.cookie = document.cookie = `${cookie} ${document.cookie}`
	return json as unknown as {ok: boolean, name: string, roles: string[]}
}
