import { ComponentChildren, h } from 'preact'

import { useEffect, useRef } from '#lib/hooks'
import {useMedia} from '#lib/hooks'
import styled from '#lib/styled'
import { ThemeStore } from '#src/stores'

import BottomNav from '../components/BottomNav'
import Navbar, { SearchOption } from '../components/Navbar'
import RoundedContent from '../components/RoundedContent'
import Sidebar from '../components/Sidebar'
import SidebarRight from '../components/SidebarRight'
import type { NavLinks } from '../types'

export default function SidebarLayout(p: {
	topLinks: NavLinks
	leftLinks: NavLinks
	rightLinks: NavLinks
	bottomLinks: NavLinks
	searchOptions: SearchOption[]
	children: ComponentChildren
}) {
	const isWide = useMedia('(min-width: 700px)')
	const ref = useRef<any>(null)
	useEffect(listenForThemeToggle, [])
	return (
		<SidebarLayoutDiv ref={ref} class={ThemeStore.value === 'dark' ? 'dark' : ''}>
			{isWide && <Navbar sidebarLeft navLinks={p.topLinks} searchOptions={p.searchOptions} />}
			{isWide && <Sidebar navLinks={p.leftLinks} />}
			<SidebarRight navLinks={p.rightLinks} />
			{!isWide && <BottomNav navLinks={p.bottomLinks} />}
			<RoundedContent withSidebar>
				{p.children}
			</RoundedContent>
		</SidebarLayoutDiv>
	)

	// Use passive listeners instead of ThemeStore.use, to avoid unnecessary re-renders
	function listenForThemeToggle() {
		return ThemeStore.subscribe(function _toggle() {
			const cl = ref.current.base.classList
			if (cl.contains('dark')) cl.remove('dark')
			else cl.add('dark')
		})
	}
}

const SidebarLayoutDiv = styled.div`
	:root
		--content-background: var(--sidebar-background)
		--sidebarRight-width: 260px
		--sidebar-width-full: 300px
		--sidebar-width-mini: 94px
		--sidebar-width: var(--sidebar-width-full)
		--bottom-nav-height: 44px
		--content-top: var(--header-height)
		--content-top-padding: 10px
		--content-inner-top: calc( var(--content-top) + var(--content-top-padding) )
		--content-bottom: 0px
		--content-bottom-padding: 10px
		--content-inner-bottom: calc( var(--content-bottom) + var(--content-bottom-padding) )
		--content-right: 0px
		--content-right-padding: 10px
		--content-inner-right: calc( var(--content-right) + var(--content-right-padding) + var(--scrollbar-width) )
		--content-left: var(--sidebar-width)
		--content-left-padding: 0px
		--content-inner-left: calc( var(--content-left) + var(--content-left-padding) )
		--content-height: calc( var(--vh) - var(--header-height) )
		--content-inner-height: calc( var(--content-height) - var(--content-bottom-padding) )
	@media (max-width: 1200px)
		:root
			--sidebar-width-full: 260px
	@media (max-width: 700px)
		:root
			--content-top: 0px
			--content-bottom: var(--bottom-nav-height)
			--content-left: 0px
			--content-left-padding: 10px
			--content-height: calc( var(--vh) - var(--bottom-nav-height) )
	.miniSidebar :root
		--sidebar-width: var(--sidebar-width-mini)
`

