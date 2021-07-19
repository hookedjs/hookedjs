import { UserRoleEnum } from './db/entity/lib'
import type { ToastProps } from './layout/components/Toast'
import api from './lib/api.web'
import { LoginProps, RegisterProps } from './lib/authorization/authorization.api.lib'
import config from './lib/config.web'
import { nav, navListener, RouteHistoryReset, StackHistoriesReset } from './lib/router'
import StateStore from './lib/StateStore'
import { throwValidationErrorSet, ValidationErrorSet } from './lib/validation'
import { login, Persons, Profiles } from './pouch'
import { Paths } from './routes'


// AuthStore: user id and roles
export interface AuthStoreType { username: string, roles: UserRoleEnum[], currentTenant: string }
const AuthStoreLoggedOut: AuthStoreType = { username: '', roles: [], currentTenant: '' }

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
		async login(props: LoginProps) {
			const loginProps = new LoginProps(props)
			// const res = await login(loginProps.email, loginProps.password)
			const res = await login('admin', 'password')
			const profile = await Profiles.findOne()
			// const tenantProfile = await Persons.findOne({selector: {_id: res.name}})
			const tenantProfile = await Persons.findOne()
			AuthStore.value = {username: res.name, roles: [...res.roles, ...tenantProfile.roles], currentTenant: profile.defaultTenant ?? '' }
		},
		async register(props: RegisterProps) {
			const registerProps = new RegisterProps(props)
			const res = await api.post<AuthStoreType>(`${config.apiPrefix}/auth/register`, registerProps)
			// AuthStore.value = {...res, tenants: [], currentTenant: '' }
			// const res = await fetch(`${config.apiPrefix}/auth/register`, {method: 'post', body: JSON.stringify(registerProps)}).then(r => r.json())
			// if (res.error?.type === 'ValidationErrorSet') 
			// 	throw new ValidationErrorSet(`${config.apiPrefix}/auth/register`, res.error?.context.errorSet)
			// AuthStore.value = res
		},
		loginAsAdmin() { AuthStore.value = { username: '1', roles: [UserRoleEnum.ADMIN], currentTenant: '' } },
		loginAsTenant() { AuthStore.value = { username: '1234', roles: [UserRoleEnum.TENANT_ADMIN], currentTenant: '123' } },
		roles: UserRoleEnum,
	},
)
// setTimeout(() => AuthStore.login({email: 'admin@admin.com', password: 'password'}), 2000)

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

