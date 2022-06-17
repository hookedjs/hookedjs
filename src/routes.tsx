import FillerCreateRoute from '#src/layout/FillerCreateRoute'
import FillerEntryRoute from '#src/layout/FillerEntryRoute'
import FillerListRoute from '#src/layout/FillerListRoute'
import FillerPageRoute from '#src/layout/FillerPageRoute'
import * as i from '#src/lib/icons'
import lazy from '#src/lib/lazy'
import {PassThrough, Redirect, RouteFactory, RouteType, nav} from '#src/lib/router'
import {h} from 'preact'

import {AuthStore, useAuthStore} from './stores'

const LoginLayout = lazy(() => import('#src/layout/layout/LoginLayout'))
const AdminLayout = lazy(() => import('#src/layout/layout/AdminLayout'))
const TenantLayout = lazy(() => import('#src/layout/layout/TenantLayout'))
const MarketingLayout = lazy(() => import('#src/layout/layout/MarketingLayout'))

export const routes = Object.freeze({
  // Access Control Routes

  // TODO: hasAccess denied page does not link to login correclty. The state
  // doesn't seem to understand the route changed and stays stuck on denied page even though the url changed.
  Login: RouteFactory({
    title: 'Login',
    Icon: i.Login,
    path: '/login',
    Component: lazy(() => import('./pages/auth/Login')),
    Layout: LoginLayout,
  }),
  Register: RouteFactory({
    title: 'Register',
    Icon: i.Login,
    path: '/register',
    Component: lazy(() => import('./pages/auth/Register')),
    Layout: LoginLayout,
  }),
  ForgotPassword: RouteFactory({
    title: 'Forgot Password',
    Icon: i.Auth,
    path: '/forgotPassword',
    Component: lazy(() => import('./pages/auth/ForgotPassword')),
    Layout: LoginLayout,
  }),
  Logout: RouteFactory({
    title: 'Logout',
    Icon: i.Logout,
    path: '/logout',
    Component: lazy(() => import('./pages/auth/Logout')),
  }),
  Forbidden: RouteFactory({
    title: 'Forbidden',
    path: '/forbidden',
    Component: lazy(() => import('./pages/auth/Forbidden')),
  }),

  // Marketing Routes: home, support, about, blog

  Home: RouteFactory({
    title: 'Home',
    Icon: i.Home,
    path: '/',
    Component: FillerPageRoute,
    Layout: MarketingLayout,
  }),
  Support: RouteFactory({
    title: 'Support',
    Icon: i.Support,
    path: '/support',
    Component: FillerPageRoute,
    Layout: MarketingLayout,
  }),
  About: RouteFactory({
    title: 'About',
    Icon: i.Info,
    path: '/about',
    Component: FillerPageRoute,
    Layout: MarketingLayout,
  }),
  Blog: RouteFactory({
    title: 'Blog',
    Icon: i.Post,
    path: '/blog',
    Component: FillerPageRoute,
    Layout: MarketingLayout,
  }),

  Dashboard: RouteFactory({
    title: 'Dashboard',
    Icon: i.Counter,
    path: '/dashboard',
    Component: () => {
      const [auth] = useAuthStore()
      if (!auth.name) nav(Paths.Login)
      else if (isAdmin()) nav(Paths.AdminRoot, {replace: true})
      else if (isTenant()) nav(Paths.TenantRoot, {replace: true})
      else nav(Paths.TenantSwitcher, {replace: true})

      return <div />
    },
  }),

  TenantCreate: RouteFactory({
    title: 'Create Tenant',
    Icon: i.Login,
    path: '/tenant-create',
    Component: lazy(() => import('./pages/auth/TenantCreate')),
    Layout: LoginLayout,
    hasAccess: isLoggedIn,
  }),
  TenantSwitcher: RouteFactory({
    title: 'Select Account',
    Icon: i.Login,
    path: '/tenant-switch',
    Component: lazy(() => import('./pages/auth/TenantSwitcher')),
    Layout: LoginLayout,
    hasAccess: isLoggedIn,
  }),

  // Admin Routes: stats, settings, users, posts

  AdminRoot: RouteFactory({
    title: 'Dashboard',
    Icon: i.Counter,
    path: '/admin',
    Component: Redirect('/admin/stats'),
    hasAccess: isAdmin,
  }),

  AdminSettingsHome: RouteFactory({
    title: 'Settings',
    Icon: i.Account,
    path: '/admin/settings',
    Component: lazy(() => import('./pages/auth/Account')),
    Layout: AdminLayout,
    hasAccess: isAdmin,
  }),

  AdminStatsStack: RouteFactory({
    title: 'Dashboard',
    Icon: i.Home,
    path: '/admin/stats',
    Component: PassThrough,
    Layout: AdminLayout,
    stack: '/admin/stats',
    hasAccess: isAdmin,
  }),
  AdminStatsHome: RouteFactory({
    title: 'Dashboard',
    Icon: i.Home,
    path: '/admin/stats/home',
    Component: FillerPageRoute,
    Layout: AdminLayout,
    stack: '/admin/stats',
    hasAccess: isAdmin,
  }),

  AdminUserStack: RouteFactory({
    title: 'Users',
    Icon: i.Auth,
    path: '/admin/users',
    Component: PassThrough,
    Layout: AdminLayout,
    stack: '/admin/users',
    hasAccess: isAdmin,
  }),
  AdminUserList: RouteFactory({
    title: 'Users',
    Icon: i.Auth,
    path: '/admin/users/home',
    Component: lazy(() => import('./pages/admin/model/users/UserList')),
    Layout: AdminLayout,
    stack: '/admin/users',
    hasAccess: isAdmin,
  }),
  AdminUserEntry: RouteFactory({
    title: 'User',
    Icon: i.Auth,
    path: '/admin/users/entry',
    Component: lazy(() => import('./pages/admin/model/users/UserEntry')),
    Layout: AdminLayout,
    stack: '/admin/users',
    hasAccess: isAdmin,
  }),
  AdminUserCreate: RouteFactory({
    title: 'Create User',
    Icon: i.Auth,
    path: '/admin/users/create',
    Component: lazy(() => import('./pages/admin/model/users/UserEntry')),
    Layout: AdminLayout,
    stack: '/admin/users',
    hasAccess: isAdmin,
  }),

  AdminBlogStack: RouteFactory({
    title: 'Blog',
    Icon: i.Post,
    path: '/admin/blog',
    Component: PassThrough,
    Layout: AdminLayout,
    stack: '/admin/blog',
    hasAccess: isAdmin,
  }),
  AdminBlogPostList: RouteFactory({
    title: 'Posts',
    Icon: i.Post,
    path: '/admin/blog/home',
    Component: FillerListRoute,
    Layout: AdminLayout,
    stack: '/admin/blog',
    hasAccess: isAdmin,
  }),
  AdminBlogPostEntry: RouteFactory({
    title: 'Post',
    Icon: i.Post,
    path: '/admin/blog/entry',
    Component: FillerEntryRoute,
    Layout: AdminLayout,
    stack: '/admin/blog',
    hasAccess: isAdmin,
  }),
  AdminBlogPostCreate: RouteFactory({
    title: 'Create Post',
    Icon: i.Post,
    path: '/admin/blog/create',
    Component: FillerCreateRoute,
    Layout: AdminLayout,
    stack: '/admin/blog',
    hasAccess: isAdmin,
  }),

  // Tenant/Customer Routes: stats, settings, users, properties, tasks

  TenantRoot: RouteFactory({
    title: 'Dashboard',
    Icon: i.Counter,
    path: '/tenant',
    Component: Redirect('/tenant/stats'),
    hasAccess: isTenant,
  }),

  TenantSettingsHome: RouteFactory({
    title: 'Settings',
    Icon: i.Account,
    path: '/tenant/settings',
    Component: lazy(() => import('./pages/auth/Account')),
    Layout: TenantLayout,
    hasAccess: isTenant,
  }),
  TenantDeleteAccount: RouteFactory({
    title: 'Delete Account',
    Icon: i.Logout,
    path: '/tenant/delete-account',
    Component: lazy(() => import('./pages/auth/DeleteAccount')),
    hasAccess: isTenant,
  }),

  TenantDashboardStack: RouteFactory({
    title: 'Dashboard',
    Icon: i.Home,
    path: '/tenant/stats',
    Component: PassThrough,
    Layout: TenantLayout,
    stack: '/tenant/stats',
    hasAccess: isTenant,
  }),
  TenantDashboardHome: RouteFactory({
    title: 'Dashboard',
    Icon: i.Home,
    path: '/tenant/stats/home',
    Component: FillerPageRoute,
    Layout: TenantLayout,
    stack: '/tenant/stats',
    hasAccess: isTenant,
  }),

  TenantUserStack: RouteFactory({
    title: 'Users',
    Icon: i.Auth,
    path: '/tenant/users',
    Component: PassThrough,
    Layout: TenantLayout,
    stack: '/tenant/users',
    hasAccess: isTenant,
  }),
  TenantUserList: RouteFactory({
    title: 'Users',
    Icon: i.Auth,
    path: '/tenant/users/home',
    Component: FillerListRoute,
    Layout: TenantLayout,
    stack: '/tenant/users',
    hasAccess: isTenant,
  }),
  TenantUserEntry: RouteFactory({
    title: 'User',
    Icon: i.Auth,
    path: '/tenant/users/entry',
    Component: FillerEntryRoute,
    Layout: TenantLayout,
    stack: '/tenant/users',
    hasAccess: isTenant,
  }),
  TenantUserCreate: RouteFactory({
    title: 'Create User',
    Icon: i.Auth,
    path: '/tenant/users/create',
    Component: FillerCreateRoute,
    Layout: TenantLayout,
    stack: '/tenant/users',
    hasAccess: isTenant,
  }),

  TenantPropertyStack: RouteFactory({
    title: 'Properties',
    Icon: i.Building,
    path: '/tenant/properties',
    Component: PassThrough,
    Layout: TenantLayout,
    stack: '/tenant/properties',
    hasAccess: isTenant,
  }),
  TenantPropertyList: RouteFactory({
    title: 'Properties',
    Icon: i.Building,
    path: '/tenant/properties/home',
    Component: FillerListRoute,
    Layout: TenantLayout,
    stack: '/tenant/properties',
    hasAccess: isTenant,
  }),
  TenantPropertyEntry: RouteFactory({
    title: 'Property',
    Icon: i.Building,
    path: '/tenant/properties/entry',
    Component: FillerEntryRoute,
    Layout: TenantLayout,
    stack: '/tenant/properties',
    hasAccess: isTenant,
  }),
  TenantPropertyCreate: RouteFactory({
    title: 'Create Property',
    Icon: i.Building,
    path: '/tenant/properties/create',
    Component: FillerCreateRoute,
    Layout: TenantLayout,
    stack: '/tenant/properties',
    hasAccess: isTenant,
  }),

  TenantTaskStack: RouteFactory({
    title: 'Tasks',
    Icon: i.Tasks,
    path: '/tenant/tasks',
    Component: PassThrough,
    Layout: TenantLayout,
    stack: '/tenant/tasks',
    hasAccess: isTenant,
  }),
  TenantTaskList: RouteFactory({
    title: 'Tasks',
    Icon: i.Tasks,
    path: '/tenant/tasks/home',
    Component: FillerListRoute,
    Layout: TenantLayout,
    stack: '/tenant/tasks',
    hasAccess: isTenant,
  }),
  TenantTaskEntry: RouteFactory({
    title: 'Task',
    Icon: i.Tasks,
    path: '/tenant/tasks/entry',
    Component: FillerEntryRoute,
    Layout: TenantLayout,
    stack: '/tenant/tasks',
    hasAccess: isTenant,
  }),
  TenantTaskCreate: RouteFactory({
    title: 'Create Task',
    Icon: i.Tasks,
    path: '/tenant/tasks/create',
    Component: FillerCreateRoute,
    Layout: TenantLayout,
    stack: '/tenant/tasks',
    hasAccess: isTenant,
  }),

  NotFound: RouteFactory({
    title: '404 Not Found',
    path: '/notfound',
    Component: lazy(() => import('./pages/NotFound')),
  }),
} as const)

export const routesByPath = Object.values(routes).reduce<Record<string, any>>((acc, r) => {
  acc[r.path] = r
  return acc
}, {})

export const Paths = Object.entries(routes).reduce<Record<string, string>>((acc, [name, r]) => {
  acc[name] = r.path
  return acc
}, {}) as Record<keyof typeof routes, string>

function isLoggedIn() {
  return !!AuthStore.value.name
}
function isAdmin() {
  return AuthStore.value.roles.includes(AuthStore.dbRoles.ADMIN)
}
function isTenant() {
  return AuthStore.value.tRoles.length > 0
}
