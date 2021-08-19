import {ComponentChildren, h} from 'preact'

import { useEffect, useRef, useState } from '#lib/hooks'
import pstyled from '#src/lib/pstyled'
import { PortalStore, usePortalStore } from '#src/stores'

const timeouts = new Set<any>()

export function PortalFromContext() {
	const [Store] = usePortalStore()
	return <Portal {...Store} />
}

export async function portalPrompt<ResponseType extends any>(
	PromptC: ({resolve}: {resolve: (res: any) => void}) => ComponentChildren,
	// PromptC: (close: (res: any) => void) => ComponentChildren,
	options?: {
		location?: PortalProps['location']
		duration?: number
	}
): Promise<ResponseType> {
	const {location = 'center', duration} = options || {}
	let fullfilled = false
	let res: any = undefined
	PortalStore.setValue({ message: PromptC({resolve: _resolve}), location, duration })
	while(!fullfilled) await Promise.sleep(100)
	return res

	function _resolve(_res: any) {
		PortalStore.setValue({ message: undefined, location })
		res = _res
		fullfilled = true
	}
}

export interface PortalProps {
	location: 'right' | 'bottom' | 'center',
	message: ComponentChildren,
	duration?: number
	noStyle?: boolean
}
export default function Portal(p: PortalProps) {
	const
		[timedOut, setTimedOut] = useState(false)
	
	useEffect(init, [p])

	return !!p.message && !timedOut ? (
		<PortalOuter data-location={p.location} data-styled={!p.noStyle}>
			<div>
				<div>
					{p.message}
				</div>
			</div>
		</PortalOuter>
	) : null

	function init() {
		if (p.duration) 
			setTimeout(() => setTimedOut(true), p.duration)
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
	:root[data-location="bottom"]>div
		bottom:10px
		left:0
		display:flex
		justify-content:center
	:root[data-location="right"]>div
		top:60px
		right:10px
		border-radius: 6px
	@media (max-width: 700px)
		:root[data-location="right"]>div
			top:10px
	:root[data-location="center"]>div
		top:150px
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
`
