import {h} from 'preact'

import { useState } from '#lib/hooks'
import styled from '#lib/styled'

import { currentTheme } from '../theme'

interface LogoProps extends h.JSX.HTMLAttributes<HTMLAnchorElement> {size?: number}
export function Logo({size = 1, ...aProps}: LogoProps) {
	const borderColor = currentTheme.secondary
	const borderColorHover = '#aaa'
	const innerColor = currentTheme.primary
	const innerColorHover = currentTheme.primaryHover
	const [colors, setColors] = useState({borderColor: borderColor, innerColor})
	
	return (
		<LogoA
			href='/' {...aProps}
			onMouseEnter={() => setColors({borderColor: borderColorHover, innerColor: innerColorHover})}
			onMouseLeave={() => setColors({borderColor, innerColor})}>
			<div style={{ 
				padding: `${size * 10}px ${size * 10}px`, 
				fontSize: `${size}rem`, 
				backgroundImage: `url('data:image/svg+xml;base64,${btoa(rockyBorderSvg(colors.borderColor, colors.innerColor))}')`
			}}>Stacks!</div>
		</LogoA>
	)
}
// Inline the border svg so we can set the fill of the border color
// eslint-disable-next-line max-len
const rockyBorderSvg = (borderColor: string, innerColor: string) => `<svg height="141" viewBox="0 0 300 141" width="300" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><path d="m150.488599 28.2 18.566776-20.84347826 30.293159 20.84347826 37.133551-28.2 14.65798 28.2 29.315961-11.0347826v35.5565217l19.543974 15.9391305-13.680782 30.6521739-5.863192 26.9739135-29.315961 7.356521-37.13355-13.486956-29.315961 20.843478-22.47557-20.843478-30.29316 13.486956-36.1563517-13.486956-27.3615635 13.486956-23.4527687-13.486956-25.4071662 13.486956-19.5439739-34.3304345 12.7035831-30.6521739-12.7035831-29.426087 25.4071661-11.0347826 19.543974-28.2 29.3159609 28.2 38.110749-28.2z" fill="${borderColor}"/><path d="m150.472313 31.725 17.947882-19.1065217 29.283388 19.1065217 35.895766-25.85 14.169381 25.85 28.338762-10.1152174v32.5934783l18.892508 14.6108695-13.224756 28.0978261-5.667752 24.7260865-28.338762 6.743479-35.895766-12.363044-28.338762 19.106522-21.726384-19.106522-29.283388 12.363044-34.9511401-12.363044-26.4495114 12.363044-22.6710098-12.363044-24.5602606 12.363044-18.8925081-31.4695655 12.2801303-28.0978261-12.2801303-26.973913 24.5602606-10.1152174 18.8925081-25.85 28.3387622 25.85 36.8403911-25.85z" fill="${innerColor}"/></g></svg>`
const LogoA = styled.a`
	:root>div
		display: inline-block
		color: white
		background-repeat: no-repeat
		background-size: contain
		background-position: center
	:root:active>div
		transform: translateY(2px)
`
