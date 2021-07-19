import type { UserRoleEnum } from '#src/db/entity/lib'

import PouchCollection from '../../../lib/Collection'
import {createModelHooks} from '../../../lib/hooks'
import PouchModel from '../../../lib/Model'
import db from '../db'

interface ITenantPersonExtra {
	name: string
	age: number
	roles: UserRoleEnum[]
	otherInfo: Record<string, any>
}

export class TenantPerson extends PouchModel<ITenantPersonExtra> {
	static get db() {return db.handle}
	get db() {return db.handle}
	static type = 'person'
	type = TenantPerson.type
	name: ITenantPersonExtra['name']
	age: ITenantPersonExtra['age']
	roles: ITenantPersonExtra['roles']
	otherInfo: ITenantPersonExtra['otherInfo'] = {}
}

class TenantPersonCollection extends PouchCollection<TenantPerson> {
	model = TenantPerson
}
export const TenantPersons = new TenantPersonCollection()

export const [useTenantPerson, useTenantPersonS] = createModelHooks<TenantPerson>(TenantPersons)
