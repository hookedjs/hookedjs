import {useLayoutEffect} from '#src/lib/hooks'
import {routes} from '#src/routes'
import {useAuthStore} from '#src/stores'
import {h} from 'preact'

import {applyTheme, defaultTheme} from '../theme'
import HeaderLayout from './HeaderLayout'

export default function MarketingLayout({children}: {children: any}) {
  const [auth] = useAuthStore()
  useLayoutEffect(() => applyTheme(defaultTheme))
  const loginNavLink = {
    ...(auth.name ? routes.Dashboard : routes.Login),
    isButton: true,
  }
  return (
    <HeaderLayout
      topLinks={[routes.Posts, loginNavLink]}
      rightLinks={[routes.Home, routes.Posts, routes.About, loginNavLink, routes.Support]}>
      {children}
    </HeaderLayout>
  )
}
