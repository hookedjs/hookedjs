import SidebarLayout from '#src/layout/layout/SidebarLayout'
import {useLayoutEffect} from '#src/lib/hooks'
import * as i from '#src/lib/icons'
import {Paths, routes} from '#src/routes'
import {h} from 'preact'

import {applyTheme, tenantDemoTheme} from '../theme'

export default function TenantLayout({children}: {children: any}) {
  useLayoutEffect(() => applyTheme(tenantDemoTheme))
  return (
    <SidebarLayout
      topLinks={[{...routes.Support, title: 'Need help?'}]}
      rightLinks={[
        routes.TenantSettingsHome,
        routes.Logout,
        routes.Support,
        {path: '#theme-toggle', title: 'Dark Mode', Icon: i.Palette},
      ]}
      bottomLinks={[
        routes.TenantDashboardStack,
        routes.TenantTaskStack,
        routes.TenantPropertyStack,
        routes.TenantUserStack,
      ]}
      leftLinks={[
        routes.TenantDashboardStack,
        routes.TenantTaskStack,
        routes.TenantPropertyStack,
        routes.TenantUserStack,
      ]}
      searchOptions={[
        {name: 'Users', value: Paths.TenantUserList},
        {name: 'Tasks', value: Paths.TenantTaskList},
        {name: 'Props', value: Paths.TenantPropertyList},
      ]}>
      {children}
    </SidebarLayout>
  )
}
