import type { ToastProps } from './layout/components/Toast'
import config from './lib/config.web'
import { nav, navListener, RouteHistoryReset, StackHistoriesReset } from './lib/router'
import StateStore from './lib/StateStore'
import { DbUserRoleEnum, login, LoginProps, logout, RegisterProps, TenantPersons, TenantUserRoleEnum, UserProfiles } from './pouch'
import { Paths } from './routes'


// AuthStore: user id and roles
export interface AuthStoreType { username: string, dbRoles: DbUserRoleEnum[], tRoles: TenantUserRoleEnum[], currentTenant: string }
const AuthStoreLoggedOut: AuthStoreType = { username: '', dbRoles: [], tRoles: [], currentTenant: '' }

export const AuthStore = Object.assign(
	new StateStore<typeof AuthStoreLoggedOut>(AuthStoreLoggedOut, 'AuthStore'),
	{
		logout() { 
			AuthStore.value = AuthStoreLoggedOut
			StackHistoriesReset()
			RouteHistoryReset()
			ToastStore.value = { message: 'You\'ve been logged out.', location: 'right' }
			nav(Paths.Login)
			return logout()
		},
		async login(props: LoginProps) {
			const loginProps = new LoginProps(props)
			// TODO: Fix this
			// const res = await login(loginProps.email, loginProps.password)
			const res = await login('dbreader', 'plaintext_password')
			const profile = await UserProfiles.findOne()
			// TODO: Fix this
			// const tenantProfile = await TenantPersons.findOne({selector: {_id: res.name}})
			const tenantProfile = await TenantPersons.findOne()
			AuthStore.value = {username: res.name, dbRoles: res.roles, tRoles: tenantProfile.tRoles, currentTenant: profile.defaultTenant ?? '' }
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
		loginAsAdmin() { AuthStore.value = { username: '1', dbRoles: [DbUserRoleEnum.ADMIN], tRoles: [], currentTenant: '' } },
		loginAsTenant() { AuthStore.value = { username: '1234', dbRoles: [], tRoles: [TenantUserRoleEnum.ADMIN], currentTenant: '123' } },
		dbRoles: DbUserRoleEnum, // for convenience
		tRoles: TenantUserRoleEnum, // for convenience
	},
)
export const useAuthStore = AuthStore.use
// setTimeout(async () => {
// 	await AuthStore.logout()
// 	setTimeout(() => AuthStore.login({email: 'admin@admin.com', password: 'password'}), 1000)
// }, 1000)

// ThemeStore: can be dark | light, persists to disk, and can be toggled with #theme-toggle event
export const ThemeStore = Object.assign(
	new StateStore('light', 'ThemeStore'),
	{
		toggle() { ThemeStore.setValue(current => current === 'dark' ? 'light' : 'dark') },
	}
)
export const useThemeStore = ThemeStore.use
window.addEventListener('#theme-toggle', ThemeStore.toggle)

// ToastStore: display a Toast at the bottom or right of the page
export const ToastStore = new StateStore<ToastProps>({ location: 'right', message: '', duration: 2e3 })
export const useToastStore = ToastStore.use

// SidebarLeftStore: can be full | mini, persists to disk, and can be toggled with #sidebar-toggle event
const bc = document.body.classList
const sidebarLeftInitial: string = (
	localStorage.getItem('SidebarLeftStore') && JSON.parse(localStorage.getItem('SidebarLeftStore')!)
	|| window.innerWidth > 900 && 'full'
	|| 'mini'
)
if (sidebarLeftInitial === 'mini') bc.add('miniSidebar')
export const SidebarLeftStore = Object.assign(
	new StateStore(sidebarLeftInitial, 'SidebarLeftStore'),
	{
		toggle() { SidebarLeftStore.setValue(current => current === 'mini' ? 'full' : 'mini') },
	}
)
export const useSidebarLeftStore = SidebarLeftStore.use
window.addEventListener('#sidebar-toggle', SidebarLeftStore.toggle)
SidebarLeftStore.subscribe(next => next === 'mini' ? bc.add('miniSidebar') : bc.remove('miniSidebar'))


// SidebarRightStore: can be active or inactive, resets on navigation
export const SidebarRightStore = new StateStore(false)
export const useSidebarRightStore = SidebarRightStore.use
navListener(() => SidebarRightStore.setValue(false))
ThemeStore.subscribe(() => SidebarRightStore.setValue(false))

