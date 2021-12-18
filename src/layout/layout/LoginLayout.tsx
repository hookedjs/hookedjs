import { h } from 'preact'

import { useEffect, useLayoutEffect, useState } from '#lib/hooks'
import { Alert } from '#lib/icons'
import { isOnline, waitForOnline } from '#lib/network'
import pstyled from '#lib/pstyled'

import { applyTheme, defaultTheme } from '../theme'

export default function LoginLayout({children}: any) {
	const [isOnlineS, setIsOnlineS] = useState(isOnline())
	useLayoutEffect(() => applyTheme(defaultTheme))
	useEffect(watchForOnline, [])
	return <LoginLayoutOuter class="dark">
		<LoginLayoutInner>
			{isOnlineS
				? children
				: <OfflineNotice />
			}
		</LoginLayoutInner>
	</LoginLayoutOuter>
	
	function watchForOnline() {
		if (!isOnlineS)
			waitForOnline().then(() => setIsOnlineS(true))
	}
}
const LoginLayoutOuter = pstyled.div`
	:root
		--background-color-light: hsl(var(--primary-h),var(--primary-s),70%)
		--background-color-dark: hsl(var(--primary-h),var(--primary-s),30%)
		--background-color: var(--background-color-light)
		position: absolute
		top: 0
		left: 0
		right: 0
		bottom: 0
		background-color: var(--background-color)
		background-image: url("/fabric.png")
		overflow-x: hidden
		overflow-y: auto
	@media (max-width: 700px)
		:root
			--background-color: var(--background-color-dark)
`

const LoginLayoutInner = pstyled.div`
	:root
		z-index: 1
		position: relative
		top: 10vh
		margin: auto
		width: 340px
		max-width: 100%
		background:  var(--background-color-dark)
		background-image: url("/fabric.png")
		padding: 20px 40px 40px
		border-radius: 10px
	@media (max-width: 700px)
		:root
			top: 5vh
			background: none
			padding: 20px 15px 40px
	:root input
		background-color: rgba(0,0,0,0%)
		border: 2px solid var(--secondary)
		color: white
	:root [data-disabled="true"]>label
		color: white
	:root [data-disabled="true"]>input
		border: 2px solid hsl(var(--secondary-h),var(--secondary-s),calc( var(--secondary-l) - 12% ))
	:root label
		background-color: var(--primary)
		border: 1px solid var(--secondary)
		color: white
	:root a
		color: white
	:root button
		background: var(--primary)
		border: 2px solid var(--secondary)
		width: 100%
	:root form
		margin-bottom: 6px
	:root .switch
		color: white
	:root .switch[data-checked="true"]
		color: var(--secondary)
	:root .checkbox svg
		fill: var(--secondary) !important
`

function OfflineNotice() {
	return (
		<div style={{textAlign: 'center', paddingTop: 30}}>
			<Alert size={60} />
			<p>Authentication is unvailable while offline.</p>
		</div>
	)
}