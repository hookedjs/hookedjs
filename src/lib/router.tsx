/**
 * A fairly comprehensive suite of router features for Preact (though could be adapted
 * fairly easily to any SPA)
 * 
 * Compared to react-router:
 * - It's tiny. react-router and dependencies are >8kb gzipped. This is < 3kb
 * - It's preact compatible
 * - Features Exception-based 404 and Forbidden handling, so you can trigger a 404 or
 *   forbidden page be displayed from deep in your app
 * - Features a Stack based router similar to react-navigation, so that each "stack"
 *   can manage it's own history and scroll positions. Absolutely essential if you 
 *   are serious about mobile users
 * - Features scroll-restoration on browser popstate (aka back) and stack recall
 */

import { ComponentChildren, Fragment as F, FunctionalComponent, h } from 'preact'
import {Suspense} from 'preact/compat'

import { applyTheme, defaultTheme } from '../layout/theme'
import { useEffect, useErrorBoundary, useLayoutEffect, useRef, useState } from './hooks'
import pstyled from './pstyled'
import StateStore from './StateStore'
import { ForbiddenError, NotFoundError } from './validation'


/**
 * RouterComponent: Wraps the Router Switch in a Layout, and strategically only re-renders
 * the layout if the layout has changed, preserving state in the layouts
 * and improving performance
 */
interface RouterProps {
	routesByPath: Record<string, RouteType>,
}
interface RouteType extends SetPageMetaProps {
	Icon?: FunctionalComponent
	path: string
	Component: FunctionalComponent<{route: RouteType}>
	Layout?: FunctionalComponent
	stack?: string
	hasAccess: () => boolean,
	hasBack?: boolean, // indicate if back is available
}
function RouterComponent(props: RouterProps) {
	const [isLayoutReady, setIsLayoutReady] = useState(false)
	const [Layout, setLayout] = useState<any>(() => BlankLayout)
	useLayoutEffect(watchLocation, [])
	const [error, resetError] = useErrorBoundary()
	if (!props.routesByPath['/notfound']) throw new Error('A route with path /notfound is required.')
	if (error) {
		if (error instanceof ForbiddenError) {
			const r = props.routesByPath['/forbidden'] || props.routesByPath['/notfound']
			return <BlankLayout><RouteWrapper><r.Component route={r} /></RouteWrapper></BlankLayout>
		}
		if (error instanceof NotFoundError) {
			const r = props.routesByPath['/notfound']
			return <BlankLayout><RouteWrapper><r.Component route={r} /></RouteWrapper></BlankLayout>
		}
		throw error
	}
	return isLayoutReady ? <Layout><RouterSwitch {...props} /></Layout> : <F />

	function watchLocation() {
		onLocationChange()
		return navListener(onLocationChange)

		function onLocationChange() {
			resetError()
			const match = props.routesByPath[location.pathname]

			// only update the layout if it's changed
			let Next = BlankLayout as any
			if (match && match.Layout)
				Next = match.Layout
			if (Layout !== Next)
				setLayout(() => Next)
			
			setIsLayoutReady(true)
		}
	}
}

/**
 * RouterSwitch: Switches routes based on current url and also checks access control
 */
const stacks = new Map<string, any>()
function RouterSwitch({ routesByPath }: RouterProps) {
	const [_location] = useLocationStore()
	const r = routesByPath[_location.pathname] || routesByPath['/notfound']
	setPageMeta(r)
	let Stack = RouteWrapper
	if (r.stack) {
		if (stacks.has(r.stack)) Stack = stacks.get(r.stack)
		else {
			Stack = StackFactory(r.stack)
			stacks.set(r.stack, Stack)
		}
	}
	if (!r.hasAccess()) throw new ForbiddenError()
	return <Stack>
		<Suspense fallback={<div/>}>
			<r.Component route={r} />
		</Suspense>
	</Stack>
}


/**
 * Enhances a route object and adds typesafety
 */
function RouteFactory(props: Omit<RouteType, 'hasBack' | 'hasAccess'> & {hasAccess?: RouteType['hasAccess']}) {
	const r: RouteType = Object.freeze({
		hasAccess: (): boolean => true,
		...props,
		hasBack: !!props.stack && props.path !== props.stack + '/home',
	})
	return r
}


