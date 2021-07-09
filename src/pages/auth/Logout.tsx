import { h } from 'preact'

import { useEffect } from '#lib/hooks'
import { AuthStore } from '#src/stores'


export default function Logout() {
	useEffect(() => {
		AuthStore.logout()
	}, [])
	return <div/>
}