import type {RouteType} from '#src/lib/router'
import type {FunctionalComponent} from 'preact'

export type NavLinkProps =
  | RouteType
  | {
      path: string
      title: string
      Icon?: FunctionalComponent
      isButton?: boolean
      hasAccess?: () => boolean
    }
export type NavLinks = NavLinkProps[]
