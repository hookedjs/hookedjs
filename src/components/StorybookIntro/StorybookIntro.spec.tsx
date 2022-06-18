import {decorateComponent, render} from '#src/lib/testLib'
import {h} from 'preact'

import Story, {Default, defaultProps as storyDefaultProps} from './StorybookIntro.stories'

const TestComponent = decorateComponent(Default, Story, storyDefaultProps)

describe('StorybookIntro', () => {
  it('renders', () => {
    const c = render(<TestComponent />)
    expect(c.getByText('Introduction')).toBeTruthy()
  })
})
