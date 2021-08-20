import {ComponentChildren, h} from 'preact'

import { useClickAway, useEffect, useKey, useRef, useState } from '#lib/hooks'
import pstyled from '#src/lib/pstyled'
import { PortalStore, usePortalStore } from '#src/stores'

export function PortalFromContext() {
	const [Store] = usePortalStore()
	return <Portal {...Store} />
}

export interface PortalProps {
	placement: 'right' | 'bottom' | 'center' | 'top',
	message: ComponentChildren,
	duration?: number
	styled?: boolean
	onDismiss?: () => void
	dismissable?: boolean
}
export default function Portal(p: PortalProps) {
	const
		{ placement = 'center', message, duration, styled = true, onDismiss, dismissable = true } = p,
		[timedOut, setTimedOut] = useState(false),
		[dismissed, dismiss] = useState(false),
		ref = useRef<HTMLDivElement>(null)

	useEffect(init, [p])
	useClickAway(ref, () => dismissable && dismiss(true))
	useKey(useKey.codes['Esc'], () => dismissable && dismiss(true))
	useEffect(() => {dismissed && onDismiss?.()}, [dismissed])

	return !!message && !timedOut && !dismissed ? (
		<PortalOuter data-placement={placement} data-styled={styled}>
			<div>
				<div ref={ref as any}>
					{message}
				</div>
			</div>
		</PortalOuter>
	) : null

	function init() {
		dismiss(false)
		if (duration) 
			setTimeout(() => setTimedOut(true), duration)
	}
}

const PortalOuter = pstyled.div`
	:root
		position:absolute
		top:0
		left:0
		right:0
		bottom:0
		z-index:100
		background:rgba(0,0,0,0.5)
	:root>div
		position:absolute
	:root[data-placement="bottom"]>div
		bottom:10px
		left:0
		display:flex
		justify-content:center
	:root[data-placement="right"]>div
		top:60px
		right:10px
		border-radius: 6px
	@media (max-width: 700px)
		:root[data-placement="right"]>div
			top:10px
	:root[data-placement="center"]>div
		top:150px
		left:0
		width:100%
		display:flex
		justify-content:center
	:root[data-placement="top"]>div
		top:0
		left:0
		width:100%
		display:flex
		justify-content:center
	:root[data-styled="true"]>div>div
		overflow:auto
		padding:15px 20px
		background:var(--white)
		display:inline-block
		border-radius: 6px
		border: 1px solid var(--gray5)
	:root[data-styled="true"][data-placement="top"]>div>div
		border-top-left-radius:0
		border-top-right-radius:0
`


Portal.prompt = async <ResponseType extends any>(
	PromptC: ({resolve}: {resolve: (res: any) => void}) => ComponentChildren,
	options?: {
		dismissVal?: any,
		placement?: PortalProps['placement']
		duration?: number,
		dismissable?: boolean,
	}
): Promise<ResponseType> => {
	const {placement = 'top', duration, dismissVal, dismissable = true} = options || {}
	let fullfilled = false
	let res: any = undefined
	PortalStore.setValue({ message: PromptC({resolve: _resolve}), duration, placement, dismissable, onDismiss })
	while(!fullfilled) await Promise.sleep(100)
	return res

	function _resolve(_res: any) {
		PortalStore.setValue({ message: undefined, placement })
		res = _res
		fullfilled = true
	}
	function onDismiss() {
		res = dismissVal
		fullfilled = true
	}
}