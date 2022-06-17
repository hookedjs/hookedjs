import {useMedia} from '#src/lib/hooks'
import pstyled from '#src/lib/pstyled'
import {Content} from '#src/lib/router'
import {ComponentChildren, h} from 'preact'

import * as i from '../../lib/icons'

export default function RoundedContent(p: {children: ComponentChildren; withSidebar?: boolean}) {
  const isWide = useMedia('(min-width: 700px)')
  const cornerSize = 10
  return (
    <ContentDiv id="content" data-withSidebar={p.withSidebar} data-isWide={isWide}>
      {p.children}
      <div class="frame">
        <div class="topBumper" />
        <i.RoundedCornerInv class="corner1" size={cornerSize} />
        <i.RoundedCornerInv class="corner2" size={cornerSize} horizontal />
        <i.RoundedCornerInv class="corner3" size={cornerSize} vertical />
        <i.RoundedCornerInv class="corner4" size={cornerSize} vertical horizontal />
        <div class="bottomBumper" />
      </div>
    </ContentDiv>
  )
}
const ContentDiv = pstyled.div`
	:root
		position: absolute
		top: var(--content-top)
		left: var(--content-left)
		bottom: var(--content-bottom)
		right: var(--content-right)
		padding-right: var(--content-right-padding)
		padding-bottom: var(--content-bottom-padding)
		padding-left: var(--content-left-padding)
		background: var(--content-background)
		overflow: hidden scroll
		z-index: 0
	:root>.frame
		color: var(--content-background)
	:root>.frame>.topBumper
		position: fixed
		top: var(--content-top)
		left: var(--content-left)
		right: var(--content-inner-right)
		height: var(--content-top-padding)
		background: currentColor
	:root>.frame>.bottomBumper
		position: fixed
		bottom: var(--content-bottom)
		left: var(--content-left)
		right: var(--content-inner-right)
		height: var(--content-bottom-padding)
		background: currentColor
	:root>.frame>.corner1
		position: fixed
		top: var(--content-inner-top)
		left: var(--content-inner-left)
	:root>.frame>.corner2
		position: fixed
		top: var(--content-inner-top)
		right: var(--content-inner-right)
	:root>.frame>.corner3
		position: fixed
		bottom: var(--content-inner-bottom)
		left: var(--content-inner-left)
	:root>.frame>.corner4
		position: fixed
		bottom: var(--content-inner-bottom)
		right: var(--content-inner-right)
`
