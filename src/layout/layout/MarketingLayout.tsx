import { h } from 'preact'

import { useLayoutEffect } from '#lib/hooks'
import { routes } from '#src/routes'
import { useAuthStore } from '#src/stores'

import { applyTheme, defaultTheme } from '../theme'
import HeaderLayout from './HeaderLayout'

export default function MarketingLayout({ children }: { children: any }) {
	const [auth] = useAuthStore()
	useLayoutEffect(() => applyTheme(defaultTheme))
	const loginNavLink = { ...(auth.name ? routes.Dashboard : routes.Login), isButton: true }
	return (
		<HeaderLayout
			topLinks={[
				routes.Blog,
				loginNavLink,
			]}
			rightLinks={[
				routes.Home,
				routes.Blog,
				routes.About,
				loginNavLink,
				routes.Support,
			]}
		>
			{children}
		</HeaderLayout>
	)
}