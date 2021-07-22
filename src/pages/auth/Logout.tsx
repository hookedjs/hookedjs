import { h } from 'preact'

import { useEffect } from '#lib/hooks'
import { nav } from '#src/lib/router'
import { Paths } from '#src/routes'
import { AuthStore } from '#src/stores'


export default function Logout() {
	useEffect(() => {
		AuthStore.logout()
			.then(() => nav(Paths.Login))
	}, [])
	return <div/>
}