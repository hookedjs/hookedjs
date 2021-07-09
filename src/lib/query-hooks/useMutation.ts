import {useCallback, useState} from '../hooks'

interface HookState<MutatorShape extends PromiseFnc> {
	mutate(...params: Parameters<MutatorShape>): Promise<ThenArg<ReturnType<MutatorShape>>>
	isLoading: boolean
	data?: MutatorShape
	error?: Error
}

/**
 * Hookifies a mutation function to make it stateful
 */
export default function useMutation<
	MutatorShape extends PromiseFnc
>(
	// Mutator function to use
	mutator: MutatorShape,
	events: {
		onCall?: () => any
		onSuccess?: (res: ThenArg<ReturnType<MutatorShape>>) => any
		onError?: (error: Error) => any
	} = {},
) {

	const mutate = useCallback(mutateCb, [mutator])

	const [state, setState] = useState<HookState<MutatorShape>>(
		{mutate, isLoading:false, data:undefined, error:undefined}
	)
	return state

	async function mutateCb(...params: Parameters<MutatorShape>): Promise<ThenArg<ReturnType<MutatorShape>>> {
		if (state.isLoading)
			throw new Error('Cannot call mutation while prior call is still running')
		setState({mutate, isLoading:true, data:undefined, error:undefined})
		events.onCall?.()
		const res = 
			await mutator(...params as any) // idk why this type-errors
				.then(async res => {
					setState({mutate, isLoading:false, data:res, error:undefined})
					events.onSuccess?.(res)
					return res
				})
				.catch(error => {
					setState({
						mutate, isLoading:false, data:undefined, error})
					events.onError?.(error)
					throw Error(error)}
				)
		return res
	}
}
