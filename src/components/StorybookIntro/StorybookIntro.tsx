import {h} from 'preact'

interface Props {
  className?: string
}

export const defaultProps: Required<Pick<Props, 'className'>> = {
  className: '',
}

export function StorybookIntro(propsRaw: Props) {
  const props = {...defaultProps, ...propsRaw}
  return (
    <div className={props.className}>
      <h1>Introduction</h1>
      <p>
        Storybook helps you build UI components in isolation from your app's business logic, data, and context. That
        makes it easy to develop hard-to-reach states. Save these UI states as **stories** to revisit during
        development, testing, or QA. Browse example stories now by navigating to them in the sidebar. View their code in
        the `stories` directory to learn how they work. We recommend building UIs with a{' '}
        <a href="//componentdriven.org">
          <b>component-driven</b>
        </a>{' '}
        process starting with atomic components and ending with pages.
      </p>
    </div>
  )
}
