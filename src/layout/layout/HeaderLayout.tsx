import pstyled from '#src/lib/pstyled'
import {ComponentChildren, h} from 'preact'

import Navbar from '../components/Navbar'
import RoundedContent from '../components/RoundedContent'
import SidebarRight from '../components/SidebarRight'
import type {NavLinks} from '../types'

export default function HeaderLayout(p: {topLinks: NavLinks; rightLinks: NavLinks; children: ComponentChildren}) {
  return (
    <HeaderLayoutDiv>
      <Navbar navLinks={p.topLinks} />
      <SidebarRight navLinks={p.rightLinks} />
      <RoundedContent>{p.children}</RoundedContent>
    </HeaderLayoutDiv>
  )
}
const HeaderLayoutDiv = pstyled.div`
	:root
		--content-background: var(--sidebar-background)
		--sidebarRight-width: 260px
		--content-top: var(--header-height)
		--content-top-padding: 10px
		--content-inner-top: calc( var(--content-top) + var(--content-top-padding) )
		--content-bottom: 0px
		--content-bottom-padding: 10px
		--content-inner-bottom: calc( var(--content-bottom) + var(--content-bottom-padding) )
		--content-right: 0px
		--content-right-padding: 10px
		--content-inner-right: calc( var(--content-right) + var(--content-right-padding) + var(--scrollbar-width) )
		--content-left: 0px
		--content-left-padding: 10px
		--content-inner-left: calc( var(--content-left) + var(--content-left-padding) )
		--content-height: calc( var(--vh) - var(--header-height) )
		--content-inner-height: calc( var(--content-height) - var(--content-bottom-padding) )
		background: var(--white)
`
