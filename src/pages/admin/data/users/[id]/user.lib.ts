import env from '#src/lib/config'
export const userEndpoint = `${env.apiPrefix}/admin/users`
export function userByIdEndpoint(id: string) { return `${userEndpoint}/${id}` }
