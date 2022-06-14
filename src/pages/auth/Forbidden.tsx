import {h} from 'preact'

import {Auth} from '#src/lib/icons'
import pstyled from '#src/lib/pstyled'
import { nav } from '#src/lib/router'
import { Paths } from '#src/routes'
import { AuthStore, useAuthStore } from '#src/stores'


export default function Forbidden() {
	const [auth] = useAuthStore()
	const LoginUrl = Paths.Login + '?from=' + location.pathname + location.search
	return <ForbiddenDiv>
		<div>
			<Auth size={200} />
			<h1>You lack access to this record.</h1>
			<br />
			<a href={Paths.Home}>Home</a>&nbsp;&nbsp;&nbsp;
			{auth.name
				? <a href={LoginUrl} onClick={onSwitchClick}>Switch User</a>
				: <a href={LoginUrl}>Login</a>
			}
		</div>
	</ForbiddenDiv>
	function onSwitchClick(e: any) {
		e.preventDefault()
		AuthStore.logout().then(() => nav(LoginUrl))
	}
}
// Background thanks to transparenttextures.com
const ForbiddenDiv = pstyled.div`
	:root
		position: absolute
		top:0
		bottom:0
		left:0
		right:0
		background-color: hsl(var(--primary-h),var(--primary-s),70%)
		background-image: url("/fabric.png")
	:root div
		text-align: center
		padding-top: 10vh
	:root img
		max-width:90%
	:root *
		color: black
	:root a
		background: var(--primary)
		color:white
		padding:8px 12px
		border-radius:2px
	:root a:hover
		background: hsl(var(--primary-h),var(--primary-s),50%)
`
