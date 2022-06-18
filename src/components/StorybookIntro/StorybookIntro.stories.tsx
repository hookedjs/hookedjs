import { ComponentProps, h } from 'preact'

import { StorybookIntro as Component } from "./StorybookIntro"

export const defaultProps: ComponentProps<typeof Component> = {}

// More on default export: https://storybook.js.org/docs/preact/writing-stories/introduction#default-export
export default {
  component: Component,
  argTypes: {},
  excludeStories: ['defaultProps'],
};

export function Default() {
  return (
    <Component />
  )
}


