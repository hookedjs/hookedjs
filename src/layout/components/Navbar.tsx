import '#lib/forms'

import { h } from 'preact'

import { useCallback, useEffect, useRef, useState } from '#lib/hooks'
import {useMedia} from '#lib/hooks'
import * as i from '#lib/icons'
import {LocationStore, nav} from '#lib/router'
import styled from '#lib/styled'
import { Paths } from '#src/routes'
import { SidebarRightStore } from '#src/stores'

import type { NavLinkProps, NavLinks } from '../types'

export default function Navbar(p: { sidebarLeft?: boolean, navLinks: NavLinks, searchOptions?: SearchOption[]}) {
	const isWide = useMedia('(min-width: 700px)')
	return <NavbarDiv>
		<div>
			<LogoA aria-label="Home" href='/'><div><div>
				<i.ReactLogo />
				<div>Stacks!</div>
			</div></div></LogoA>
			{p.sidebarLeft && isWide && p.searchOptions && <SearchBar options={p.searchOptions} />}
		</div>

		<div>
			{isWide && p.navLinks
				.filter(nl => nl.hasAccess ? nl.hasAccess() : true)
				.map(nl => 'isButton' in nl ? <NavButton {...nl} /> : <NavLink {...nl} />)}
			<RightBurger />
		</div>

	</NavbarDiv>
}
const NavbarDiv = styled.div`
	:root
		position: fixed
		top: 0
		left: 0
		width: 100%
		height: var(--header-height)
		background: var(--header-background)
		display: flex
		flex-direction: row
		justify-content: space-between
		overflow: hidden
	:root>div
		height:var(--header-height)
		display:flex
		flex-direction:row
	:root :hover
		text-decoration: none;
`
const LogoA = styled.a`
	:root
		transform: rotate(20deg)
		margin-top: -86px
		margin-left: -14px
		padding: 100px 9px 100px 14px
	:root>div
		transform: rotate(-20deg)
	:root>div>div
		display: flex
		flex-direction: row
		align-items: center
		font-weight: bold
		padding-left: 2px
	:root:hover
		background: var(--secondary)
	:root,
	:root:focus,
	:root:active,
	:root:hover
		color: white
	:root:active>div>div
		transform: translateY(2px)
	:root svg
		color: hsl(var(--primary-h), var(--primary-s), 70%)
		margin: 0 6px 0 8px
`

export interface SearchOption {
	name: string
	value: string
}
function SearchBar(p: {options: SearchOption[]}) {
	const [value, setValue] = useState('')
	const [isFocused, setIsFocused] = useState(false)
	const inputRef = useRef<HTMLInputElement>()
	const selectRef = useRef<HTMLSelectElement>()
	const [option, setOption] = useState(p.options[0].value)
	const onOptionChange = useCallback((e: any) => setOption(e.target.value), [])

	const onBlur = useCallback(_onBlur, [])
	const onClickClear = useCallback(_onClickClear, [])
	const onSubmit = useCallback(_onSubmit, [value])

	return <SearchBarDiv data-focused={isFocused}>
		<form action='search' onSubmit={onSubmit}>
			<div class='select-div'>
				<select
					aria-label="Record Type" 
					name="type"
					onFocus={() => setIsFocused(true)}
					onBlur={onBlur}
					ref={selectRef as Ref<HTMLSelectElement>}
					value={option}
					onChange={onOptionChange}
				>
					{p.options.map(o => <option value={o.value}>{o.name}</option>)}
				</select>
			</div>
			<div class='magglass'><i.Search size={20} horizontal /></div>
			<input
				name="query"
				value={value}
				onInput={(e: any) => setValue(e.target.value)}
				placeholder="Search"
				onFocus={() => setIsFocused(true)}
				onBlur={onBlur}
				ref={inputRef as Ref<HTMLInputElement>}
				aria-label="Search"
			/>
			<a
				href="#search-clear"
				tabIndex={0}
				onClick={onClickClear}
				class={`clear ${isFocused ? 'block' : ''}`}
			>x</a>
		</form>
	</SearchBarDiv>

	function _onBlur(e?: any) {
		setTimeout(() => { // skip a clock cycle b/c body is momentarily active when clicking select
			if (document.activeElement === inputRef.current || document.activeElement === selectRef.current) return
			if (e?.relatedTarget?.hash === '#search-clear') setValue('')
			setIsFocused(false)
			inputRef.current!.blur()
			selectRef.current!.blur()
		})
	}
	// I don't think this is ever actually fired due to blur event preventing it,
	// but just in case it was we handle it.
	function _onClickClear(e: any) {
		e.preventDefault()
		setValue('')
		_onBlur()
	}
	function _onSubmit() { 
		setValue('')
		setIsFocused(false)
		inputRef.current!.blur()
		selectRef.current!.blur()
		nav(option + '?search=' + value)
	}
}
const SearchBarDiv = styled.div`
	:root
		--searchbar-width: 270px
		position: absolute
		left: var(--sidebar-width-full)
		top: 11px
		width: var(--searchbar-width)
	:root[data-focused="true"]
		--searchbar-width: 500px
	:root>form
		position: relative
	:root>form>.select-div
		display: none
		position: absolute
		left: -80px
		top: 0
		width: 80px
		border-right: 1px solid var(--gray8)
		background: var(--searchbar-background)
		border-radius: 2px 0 0 2px
	:root[data-focused="true"]>form>.select-div
		display: initial
	:root>form>.select-div>select
		width: 80px
		color: var(--black)
		border: none
	:root>form>input
		color: var(--black)
		width: 100%
		line-height: 1rem
		padding: .6em 1em .6em 3em
		background: var(--searchbar-background)
		border-radius: 2px
		border: none
		outline: none
		font-size: .85rem
	:root[data-focused="true"]>form>input
		border-radius: 0 2px 2px 0
		background: var(--white)
	.dark :root[data-focused="true"]>form>input
		background: var(--gray6)
	:root>form>input::placeholder
		color: var(--black)
		opacity: 1
	:root>form>.magglass
		color: var(--black)
		position: absolute
		left: 10px
		top: 6px
	:root>form>.clear
		color: var(--black)
		display: none
		position: absolute
		right: 10px
		top: 2px
		font-size: 1.2em
	@media (max-width: 890px)
		:root[data-focused="true"]
			--searchbar-width: 270px
`

