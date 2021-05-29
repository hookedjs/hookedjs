import {h} from 'preact'

import {Auth} from '#lib/icons'
import styled from '#lib/styled'


export default function Forbidden() {
	return <ForbiddenDiv>
		<div>
			<Auth size={200} />
			<h1>You lack access to this page.</h1>
			<br />
			<a href='/'>Home</a>&nbsp;&nbsp;&nbsp;
			<a href={'/login?from=' + location.pathname + location.search}>Login</a>
		</div>
	</ForbiddenDiv>
}
// Background thanks to transparenttextures.com
const ForbiddenDiv = styled.div`
	:root
		position: absolute
		top:0
		bottom:0
		left:0
		right:0
		background-color: hsl(var(--primary-h),var(--primary-s),70%)
		background-image: url("/fabric.png")
	:root div
		text-align: center
		padding-top: 10vh
	:root img
		max-width:90%
	:root *
		color: black
	:root a
		background: var(--primary)
		color:white
		padding:8px 12px
		border-radius:2px
	:root a:hover
		background: hsl(var(--primary-h),var(--primary-s),50%)
`
