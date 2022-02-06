/**
 * An interface for localfolder file storage
 */
import fs from 'fs'
import path from 'path'

import type { GetResult } from './types'

const tmpDir = __dirname + '/../../.fileStorage/'

export default {
	async get(key: string): Promise<GetResult> {
		const 
			filePath = tmpDir + key
		const 
			meta = JSON.parse(await fs.promises.readFile(filePath + '.meta', 'utf-8'))
			,data = await fs.promises.readFile(filePath)
		return {
			contentType: meta.contentType,
			createdAt: new Date(meta.createdAt),
			data
		}
	},
	async put(key: string, data: any, contentType: string) {
		const 
			filePath = tmpDir + key
			,fileDir = path.dirname(filePath)
		await fs.promises.mkdir(fileDir, {recursive: true})
		await fs.promises.writeFile(filePath + '.meta', JSON.stringify({key, contentType, createdAt: new Date().toISOString()}, null, 2))
		await fs.promises.writeFile(filePath, data)
	},
}