import { Fragment as F, h } from 'preact'

import { Paths } from '#src/routes'

export default function ForgotPassword() {
	const search = new URLSearchParams(location.search)
	search.set('replace', 'true')
	const searchStr = '?' + search.toString()
	return <F>
		<h1>Forgot Password</h1>
		<ul>
			<li><a href={Paths.Login + searchStr}>Go back to Login</a></li>
		</ul>
	</F>
}