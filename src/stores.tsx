import type {PortalProps} from './layout/components/Portal'
import type {ToastProps} from './layout/components/Toast'
import StateStore from './lib/StateStore'
import {RouteHistoryReset, StackHistoriesReset, navListener} from './lib/router'
import {
  AuthUser,
  AuthUserRoleEnum,
  AuthUsers,
  LoginProps,
  RegisterProps,
  TenantPersonRoleEnum,
  TenantPersons,
  login,
  logout,
} from './pouch'

// AuthStore: auth user meta
export interface AuthStoreType extends Pick<AuthUser, 'name' | 'roles' | 'tenants'> {
  tRoles: TenantPersonRoleEnum[]
  currentTenant?: {id: string; name: string}
}
const AuthStoreLoggedOut: AuthStoreType = {
  name: '',
  roles: [],
  tenants: [],
  tRoles: [],
}
export const AuthStore = Object.assign(new StateStore<typeof AuthStoreLoggedOut>(AuthStoreLoggedOut, 'AuthStore'), {
  async logout() {
    AuthStore.value = AuthStoreLoggedOut
    StackHistoriesReset()
    RouteHistoryReset()
    await logout()
    ToastStore.setValue({
      message: "You've been logged out.",
      placement: 'right',
    })
  },
  async login(props: LoginProps) {
    const loginProps = new LoginProps(props)
    const auth = await login(loginProps.name, loginProps.password)
    if (auth.roles.includes(AuthStore.dbRoles.ADMIN)) {
      AuthStore.setValue({
        ...Object.pick(auth, ['name', 'roles']),
        tenants: [],
        tRoles: [],
        currentTenant: undefined,
      })
    } else {
      const profile = await AuthUsers.getCurrent()
      let tRoles: TenantPersonRoleEnum[] = []
      if (profile.defaultTenantId) {
        const tenantProfile = await TenantPersons.findOne({
          selector: {email: loginProps.name},
        }).catch(e => undefined)
        tRoles = tenantProfile?.roles ?? []
      }
      AuthStore.setValue({
        ...Object.pick(profile, ['name', 'roles', 'tenants']),
        tRoles,
        currentTenant: profile.tenants.filter(t => t.id === profile.defaultTenantId)?.[0],
      })
    }
  },
  async register(props: RegisterProps) {
    const registerProps = new RegisterProps(props)
    // const res = await api.post<AuthStoreType>(`${config.apiPrefix}/auth/register`, registerProps)
    // AuthStore.value = {...res, tenants: [], currentTenant: '' }
    // const res = await fetch(`${config.apiPrefix}/auth/register`, {method: 'post', body: JSON.stringify(registerProps)}).then(r => r.json())
    // if (res.error?.type === 'ValidationErrorSet')
    // 	throw new ValidationErrorSet(`${config.apiPrefix}/auth/register`, res.error?.context.errorSet)
    // AuthStore.value = res
  },
  dbRoles: AuthUserRoleEnum, // for convenience
  tRoles: TenantPersonRoleEnum, // for convenience
})
export const useAuthStore = AuthStore.use
setInterval(async function watchRoles() {
  if (AuthStore.value.name && TenantPersons.isReady) {
    const tenantProfile = await TenantPersons.findOne({
      selector: {email: AuthStore.value.name},
    }).catch(e => undefined)
    const tRoles = tenantProfile?.roles ?? []
    if (`${tRoles}` !== `${AuthStore.value.tRoles}`) AuthStore.value.tRoles = tRoles
  }
}, 4000)
// setTimeout(async funciton logoutAndInTest() {
// 	await AuthStore.logout()
// 	setTimeout(() => AuthStore.login({email: 'admin@admin.com', password: 'password'}), 1000)
// }, 1000)

// ThemeStore: can be dark | light, persists to disk, and can be toggled with #theme-toggle event
export const ThemeStore = Object.assign(new StateStore('light', 'ThemeStore'), {
  toggle() {
    ThemeStore.setValue(current => (current === 'dark' ? 'light' : 'dark'))
  },
})
export const useThemeStore = ThemeStore.use
addEventListener('#theme-toggle', ThemeStore.toggle)

// ToastStore: display a Toast at the bottom or right of the page
export const ToastStore = new StateStore<ToastProps>({
  placement: 'right',
  message: '',
  duration: 2e3,
})
export const useToastStore = ToastStore.use

// PortalStore: display a Portal overlaying the page
export const PortalStore = new StateStore<PortalProps>({
  placement: 'top',
  message: '',
})
export const usePortalStore = PortalStore.use

// SidebarLeftStore: can be full | mini, persists to disk, and can be toggled with #sidebar-toggle event
const bc = document.body.classList
const sidebarLeftInitial: string =
  (localStorage.getItem('SidebarLeftStore') && JSON.parse(localStorage.getItem('SidebarLeftStore')!)) ||
  (innerWidth > 900 && 'full') ||
  'mini'
if (sidebarLeftInitial === 'mini') bc.add('miniSidebar')
export const SidebarLeftStore = Object.assign(new StateStore(sidebarLeftInitial, 'SidebarLeftStore'), {
  toggle() {
    SidebarLeftStore.setValue(current => (current === 'mini' ? 'full' : 'mini'))
  },
})
export const useSidebarLeftStore = SidebarLeftStore.use
addEventListener('#sidebar-toggle', SidebarLeftStore.toggle)
SidebarLeftStore.subscribe(next => (next === 'mini' ? bc.add('miniSidebar') : bc.remove('miniSidebar')))

// SidebarRightStore: can be active or inactive, resets on navigation
export const SidebarRightStore = new StateStore(false)
export const useSidebarRightStore = SidebarRightStore.use
navListener(() => SidebarRightStore.setValue(false))
ThemeStore.subscribe(() => SidebarRightStore.setValue(false))

Object.assign(window, {
  AuthStore,
  PortalStore,
  ToastStore,
  ThemeStore,
  SidebarLeftStore,
  SidebarRightStore,
})
