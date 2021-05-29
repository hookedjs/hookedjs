/**
 * Lazily-loaded icons from Material Design Icons, and helpers to 
 * add more features and easily manage them.
 * 
 * For enhanced props, see IconSvgProps
 */

import { h } from 'preact'

import { load } from './assets'
import { useEffect, useMountedState,useState } from './hooks'

// Add css spin effects
load('style', {innerHTML: `
@keyframes spin-inverse { to { transform: rotate(-360deg) } }
@keyframes spin { to { transform: rotate(360deg) } }
`})


// MDI Icons
const L = LazyIconFactory
const I = IconFactory
export const Account =		L(() => import('mdi-paths-split/CardAccountDetailsOutline'))
export const Alert = 			L(() => import('mdi-paths-split/AlertOutline'))
export const ArrowL =			L(() => import('mdi-paths-split/ArrowLeft'))
export const ArrowR =			L(() => import('mdi-paths-split/ArrowRight'))
export const Auth =				L(() => import('mdi-paths-split/ShieldAccountOutline'))
export const Building =		L(() => import('mdi-paths-split/OfficeBuildingMarkerOutline'))
export const CarrotUp =		L(() => import('mdi-paths-split/MenuUp'))
export const CarrotDown =	L(() => import('mdi-paths-split/MenuDown'))
export const CarrotLeft = L(() => import('mdi-paths-split/MenuLeft'))
export const CarrotRight= L(() => import('mdi-paths-split/MenuRight'))
export const CheckboxM =	L(() => import('mdi-paths-split/CheckboxMarked'))
export const CheckboxB =	L(() => import('mdi-paths-split/CheckboxBlankOutline'))
export const ChevronL2x = L(() => import('mdi-paths-split/ChevronDoubleLeft'))
export const ChevronR2x = L(() => import('mdi-paths-split/ChevronDoubleRight'))
export const Close = 			L(() => import('mdi-paths-split/Close'))
export const Counter =		L(() => import('mdi-paths-split/Counter'))
export const DotsV = 			L(() => import('mdi-paths-split/DotsVertical'))
export const Error = 			L(() => import('mdi-paths-split/AlertOctagonOutline'))
export const Home =				L(() => import('mdi-paths-split/HomeOutline'))
export const Info =				L(() => import('mdi-paths-split/InformationOutline'))
export const Login =			L(() => import('mdi-paths-split/LoginVariant'))
export const Logout =			L(() => import('mdi-paths-split/LogoutVariant'))
export const MapPin =			L(() => import('mdi-paths-split/MapMarker'))
export const Menu =				L(() => import('mdi-paths-split/MenuOpen'))
export const Person = 		L(() => import('mdi-paths-split/Account'))
export const Palette =		L(() => import('mdi-paths-split/PaletteOutline'))
export const Post =				L(() => import('mdi-paths-split/PostOutline'))
export const ReactLogo =	L(() => import('mdi-paths-split/React'))
export const RoundedCornerInv = L(() => import('./iconsCustom/RoundedCornerInverted'))
export const Search =			L(() => import('mdi-paths-split/Magnify'))
export const Support =		L(() => import('mdi-paths-split/Lifebuoy'))
export const Success =		L(() => import('mdi-paths-split/CheckCircleOutline'))
export const Tasks =			L(() => import('mdi-paths-split/OrderBoolAscendingVariant'))


// Helpers

function LazyIconFactory(lazyPath: LazyIconSvgProps['svgPathImport']) {
	const IconComponent: IconComponentType = (props: IconProps) => <LazyIconSvg svgPathImport={lazyPath} {...props} />
	return IconComponent
}
function IconFactory(path: string) {
	const IconComponent: IconComponentType = (props: IconProps) => <IconSvg path={path} {...props} />
	return IconComponent
}
export type IconComponentType = (props: IconProps) => h.JSX.Element
type IconProps = Omit<LazyIconSvgProps, 'svgPathImport'>

// Lazily loaded IconSvg
interface LazyIconSvgProps extends Omit<IconSvgProps, 'path'> {
  svgPathImport: () => Promise<any>  // Like () => import('mdi-paths-split/Home')
}
function LazyIconSvg({ svgPathImport, ...props }: LazyIconSvgProps) {
	const isMounted = useMountedState()
	const [svgPath, setSvgPath] = useState('')
	useEffect(() => {load()}, [])
	return <IconSvg path={svgPath} {...props} />
	
	async function load() {
		const module: any = await svgPathImport()
		if(isMounted()) setSvgPath(module.default)
	}
}

// Enhanced svg element
interface IconSvgProps extends Omit<h.JSX.SVGAttributes<SVGSVGElement>, 'size'> {
  size?: number | string   // Set width and height in one prop
  horizontal?: boolean     // flip horizontally
  vertical?: boolean       // flip vertically
  rotate?: number          // rotate degrees
  path?: string            // the path part of the svg
  spin?: boolean | number  // spin the svg # seconds per spin. Default = 2
  spinInverse?: boolean    // inverse the spin
}
export function IconSvg({
	path = '',
	size = 24,
	fill = 'currentColor',
	horizontal,
	vertical,
	rotate = 0,
	spin,
	spinInverse,
	style = {},
	...props
}: IconSvgProps) {

	if (typeof style !== 'string') {
		const transforms: string[] = style.transform ? [style.transform as string] : []
		if (horizontal) transforms.push('scaleX(-1)')
		if (vertical) transforms.push('scaleY(-1)')
		if (rotate !== 0) transforms.push(`rotate(${rotate}deg)`)
		if (transforms.length > 0) {
			style.transform = transforms.join(' ')
			style.transformOrigin = 'center'
		}
		if (spin) {
			const spinSec = spin === true || typeof spin !== 'number' ? 2 : spin
			style.animation = `spin${spinInverse ? '-inverse' : ''} linear ${Math.abs(spinSec)}s infinite`
			style.transformOrigin = 'center'
		}
	}

	return (
		<svg
			viewBox="0 0 24 24"
			width={size}
			height={size}
			fill={fill}
			style={style}
			{...props}
		>
			<path d={path} />
		</svg>
	)
}