function NavButton({ path, title }: { path: string, title: string }) {
	return (
		<NavButtonA href={path}>
			{title}
		</NavButtonA>
	)
}
const NavButtonA = styled.a`
	:root
		z-index: 2
		height: calc( var(--header-height) - 14px )
		margin: 7px 4px 6px 12px
		border-radius: 3px
		display: flex
		flex-direction: row
		align-items: center
		padding: 1px 10px 0
		color: white
		background: var(--primary)
	:root:hover
		color: white
		background: var(--primary-hover)
	:root:active
		color:white
		transform: translateY(2px)
	:root:focus
		color: white
`

function NavLink(p: NavLinkProps) {
	const [_location] = LocationStore.use()
	const [isSidebarActive] = SidebarRightStore.use()
	const isActive = _location.pathname.startsWith(p.path)
	return (
		<NavLinkA
			aria-label={p.title}
			data-active={isActive && !isSidebarActive}
			href={p.path + (isActive && 'stack' in p ? '#stack-reset' : '')}>
			<div><div>{p.title}</div></div>
		</NavLinkA>
	)
}
const NavLinkA = styled.a`
	:root
		display: flex
		flex-direction: row
		align-items: center
		margin-top: -55px
		padding: 80px 12px
		color: white
		transform: rotate(20deg)
	:root:hover,
	:root[data-active="true"]
		background:var(--secondary)
	:root:active>div>div
		color:white
		transform: translateY(2px)
	:root:focus, :root:hover
		color:white
	:root>div
		transform: rotate(-20deg)
`

/**
 * This is a little complex b/c it can have a diff state than sidebarRight b/c the sidebar can
 * also be activated in BottomNav components. The added complexity allows NavBurger to handle 
 * this gracefully.
 */
function RightBurger() {
	const [isLinkActive, setIsLinkActive] = useState(false)
	const [isSidebarActive, setIsSidebarActive] = SidebarRightStore.use()
	useEffect(() => {if (!isSidebarActive) setIsLinkActive(false)}, [isSidebarActive])
	const onClick = useCallback(_onClick, [])
	return (
		<NavBurgerA 
			aria-label="Toggle Right Menu"
			data-active={isLinkActive}
			href={'#navburger-click'}
			onClick={onClick}
		>
			<div>{isLinkActive ? <i.Close /> : <i.Menu />}</div>
		</NavBurgerA>
	)

	function _onClick(e: any) {
		e.preventDefault()
		setIsLinkActive(isActive => {
			setIsSidebarActive(!isActive)
			return !isActive
		})
	}
}
const NavBurgerA = styled.a`
	:root
		z-index: 2
		height: var(--header-height)
		width: 50px
		display: flex
		flex-direction: row
		align-items: center
		padding-top: 2.5px
		color: white
	:root:hover,
	:root[data-active="true"]
		background: var(--primary)
	:root:focus,
	:root:active,
	:root:hover
		color: white
	:root>div
		margin: auto
	:root:active>div
		transform: translateY(2px)
`
