import { h } from 'preact'

import SidebarLayout from '#src/layout/layout/SidebarLayout'
import { useLayoutEffect } from '#src/lib/hooks'
import * as i from '#src/lib/icons'
import { Paths, routes } from '#src/routes'

import { applyTheme, defaultTheme } from '../theme'

export default function AdminLayout({ children }: { children: any }) {
	useLayoutEffect(() => applyTheme(defaultTheme))
	return (
		<SidebarLayout 
			topLinks={[{...routes.Support, title: 'Need help?'}]}
			rightLinks={[
				routes.AdminSettingsHome,
				routes.Logout,
				routes.Support,
				{ path: '#theme-toggle', title: 'Dark Mode', Icon: i.Palette },
			]}
			bottomLinks={[
				routes.AdminStatsStack,
				routes.AdminBlogStack,
				routes.AdminUserStack,
			]}
			leftLinks={[
				routes.AdminStatsStack,
				routes.AdminBlogStack,
				routes.AdminUserStack,
			]}
			searchOptions={[
				{ name: 'Users', value: Paths.AdminUserList },
				{ name: 'Posts', value: Paths.AdminBlogPostList },
			]}
		>
			{children}
		</SidebarLayout>
	)
}
