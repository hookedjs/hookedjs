import {ComponentProps, h} from 'preact'

import {StorybookIntro as Component, defaultProps as componentDefaultProps} from './StorybookIntro'

export const defaultProps: ComponentProps<typeof Component> = componentDefaultProps

export default {
  component: Component,
  argTypes: {},
  excludeStories: ['defaultProps'],
}

export function Default() {
  return <Component />
}
