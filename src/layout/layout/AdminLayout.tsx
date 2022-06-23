import SidebarLayout from '#src/layout/layout/SidebarLayout'
import {useLayoutEffect} from '#src/lib/hooks'
import * as i from '#src/lib/icons'
import {Paths, routes} from '#src/routes'
import {h} from 'preact'

import {applyTheme, defaultTheme} from '../theme'

export default function AdminLayout({children}: {children: any}) {
  useLayoutEffect(() => applyTheme(defaultTheme))
  return (
    <SidebarLayout
      topLinks={[{...routes.Support, title: 'Need help?'}]}
      rightLinks={[
        routes.AdminSettingsHome,
        routes.Logout,
        routes.Support,
        {path: '#theme-toggle', title: 'Dark Mode', Icon: i.Palette},
      ]}
      bottomLinks={[routes.AdminStatsStack, routes.AdminBlogStack, routes.AdminTenantStack, routes.AdminUserStack]}
      leftLinks={[routes.AdminStatsStack, routes.AdminBlogStack, routes.AdminTenantStack, routes.AdminUserStack]}
      searchOptions={[
        {name: 'Posts', value: Paths.AdminBlogPostList},
        {name: 'Tenants', value: Paths.AdminTenantList},
        {name: 'Users', value: Paths.AdminUserList},
      ]}>
      {children}
    </SidebarLayout>
  )
}
