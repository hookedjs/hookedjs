import type { ToastProps } from './layout/components/Toast'
import { nav, navListener, RouteHistoryReset, StackHistoriesReset } from './lib/router'
import StateStore from './lib/StateStore'
import { Paths } from './routes'


// AuthStore: user id and roles
export interface AuthStoreType { id: string, roles: Roles[], tenants: string[], currentTenant: string }
const AuthStoreLoggedOut: AuthStoreType = { id: '', roles: [], tenants: [], currentTenant: '' }
export enum Roles { admin, tenant }
export const AuthStore = Object.assign(
	new StateStore<typeof AuthStoreLoggedOut>(AuthStoreLoggedOut, 'AuthStore'),
	{
		logout() { 
			AuthStore.value = AuthStoreLoggedOut
			StackHistoriesReset() 
			RouteHistoryReset() 
			ToastStore.value = { message: 'You\'ve been logged out.', location: 'right' }
			nav(Paths.Login)
		},
		loginAsAdmin() { AuthStore.value = { id: '1', roles: [Roles.admin], tenants: [], currentTenant: '' } },
		loginAsTenant() { AuthStore.value = { id: '2', roles: [Roles.tenant], tenants: ['123', '311'], currentTenant: '123' } },
		roles: Roles,
	},
)


// ThemeStore: can be dark | light, persists to disk, and can be toggled with #theme-toggle event
export const ThemeStore = Object.assign(
	new StateStore('light', 'ThemeStore'),
	{
		toggle() { ThemeStore.setValue(current => current === 'dark' ? 'light' : 'dark') },
	}
)
window.addEventListener('#theme-toggle', ThemeStore.toggle)


// ToastStore: display a Toast at the bottom or right of the page
export const ToastStore = new StateStore<ToastProps>({ location: 'right', message: '', duration: 2e3 })


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
window.addEventListener('#sidebar-toggle', SidebarLeftStore.toggle)
SidebarLeftStore.subscribe(next => next === 'mini' ? bc.add('miniSidebar') : bc.remove('miniSidebar'))


// SidebarRightStore: can be active or inactive, resets on navigation
export const SidebarRightStore = new StateStore(false)
navListener(() => SidebarRightStore.setValue(false))
ThemeStore.subscribe(() => SidebarRightStore.setValue(false))

