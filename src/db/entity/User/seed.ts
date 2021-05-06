import { UserCreate as CreateType, UserEntity as Entity, UserRoleEnum } from '.'

export default async function seedUsers() {
	console.log('Inserting user records into the database...')
	
	const records = await Entity.insertSafe(fakeRecords)
	console.log('Loaded records: ', records)

	// const record = await Entity.createSafe(fakeRecords[0])
	// console.dir(record)

	// const record = new Entity(fakeRecords[0])
	// await record.saveSafe()
	// console.dir(record)

	// const record2 = await Entity.findOne({where: {email: 'admin@hookedjs.org'}})
	// console.log(await record2!.comparePassword('Password2'))
	// record2!.password = 'Password3'
	// await record2!.saveSafe()
	// console.log(record2!.passwordVersion)
	// console.log(record2)
	// console.log(await record2!.comparePassword('Password9'))
}

export const fakeRecords: CreateType[] = [
	{
		email: 'admin@hookedjs.org',
		roles: [UserRoleEnum.ADMIN],
		password: 'Password8',
		// status: 4,
		givenName: 'Sally',
		surname: 'Admin',
	},
	{
		email: 'editor@hookedjs.org',
		roles: [UserRoleEnum.EDITOR],
		givenName: 'Sally',
		surname: 'Editor',
	},
	{
		email: 'author@hookedjs.org',
		// roles: [UserRoleEnum.AUTHOR],
		givenName: 'Sally',
		surname: 'Author',
	}
]