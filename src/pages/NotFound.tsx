import {h} from 'preact'

import {MapPin} from '#lib/icons'
import styled from '#lib/styled'

export default function NotFound() {
	return <NotFoundDiv>
		<div>
			<div><img src="/notfound.png" width="300" height="300" /></div>
			<MapPinDiv><MapPin size={50} fill="var(--primary)" /></MapPinDiv>
			<h1>Page not found!</h1>
			<br />
			<a href='/'>Go Home?</a>
		</div>
	</NotFoundDiv>
}
// Background thanks to transparenttextures.com
const NotFoundDiv = styled.div`
	:root 
		position: absolute
		top:0
		bottom:0
		left:0
		right:0
		background-color: hsl(var(--primary-h),var(--primary-s),70%)
		background-image: url("/fabric.png")
	:root>div
		text-align: center
		padding-top: 10vh
	:root h1
		color: black
	:root a
		background: var(--primary)
		color:white
		padding:8px 12px
		border-radius: 2px
	:root a:hover
		background: hsl(var(--primary-h),var(--primary-s),50%)
	@media (max-width: 700px)
		:root img
			width: 200px
			height: 200px
`
const MapPinDiv = styled.div`
	:root
		margin-top: -190px
		margin-bottom: 180px
	@media (max-width: 700px)
		:root
			margin-top: -130px
			margin-bottom: 120px
`