/**
 * RouteWrapper: Wrapper for routes to provide scroll tracking and restoration
 * on history.popstate
 */
let RouteHistory: Record<string, number> = localStorage.getItem('RouteHistory') ? JSON.parse(localStorage.getItem('RouteHistory')!) : {}
setInterval(function _saveRouteHistory() { localStorage.setItem('RouteHistory', JSON.stringify(RouteHistory)) }, 2000)
function RouteHistoryReset() { localStorage.removeItem('RouteHistory'); RouteHistory = {} }
function RouteWrapper({ children }: any) {
	const [_location] = useLocationStore()
	useEffect(handleEvents, [])
	useLayoutEffect(function hide(){ ref.current!.style.visibility = 'hidden' }, [_location])
	useEffect(handleLocationChange, [_location])
	const ref = useRef<HTMLDivElement>(null)

	return <div style={{visibility: 'hidden'}} ref={ref}>{children}</div>

	function handleEvents() {
		const e = document.getElementById('content')
		if (e) return scrollListener(e, updateScrollPos)
	}

	function updateScrollPos(scrollTop: number) {
		const path = location.pathname + location.search
		RouteHistory[path] = scrollTop
	}
	function handleLocationChange() {
		const path = location.pathname + location.search
		const e = document.getElementById('content')
		if (e) {
			if (RouteHistory[path] && Date.now() - history.state > 3000)
				e.scrollTop = RouteHistory[path]
			else {
				updateScrollPos(0)
				e.scrollTop = 0
			}
		}
		ref.current!.style.visibility = 'visible'
	}
}


/**
 * StackFactory: A route wrapper factory to join a page to a route stack
 * and enhance stack-like-features
 */
type StackHistoryEntry = { location: LocationType, scroll: number }
type StackHistory = StackHistoryEntry[]
let StackHistories: Record<string, StackHistory> = localStorage.getItem('StackHistories') ? JSON.parse(localStorage.getItem('StackHistories')!) : {}
setInterval(function _saveStackHistories() {localStorage.setItem('StackHistories', JSON.stringify(StackHistories))}, 2000)
function StackHistoriesReset() { localStorage.removeItem('StackHistories'); StackHistories = {}}
function StackFactory(basePath: string) {
	const baseHistory = { location: { pathname: basePath + '/home', search: '' }, scroll: 0 }
	class Stack {
		static reset = () => { StackHistories[basePath] = [baseHistory]; return StackHistories[basePath][0] }
		static len = () => StackHistories[basePath]?.length ?? 0
		static top = () => StackHistories[basePath]?.[Stack.len() - 1] || Stack.reset()
		static pop = () => StackHistories[basePath].pop() || Stack.reset()
		static push = (entry: StackHistoryEntry) => StackHistories[basePath].push(entry)
	}

	return function StackHandler({ children }: any) {
		const [_location] = useLocationStore()
		useLayoutEffect(function hide(){ ref.current!.style.visibility = 'hidden' }, [_location])
		useEffect(handleStackEvents, [])
		useEffect(handleNavChange, [_location])
		const ref = useRef<HTMLDivElement>(null)

		return <div style={{ visibility: 'hidden' }} ref={ref}>{children}</div>

		function handleStackEvents() {
			addEventListener('#stack-reset', resetStack)
			addEventListener('#stack-back', goback)
			addEventListener('#stack-pop', pop)
			return () => {
				removeEventListener('#stack-reset', resetStack)
				removeEventListener('#stack-back', goback)
				removeEventListener('#stack-pop', pop)
			}
			
			function resetStack() {
				Stack.reset()
				nav(basePath)
			}
			function goback() {
				Stack.pop()
				const back = Stack.top()
				nav(back.location.pathname + back.location.search)
			}
			function pop() {
				Stack.pop()
			}
		}

		function handleNavChange() {
			let cancelScrollListen: any = () => null
			const { pathname, search } = location
			
			const top = Stack.top()
			if (pathname === top.location.pathname && search === top.location.search) {
				// console.log('top')
				scrollTo(top.scroll)
				ref.current!.style.visibility = 'visible'
				const e = document.getElementById('content')
				if (e) cancelScrollListen = scrollListener(e, updateScrollPos)
			}
			else if (pathname === basePath) {// recall from stack
				nav(top.location.pathname + top.location.search, { replace: true })
			}
			else { // forward navigation -- add to history 
				// console.log('forward')
				Stack.push({ location: {pathname, search}, scroll: 0 })
				scrollTo(0)
				ref.current!.style.visibility = 'visible'
				const e = document.getElementById('content')
				if (e) cancelScrollListen = scrollListener(e, updateScrollPos)
			}

			return cancelScrollListen
		}

		function updateScrollPos(scrollTop: number) {
			StackHistories[basePath][StackHistories[basePath].length - 1].scroll = scrollTop
		}
		function scrollTo(to: number) {
			updateScrollPos(to)
			const e = document.getElementById('content')
			if (e) e.scrollTop = to
		}
	}
}

