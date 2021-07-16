import Database from '../lib/Database'

const tenantDb = new Database({name: 'hooked', host: 'http://localhost:5984'})
export default tenantDb

async function test() {
	const todo = {
		type: 'todo',
		title: 'hello',
		completed: false
	}
	tenantDb.connect({user: 'admin', password: 'password'})
	const todo2 = await tenantDb.set(todo)
	console.log(todo2._rev ? 'Save succeeded!' : 'Save failed')
	const todo3 = await tenantDb.get(todo2._id)
	console.log(todo3._rev ? 'Get succeeded!' : 'Get failed')
	const todo4 = await tenantDb.findOne({selector: {_id: todo2._id}})
	console.log(todo4._rev ? 'Find succeeded!' : 'Find failed')
	const listener = tenantDb.subscribe([todo2._id], (change) => { console.log('Change: ', change) })
	const todo5 = await tenantDb.delete(todo4)
	console.log(todo5.deletedAt ? 'Delete succeeded!' : 'Delete failed')
	const todo6 = await tenantDb.deletePermanent(todo5)
	console.log(todo6 ? 'Delete Perm succeeded!' : 'Delete Perm failed')
	listener.cancel()
}
// test()
