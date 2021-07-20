import { h } from 'preact'

import { useCallback, useEffect, useState } from '#lib/hooks'
import * as i from '#lib/icons'
import {useLocationStore} from '#lib/router'
import styled from '#lib/styled'
import { useSidebarRightStore } from '#src/stores'

import type { NavLinkProps, NavLinks } from '../types'


export default function BottomNav({ navLinks }: { navLinks: NavLinks }) {
	return <Nav>
		{navLinks
			.filter(nl => nl.hasAccess ? nl.hasAccess() : true)
			.map(nl => <NavLink {...nl} />)}
		<NavBurger />
	</Nav>
}
const Nav = styled.div`
	:root
		z-index: 1
		will-change: scroll-position
		position: fixed
		bottom: 0
		width: 100%
		background: var(--gray2)
		display: flex
		flex-direction: row
		height: var(--bottom-nav-height)
		overflow-y: hidden
	.dark :root
		background: var(--gray1)
`


function NavLink(p: NavLinkProps) {
	const [_location] = useLocationStore()
	const [isSidebarActive] = useSidebarRightStore()
	const isActive = _location.pathname.startsWith(p.path)
	const Icon = p.Icon ?? i.Info
	return (
		<NavLinkA
			aria-label={p.title}
			data-active={isActive && !isSidebarActive}
			href={p.path + (isActive && 'stack' in p ? '#stack-reset' : '')}>
			<div><Icon /></div>
		</NavLinkA>
	)
}
const NavLinkA = styled.a`
	:root
		--color: var(--gray6)
		--border-top-color: var(--gray2)
	:root[data-active="true"]
		--color: var(--primary)
		--border-top-color: var(--primary)
	.dark :root
		--color: var(--gray7)
		--border-top-color: var(--gray1)
	.dark :root[data-active="true"]
		--border-top-color: var(--primary)
	:root
		flex-grow: 1
		text-align: center
		color: var(--color)
		border-top: 3px solid var(--border-top-color)
		padding: 8px
		text-decoration: none !important
		margin: 0 6px
	:root *
		color: var(--color)
	:root:active div
		transform: translateY(2px)
`


/**
 * This is a little more complex than the Marketing Navburger, b/c it can have a diff
 * state than sidebarRight b/c the sidebar can also be activated in the 
 * Header->Right->Navburger. The added complexity allows NavBurger to handle this
 * gracefully.
 */
function NavBurger() {
	const [isActive, setIsActive] = useState(false)
	const [isSidebarActive, setIsSidebarActive] = useSidebarRightStore()
	const onClick = useCallback(_onClick, [])
	useEffect(() => {if (!isSidebarActive) setIsActive(false)}, [isSidebarActive])
	return (
		<NavLinkA 
			aria-label="Open Right menu"
			data-active={isActive}
			href="#sidebar-right-toggle"
			onClick={onClick}
		>
			<div>{isActive
				? <i.Close width={22}  />
				: <i.Menu width={22} />
			}</div>
		</NavLinkA>
	)

	function _onClick(e: any) {
		e.preventDefault()
		setIsActive(isActive => {
			setIsSidebarActive(!isActive)
			return !isActive
		})
	}
}