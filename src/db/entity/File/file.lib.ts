import config from '#lib/config'
import { assertAttrsWithin, assertValid, assertValidSet } from '#lib/validation'

export function fileByIdEndpoint(id: string) { return `${config.apiPrefix}/crud/files/${id}/file` }

export class PostProps {
		data = ''
		mimetype = ''
		constructor(props: any) {
			assertAttrsWithin(props, this)
			assertValidSet<PostProps>(props, {
				data: assertValid('data', props.data, ['isDefined', 'isString', 'isNoneEmpty']),
				mimetype: assertValid('mimetype', props.mimetype, ['isDefined', 'isString', 'isNoneEmpty']),
			})
			Object.assign(this, props)
		}
}
export const PostPropsExample = new PostProps({
	data: 'hello, world',
	mimetype: 'text/plain;charset=UTF-8',
})
export const PostPropsEnum = Enum.getEnumFromClassInstance(PostPropsExample)