/**
 * PassThrough: A passthrough component
 */
function PassThrough({ children }: any) {return children}

/**
 *  Redirect: A component which immediately redirects elsewhere
 */
function Redirect(to: string) {
	return function Redirect() {
		useLayoutEffect(() => nav(to, { replace: true }), [])
		return <div />
	}
}

/**
 * ContentDiv: A component you to wrap content in. Feel free
 * to roll your own, but make sure it has #content and is
 * scrollable
 */
function Content(p: { children: ComponentChildren }) {
	return <ContentDiv id="content" {...p} />
}
const ContentDiv = pstyled.div`
	:root
		--content-height: 100vh
		--content-height: var(--body-height)
		--content-right-padding: 0px
		--content-right: 0px
		--content-bottom: 0px
		--content-background: #eee
		--content-background: var(--sidebar-background)
		--content-top: 0px
		--content-top-padding: 0px
		--content-left: 0px
		--content-left-padding: 0px
		position: relative
		height: var(--content-height)
		overflow: hidden scroll
		z-index: 0
		background: var(--content-background)
	@media (max-width: 700px)
		:root
			overflow: hidden auto
`

/**
 * BlankLayout: The default layout, and a reference layout for you to
 * make your own layouts
 */
function BlankLayout({ children }: { children: any }) {
	useLayoutEffect(() => applyTheme(defaultTheme))
	return <div>
		<Content>
			{children}
		</Content>
	</div>
}

/**
 * Call a function on scroll event
 * 
 * If scroll event appears to happen near a nav event, skip
 */
function scrollListener(el: HTMLElement, callback: any) {
	let last_known_scroll_position = 0
	let ticking = false
	el.addEventListener('scroll', listener)
	return function unlisten() { el.removeEventListener('scroll', listener) }

	function listener() {
		last_known_scroll_position = el.scrollTop
		// const navJustHappened = Date.now() - lastNavEvent < 1000
		if (!ticking) {
			requestAnimationFrame(() => {
				callback(last_known_scroll_position)
				ticking = false
			})
			ticking = true
		}
	}
}

/**
 * Helper to get parent url of current url
 */
function getParentPath(o?: {pathname?: string, levels?: number}) {
	const {pathname = location.pathname, levels = 1} = o || {}
	return pathname.split('/').slice(0, -(levels)).join('/')
}


/**
 * navListener: React to a change in navigation
 */
function navListener(callback: () => any) {
	const historyEvents = ['popstate', 'pushState', 'replaceState']
	historyEvents.map((e) => addEventListener(e, callback))
	// callback()
	return function unListen() { historyEvents.map((e) => removeEventListener(e, callback)) }
}


/**
 * nav: Helper to navigate to a new page
 */
function nav(to: string, { replace = false } = {}) {
	history[replace ? 'replaceState' : 'pushState'](Date.now(), '', to || location.pathname)
}
if (!history.state) nav(location.pathname + location.search, { replace: true })


/**
 * setPageMeta: Allows setting common page attrs.
 * - Intelligently us the attrs, only setting if changed
 * - Resets back to initial if omitted, based on initial introspection
 * - Stores element handles in memory to remove need to query the dom
 *   on every update
 */
