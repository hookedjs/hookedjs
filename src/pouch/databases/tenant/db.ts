import { loadingDb } from '../../lib/Database'

export default {
	host: 'https://localhost:3000/db',
	handle: loadingDb,
	get isReady() { return this.handle !== loadingDb },
}