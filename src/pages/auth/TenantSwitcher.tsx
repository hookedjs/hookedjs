import {h} from 'preact'

import { Paths } from '#src/routes'

export default function TenantSwitcher() {
	return (
		<div>
			<h1>Select Account</h1>
			<ul>
				<li>(none available)</li>
			</ul>
			<p><a href={Paths.TenantCreate}><button>Add New</button></a></p>
		</div>
	)
}