interface SetPageMetaProps {
	title: string
	siteName?: string
	author?: string
	description?: string
	image?: string
	locale?: string
}
const setPageMeta = (function createSetPageMeta() {
	// Wrapper class on meta elements to simplify usage and make more DRY
	class MetaClass {
		get: () => string
		orig: string
		set: (val: string) => void
		constructor(getter: () => Element) {
			this.get = () => getter().getAttribute('content') || ''
			this.set = (v: string) => getter().setAttribute('content', v)
			this.orig = this.get()
		}
		upsert(val?: string) {
			if (!val) val = this.orig
			if (this.get() !== val) this.set(val)
		}
	}
	const getLink = () => find('link[rel="canonical"]')! as any
	const siteName = byProp('og:site_name').getAttribute('content') || ''
	const author = new MetaClass(() => byName('author'))
	const ogTitle = new MetaClass(() => byProp('og:title'))
	const locale = new MetaClass(() => byProp('og:locale'))
	const description = new MetaClass(() => byName('description'))
	const ogDescription = new MetaClass(() => byProp('og:description'))
	const ogUrl = new MetaClass(() => byProp('og:url'))
	const ogSiteName = new MetaClass(() => byProp('og:site_name'))
	const ogImage = new MetaClass(() => byProp('og:image'))
	
	function byName(name: string) { return find(`meta[name="${name}"]`) }
	function byProp(prop: string) { return find(`meta[property="${prop}"]`) }
	function find(selector: string) { 
		return (
			document.head.querySelector(selector)
			|| {getAttribute: (n:string) => '', setAttribute: (n:string,v:string) => null} as unknown as Element
		)
	}

	return function setPageMeta(p: SetPageMetaProps) {
		const title = p.title ? `${p.title} - ${siteName}` : siteName
		if (title !== document.title) document.title = title

		const link = getLink()
		if (link.href !== location.href) link.href = location.href

		author.upsert(p.author || p.title)
		ogTitle.upsert(p.title)
		locale.upsert(p.locale)
		description.upsert(p.description)
		ogDescription.upsert(p.description)
		ogUrl.upsert(location.href)
		ogSiteName.upsert(p.siteName)
		ogImage.upsert(p.image)
	}
})()


/**
 * LocationStore.use: A hook to watch location
 * Inspired by https://github.com/molefrog/wouter's LocationStore.use hook
 */
interface LocationType { pathname: string, search: string }
const LocationStore = new StateStore({ pathname: location.pathname, search: location.search })
export const useLocationStore = LocationStore.use
navListener(() => LocationStore.setValue({ pathname: location.pathname, search: location.search}))

const PageMetaStore = new StateStore<SetPageMetaProps>({ title: '' })
PageMetaStore.subscribe(setPageMeta)

/**
 * interceptNavEvents: Intercept changes in navigation to dispatch
 * events and prevent default
 */
;(function interceptNavEvents() {
	document.body.addEventListener('click', function linkIntercepter(e: any) {
		const ln = findLinkTagInParents(e.target) // aka linkNode

		if (ln?.host === window.location.host) {
			dispatchEvent(new Event('link-clicked'))
			e.preventDefault()

			if (ln.hash) dispatchEvent(new Event(ln.hash))

			if (ln.pathname + ln.search !== window.location.pathname + window.location.search) {
				if (ln.hash === '#replace')
					nav(ln.pathname + ln.search, { replace: true })
				else
					nav(ln.pathname + ln.search)
			} 
			else {
				const c = document.getElementById('content')
				if (c) c.scrollTop = 0
			}
		}

		function findLinkTagInParents(node: HTMLElement): any {
			if (node?.nodeName === 'A') return node
			if (node?.parentNode) return findLinkTagInParents(node.parentElement!)
		}
	})
})()


/**
 * While History API does have `popstate` event, the only
 * proper way to listen to changes via `push/replaceState`
 * is to monkey-patch these methods.
 *
 * See https://stackoverflow.com/a/4585031
 */
;(function monkeyPatchHistory() {
	if (typeof history !== 'undefined') {
		for (const type of ['pushState', 'replaceState']) {
			const original = (history as any)[type]

			;(history as any)[type] = function (...props: any) {
				const result = original.apply(this, props)
				const event = new Event(type);
				(event as any).arguments = props

				dispatchEvent(event)
				return result
			}
		}
	}
})()


export {
	BlankLayout,
	Content,
	getParentPath,
	LocationStore,
	nav,
	navListener,
	PageMetaStore,
	PassThrough,
	Redirect,
	RouteFactory,
	RouteHistoryReset,
	RouterComponent,
	RouteType,
	scrollListener,
	setPageMeta,
	StackFactory,
	StackHistoriesReset,
}