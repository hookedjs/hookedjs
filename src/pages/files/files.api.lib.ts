import config from '#lib/config.iso'

export const fileEndpoint = `${config.apiPrefix}/files`
export function fileByIdEndpoint(id: string) { return `${fileEndpoint}/${id}` }
