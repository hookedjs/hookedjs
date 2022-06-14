import {h} from 'preact'

import { ArrowL } from '#src/lib/icons'
import pstyled from '#src/lib/pstyled'

export default function BackButton() {
	return <BackButtonDiv>
		<BackButtonA title="Go Back" href="#stack-back">
			<ArrowL size={20} />
		</BackButtonA>
	</BackButtonDiv>
}
const BackButtonDiv = pstyled.div`
	:root
		position: relative
		display: inline-block
		width: 40px
		height: 39px
		margin-top: -40px
		top: 12px
		left: -10px
		background: var(--gray2)
		border-radius: 30px
		z-index: 1
`
const BackButtonA = pstyled.a`
	:root
		position: fixed
		display: block
		top: calc( var(--content-inner-top) + 17px )
		left: calc( var(--content-inner-left) + 10px )
		color: var(--gray7)
		border-radius: 30px
		margin-right: 4px
		height: 39px
		width: 40px
		background: var(--gray3)
	:root
		display: block
	:root:hover
		background: var(--gray4)
	:root:active
		transform: translateY(2px)
	:root>svg
		position: relative
		top: 7px
		left: 10px
	@supports (-webkit-touch-callout: none)
		:root>svg
			top: 6px
`