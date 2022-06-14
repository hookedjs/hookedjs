import type { FunctionalComponent } from 'preact'

import type { RouteType } from '#src/lib/router'

export type NavLinkProps = RouteType | { path: string, title: string, Icon?: FunctionalComponent, isButton?: boolean, hasAccess?: () => boolean }
export type NavLinks = NavLinkProps[]