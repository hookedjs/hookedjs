import { h } from 'preact'

import NavLink from '#layout/components/SidebarNavLink'
import * as i from '#lib/icons'
import styled from '#lib/styled'
import { AuthStore, SidebarLeftStore } from '#src/stores'

import type { NavLinks } from '../types'

export default function Sidebar({ navLinks }: { navLinks: NavLinks }) {
	return (
		<SidebarDiv>
			<SidebarHeader />
			<SidebarToggler />
			<Nav>
				{navLinks
					.filter(nl => nl.hasAccess ? nl.hasAccess() : true)
					.map(nl => <NavLink {...nl} />)}
			</Nav>
		</SidebarDiv>
	)
}
const SidebarDiv = styled.div`
	:root
		position: fixed
		top: var(--header-height)
		left: 0
		width: var(--sidebar-width)
		background: var(--sidebar-background)
		height: var(--body-height)
		z-index: 1
`

export function SidebarHeader() {
	return (
		<SidebarHeaderDiv>
			<div class='left'>
				<i.Person size={76} class="svg-div full"/>
				<i.Person size={50} class="svg-div mini" />
				<div class='label full'>{AuthStore.value.roles.includes(AuthStore.roles.ADMIN) ? 'Admin' : 'Tenant'}</div>
				<div class='label mini'>Nancy</div>
			</div>
			<div class='right'>
				<div class='top'>Active</div>
				<div class='middle'>Nancy Dombrowski</div>
				<div class='bottom'>nancy.smith@gmail.com</div>
			</div>
		</SidebarHeaderDiv>
	)
}
const SidebarHeaderDiv = styled.div`
	:root
		width: var(--sidebar-width)
		position: relative
		display: flex
		flex-direction: row
		align-items: center
		padding: 18px 0 24px 10px
		/*margin-bottom: 12px*/
	:root>.left
		position: relative
		display: flex
		flex-direction: column
		align-items: center
		padding-right: 12px
	:root>.left>.svg-div
		color: var(--gray8)
		background: var(--gray4)
		border-radius: 100px
		padding: 8px 10px 10px 8px
	:root>.left>.svg-div.mini
		padding: 0
		display: none
	:root>.left>.label
		font-family: var(--font-serif);
		text-transform: uppercase
		font-size: .6rem
		font-weight: bold
		padding: .2rem .5rem
		color: var(--gray9)
		margin: -10px
		background: var(--gray4)
		border-radius: 3px
		border: 1px solid var(--gray5)
	:root>.left>.label.mini
		display: none
	:root>.right
		flex-grow: 1
	:root>.right>.top
		color: var(--gray8)
		font-weight: bold
		font-size: .8rem
		margin-bottom: .2rem
	:root>.right>.bottom
		margin-top: .4rem
		color: var(--gray10)
		font-size: .7rem
	.miniSidebar :root>.left
		flex-grow: 1
	.miniSidebar :root>.left>.svg-div.full,
	.miniSidebar :root>.left>.label.full
		display: none
	.miniSidebar :root>.left>.svg-div.mini,
	.miniSidebar :root>.left>.label.mini
		display: initial
	.miniSidebar :root>.right
		display: none
`

export function SidebarToggler() {
	return (
		<SidebarTogglerDiv>
			<a class='toggle' href='#sidebar-toggle'>
				<i.ChevronL2x size={19} class="collapse" />
				<i.ChevronR2x size={19} class="expand" />
			</a>
		</SidebarTogglerDiv>
	)
}
const SidebarTogglerDiv = styled.div`
	:root
		margin-right: 10px
		margin-left: 10px
		margin: 0 10px 16px
		border-bottom: 2px solid var(--gray5)
		position: relative
	:root>.toggle
		color: var(--gray8)
		background: var(--gray5)
		position: absolute
		top: -9px
		right: 0
		width: 19px
		height: 18px
		border-radius: 6px
	:root>.toggle:hover
		background: var(--gray4)
	:root>.toggle>.expand
		display: none
	.miniSidebar :root>.toggle>.collapse
		display: none
	.miniSidebar :root>.toggle>.expand
		display: block
`

const Nav = styled.nav`
	:root
		visibility: visible
	.miniSidebar :root
		width: var(--sidebar-width)
	.miniSidebar :root .navlinkText
		display: none
`