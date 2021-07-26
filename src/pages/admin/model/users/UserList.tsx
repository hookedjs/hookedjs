import {h} from 'preact'

import { useAuthUsersS } from '#src/pouch'

export default function UserList() {
	const users = useAuthUsersS()
	return (
		<div>
			<h2>Users</h2>
			{users.map(user => (
				<div key={user._id}>
					{user.name}
				</div>
			))}
		</div>
	)
}