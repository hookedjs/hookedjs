import type { ToastProps } from './layout/components/Toast'
import { navListener, RouteHistoryReset, StackHistoriesReset } from './lib/router'
import StateStore from './lib/StateStore'
import { CouchUserRoleEnum, login, LoginProps, logout, RegisterProps, TenantPersonRoleEnum, TenantPersons, UserProfiles } from './pouch'



// AuthStore: user id and roles
export interface AuthStoreType { username: string, dbRoles: CouchUserRoleEnum[], tRoles: TenantPersonRoleEnum[], currentTenant: string }
const AuthStoreLoggedOut: AuthStoreType = { username: '', dbRoles: [], tRoles: [], currentTenant: '' }
export const AuthStore = Object.assign(
	new StateStore<typeof AuthStoreLoggedOut>(AuthStoreLoggedOut, 'AuthStore'),
	{
		async logout() {
			AuthStore.value = AuthStoreLoggedOut
			StackHistoriesReset()
			RouteHistoryReset()
			await logout()
			ToastStore.value = { message: 'You\'ve been logged out.', location: 'right' }
		},
		async login(props: LoginProps) {
			const loginProps = new LoginProps(props)
			const res = await login(loginProps.email, loginProps.password)
			const profile = await UserProfiles.findOne()
			let tRoles: TenantPersonRoleEnum[] = []
			if (profile.defaultTenant) {
				const tenantProfile = await TenantPersons.findOne({ selector: { email: loginProps.email } }).catch(e => undefined)
				tRoles = tenantProfile?.roles ?? []
			}
			AuthStore.value = {username: res.name, dbRoles: res.roles, tRoles, currentTenant: profile.defaultTenant ?? '' }
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
		loginAsAdmin() { AuthStore.value = { username: '1', dbRoles: [CouchUserRoleEnum.ADMIN], tRoles: [], currentTenant: '' } },
		loginAsTenant() { AuthStore.value = { username: '1234', dbRoles: [], tRoles: [TenantPersonRoleEnum.ADMIN], currentTenant: '123' } },
		dbRoles: CouchUserRoleEnum, // for convenience
		tRoles: TenantPersonRoleEnum, // for convenience
	},
)
export const useAuthStore = AuthStore.use
setInterval(async function watchRoles() {
	if (AuthStore.value.username && TenantPersons.isReady) {
		const tenantProfile = await TenantPersons.findOne({ selector: { email: AuthStore.value.username } }).catch(e => undefined)
		const tRoles = tenantProfile?.roles ?? []
		if (`${tRoles}` !== `${AuthStore.value.tRoles}`)
			AuthStore.value.tRoles = tRoles
	}
}, 4000)
// setTimeout(async funciton logoutAndInTest() {
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


Object.assign(window, {AuthStore, ToastStore, ThemeStore, SidebarLeftStore, SidebarRightStore})
