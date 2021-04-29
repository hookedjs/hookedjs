const endpointPrefix = '/files'
export function fileByIdEndpoint(id: string) { return `${endpointPrefix}/${id}` }
export function fileMetaByIdEndpoint(id: string) { return `${fileByIdEndpoint(id)}/meta` }
