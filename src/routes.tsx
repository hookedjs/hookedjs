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
  TenantDeleteAccount: RouteFactory({
    title: 'Delete Account',
    Icon: i.Logout,
    path: '/delete-account',
    Component: lazy(() => import('./pages/auth/DeleteAccount')),
    hasAccess: AuthStore.checkLoggedIn,
  }),
  Forbidden: RouteFactory({
    title: 'Forbidden',
    path: '/forbidden',
    Component: lazy(() => import('./pages/auth/Forbidden')),
  }),

  // Marketing Routes: home, support, about, posts

  Home: RouteFactory({
    title: 'Home',
    Icon: i.Home,
    path: '/',
    Component: FillerPageRoute,
    Layout: MarketingLayout,
  }),
  Home2: RouteFactory({
    title: 'Home2',
    Icon: i.Home,
    path: '/home/id/:hello',
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
  Posts: RouteFactory({
    title: 'Posts',
    Icon: i.Post,
    path: '/posts',
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
      else if (AuthStore.checkIfAdmin()) nav(Paths.AdminRoot, {replace: true})
      else nav(Paths.TenantSwitcher, {replace: true})
      return <div />
    },
  }),

  // Admin Routes: stats, settings, users, posts

  AdminRoot: RouteFactory({
    title: 'Dashboard',
    Icon: i.Counter,
    path: '/admin',
    Component: Redirect('/admin/stats'),
    hasAccess: AuthStore.checkIfAdmin,
  }),

  AdminSettingsHome: RouteFactory({
    title: 'Settings',
    Icon: i.Account,
    path: '/admin/settings',
    Component: lazy(() => import('./pages/auth/Account')),
    Layout: AdminLayout,
    hasAccess: AuthStore.checkIfAdmin,
  }),

  AdminStatsStack: RouteFactory({
    title: 'Dashboard',
    Icon: i.Home,
    path: '/admin/stats',
    Component: PassThrough,
    Layout: AdminLayout,
    stack: '/admin/stats',
    hasAccess: AuthStore.checkIfAdmin,
  }),
  AdminStatsHome: RouteFactory({
    title: 'Dashboard',
    Icon: i.Home,
    path: '/admin/stats/home',
    Component: FillerPageRoute,
    Layout: AdminLayout,
    stack: '/admin/stats',
    hasAccess: AuthStore.checkIfAdmin,
  }),

  AdminPostStack: RouteFactory({
    title: 'Posts',
    Icon: i.Post,
    path: '/admin/posts',
    Component: PassThrough,
    Layout: AdminLayout,
    stack: '/admin/posts',
    hasAccess: AuthStore.checkIfAdmin,
  }),
  AdminPostList: RouteFactory({
    title: 'Posts',
    Icon: i.Post,
    path: '/admin/posts/home',
    Component: FillerListRoute,
    Layout: AdminLayout,
    stack: '/admin/posts',
    hasAccess: AuthStore.checkIfAdmin,
  }),
  AdminPostEntry: RouteFactory({
    title: 'Post',
    Icon: i.Post,
    path: '/admin/posts/:slug',
    Component: FillerEntryRoute,
    Layout: AdminLayout,
    stack: '/admin/posts',
    hasAccess: AuthStore.checkIfAdmin,
  }),
  AdminPostCreate: RouteFactory({
    title: 'Create Post',
    Icon: i.Post,
    path: '/admin/posts/create',
    Component: FillerCreateRoute,
    Layout: AdminLayout,
    stack: '/admin/posts',
    hasAccess: AuthStore.checkIfAdmin,
  }),

  AdminUserStack: RouteFactory({
    title: 'Users',
    Icon: i.Auth,
    path: '/admin/users',
    Component: PassThrough,
    Layout: AdminLayout,
    stack: '/admin/users',
    hasAccess: AuthStore.checkIfAdmin,
  }),
  AdminUserList: RouteFactory({
    title: 'Users',
    Icon: i.Auth,
    path: '/admin/users/home',
    Component: lazy(() => import('./pages/admin/model/users/UserList')),
    Layout: AdminLayout,
    stack: '/admin/users',
    hasAccess: AuthStore.checkIfAdmin,
  }),
  AdminUserEntry: RouteFactory({
    title: 'User',
    Icon: i.Auth,
    path: '/admin/users/:name',
    Component: lazy(() => import('./pages/admin/model/users/UserEntry')),
    Layout: AdminLayout,
    stack: '/admin/users',
    hasAccess: AuthStore.checkIfAdmin,
  }),
  AdminUserCreate: RouteFactory({
    title: 'Create User',
    Icon: i.Auth,
    path: '/admin/users/create',
    Component: lazy(() => import('./pages/admin/model/users/UserEntry')),
    Layout: AdminLayout,
    stack: '/admin/users',
    hasAccess: AuthStore.checkIfAdmin,
  }),

  AdminTenantStack: RouteFactory({
    title: 'Tenants',
    Icon: i.Building,
    path: '/admin/tenants',
    Component: PassThrough,
    Layout: AdminLayout,
    stack: '/admin/tenants',
    hasAccess: AuthStore.checkIfAdmin,
  }),
  AdminTenantList: RouteFactory({
    title: 'Tenants',
    Icon: i.Building,
    path: '/admin/tenants/home',
    Component: lazy(() => import('./pages/admin/model/tenants/TenantList')),
    Layout: AdminLayout,
    stack: '/admin/tenants',
    hasAccess: AuthStore.checkIfAdmin,
  }),
  AdminTenantEntry: RouteFactory({
    title: 'Tenant',
    Icon: i.Building,
    path: '/admin/tenants/:id',
    Component: lazy(() => import('./pages/admin/model/tenants/TenantEntry')),
    Layout: AdminLayout,
    stack: '/admin/tenants',
    hasAccess: AuthStore.checkIfAdmin,
  }),
  AdminTenantCreate: RouteFactory({
    title: 'Create Tenant',
    Icon: i.Building,
    path: '/admin/tenants/create',
    Component: lazy(() => import('./pages/admin/model/tenants/TenantEntry')),
    Layout: AdminLayout,
    stack: '/admin/tenants',
    hasAccess: AuthStore.checkIfAdmin,
  }),

  // Tenant/Customer Routes: stats, settings, users, properties, tasks

  TenantCreate: RouteFactory({
    title: 'Create Tenant',
    Icon: i.Login,
    path: '/tenant-create',
    Component: lazy(() => import('./pages/auth/TenantCreate')),
    Layout: LoginLayout,
    hasAccess: AuthStore.checkLoggedIn,
  }),
  TenantSwitcher: RouteFactory({
    title: 'Select Account',
    Icon: i.Login,
    path: '/tenant-switch',
    Component: lazy(() => import('./pages/auth/TenantSwitcher')),
    Layout: LoginLayout,
    hasAccess: AuthStore.checkLoggedIn,
  }),

  TenantRoot: RouteFactory({
    title: 'Dashboard',
    Icon: i.Counter,
    path: '/tenant',
    Component: Redirect('/tenant-switch'),
    hasAccess: AuthStore.checkLoggedIn,
  }),

  TenantSettingsHome: RouteFactory({
    title: 'Settings',
    Icon: i.Account,
    path: '/tenant/:tenantId/settings',
    Component: lazy(() => import('./pages/auth/Account')),
    Layout: TenantLayout,
    hasAccess: AuthStore.checkLoggedIn,
  }),

  TenantDashboardStack: RouteFactory({
    title: 'Dashboard',
    Icon: i.Home,
    path: '/tenant/:tenantId/stats',
    Component: PassThrough,
    Layout: TenantLayout,
    stack: '/tenant/:tenantId/stats',
    hasAccess: AuthStore.checkLoggedIn,
  }),
  TenantDashboardHome: RouteFactory({
    title: 'Dashboard',
    Icon: i.Home,
    path: '/tenant/:tenantId/stats/home',
    Component: FillerPageRoute,
    Layout: TenantLayout,
    stack: '/tenant/:tenantId/stats',
    hasAccess: AuthStore.checkLoggedIn,
  }),

  TenantUserStack: RouteFactory({
    title: 'Users',
    Icon: i.Auth,
    path: '/tenant/:tenantId/users',
    Component: PassThrough,
    Layout: TenantLayout,
    stack: '/tenant/:tenantId/users',
    hasAccess: AuthStore.checkLoggedIn,
  }),
  TenantUserList: RouteFactory({
    title: 'Users',
    Icon: i.Auth,
    path: '/tenant/:tenantId/users/home',
    Component: FillerListRoute,
    Layout: TenantLayout,
    stack: '/tenant/:tenantId/users',
    hasAccess: AuthStore.checkLoggedIn,
  }),
  TenantUserEntry: RouteFactory({
    title: 'User',
    Icon: i.Auth,
    path: '/tenant/:tenantId/users/entry',
    Component: FillerEntryRoute,
    Layout: TenantLayout,
    stack: '/tenant/:tenantId/users',
    hasAccess: AuthStore.checkLoggedIn,
  }),
  TenantUserCreate: RouteFactory({
    title: 'Create User',
    Icon: i.Auth,
    path: '/tenant/:tenantId/users/create',
    Component: FillerCreateRoute,
    Layout: TenantLayout,
    stack: '/tenant/:tenantId/users',
    hasAccess: AuthStore.checkLoggedIn,
  }),

  TenantPropertyStack: RouteFactory({
    title: 'Properties',
    Icon: i.Building,
    path: '/tenant/:tenantId/properties',
    Component: PassThrough,
    Layout: TenantLayout,
    stack: '/tenant/:tenantId/properties',
    hasAccess: AuthStore.checkLoggedIn,
  }),
  TenantPropertyList: RouteFactory({
    title: 'Properties',
    Icon: i.Building,
    path: '/tenant/:tenantId/properties/home',
    Component: FillerListRoute,
    Layout: TenantLayout,
    stack: '/tenant/:tenantId/properties',
    hasAccess: AuthStore.checkLoggedIn,
  }),
  TenantPropertyEntry: RouteFactory({
    title: 'Property',
    Icon: i.Building,
    path: '/tenant/:tenantId/properties/entry',
    Component: FillerEntryRoute,
    Layout: TenantLayout,
    stack: '/tenant/:tenantId/properties',
    hasAccess: AuthStore.checkLoggedIn,
  }),
  TenantPropertyCreate: RouteFactory({
    title: 'Create Property',
    Icon: i.Building,
    path: '/tenant/:tenantId/properties/create',
    Component: FillerCreateRoute,
    Layout: TenantLayout,
    stack: '/tenant/:tenantId/properties',
    hasAccess: AuthStore.checkLoggedIn,
  }),

  TenantTaskStack: RouteFactory({
    title: 'Tasks',
    Icon: i.Tasks,
    path: '/tenant/:tenantId/tasks',
    Component: PassThrough,
    Layout: TenantLayout,
    stack: '/tenant/:tenantId/tasks',
    hasAccess: AuthStore.checkLoggedIn,
  }),
  TenantTaskList: RouteFactory({
    title: 'Tasks',
    Icon: i.Tasks,
    path: '/tenant/:tenantId/tasks/home',
    Component: FillerListRoute,
    Layout: TenantLayout,
    stack: '/tenant/:tenantId/tasks',
    hasAccess: AuthStore.checkLoggedIn,
  }),
  TenantTaskEntry: RouteFactory({
    title: 'Task',
    Icon: i.Tasks,
    path: '/tenant/:tenantId/tasks/entry',
    Component: FillerEntryRoute,
    Layout: TenantLayout,
    stack: '/tenant/:tenantId/tasks',
    hasAccess: AuthStore.checkLoggedIn,
  }),
  TenantTaskCreate: RouteFactory({
    title: 'Create Task',
    Icon: i.Tasks,
    path: '/tenant/:tenantId/tasks/create',
    Component: FillerCreateRoute,
    Layout: TenantLayout,
    stack: '/tenant/:tenantId/tasks',
    hasAccess: AuthStore.checkLoggedIn,
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
