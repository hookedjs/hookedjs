import {vi} from '#src/lib/testLib'
import {action as _action} from '@storybook/addon-actions'
import {ComponentProps, h} from 'preact'

export * from '@storybook/preact'

export const action = process.env.STORYBOOK ? _action : () => vi.fn

/**
 * wraps a component with storybook style decorators
 */
export function decorateComponent<T extends React.FC<any>>(Component: T, Story: any, defaultProps: any) {
  return (props: Partial<ComponentProps<T>>) => {
    let WithDecorators = () => <Component {...defaultProps} {...props} />
    for (const decorator of Story?.decorators ?? []) {
      const jsx = decorator(WithDecorators, Story as any)
      WithDecorators = () => jsx
    }
    return <WithDecorators />
  }
}
