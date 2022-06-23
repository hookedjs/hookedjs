import NavLink from '#src/layout/components/SidebarNavLink'
import pstyled from '#src/lib/pstyled'
import {replacePathVars, useLocationStore} from '#src/lib/router'
import {useSidebarRightStore} from '#src/stores'
import {Fragment as F, h} from 'preact'

import type {NavLinks} from '../types'
import {Logo} from './Logo'

export default function SidebarRight({navLinks}: {navLinks: NavLinks}) {
  const [isActive] = useSidebarRightStore()
  return isActive ? (
    <SidebarDiv>
      <Logo size={2} class="logo" />
      <SidebarNav>
        <SidebarNavInner navLinks={navLinks} />
      </SidebarNav>
    </SidebarDiv>
  ) : (
    <F />
  )
}
const SidebarDiv = pstyled.div`
	:root
		position: absolute
		top: var(--content-top)
		right: 0
		width: var(--sidebarRight-width)
		background: var(--gray6)
		overflow-x: hidden
		border-left: 1px solid var(--gray4)
		border-bottom: 1px solid var(--gray4)
		border-radius: 0 0 8px 8px
		z-index: 2
	:root>.logo
		display: none
		margin-left: 28px
	@media (max-width: 700px)
		:root
			padding-top: 30px
			height: var(--content-height)
			border-radius: 0
			border-bottom: none
		:root>.logo
			display: initial
`
const SidebarNav = pstyled.nav`
	:root
		width: var(--sidebarRight-width)
`

function SidebarNavInner(props: {navLinks: NavLinks}) {
  const [loc] = useLocationStore()
  return (
    <F>
      {props.navLinks
        .filter(nl => (nl.hasAccess ? nl.hasAccess() : true))
        .map(nl => ({...nl, path: replacePathVars(nl.path, loc.route?.vars)}))
        .map(nl => (
          <NavLink {...nl} />
        ))}
    </F>
  )
}
