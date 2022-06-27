---
to: <%=folder%>/<%=h.changeCase.pascalCase(name)%>/<%=h.changeCase.pascalCase(name)%>.stories.tsx
---
<%
name = h.changeCase.pascalCase(name)
let prettyPath = `${folder}`.replace("./","").replace("src/", "")
-%>
import { ComponentProps, h } from 'preact'

import { defaultProps as componentDefaultProps, <%=name%> as Component } from './<%=name%>';

interface StoryProps extends ComponentProps<typeof Component> {}

export const defaultProps: ComponentProps<typeof Component> = componentDefaultProps

export default {
  component: Component,
  decorators: [],
  argTypes: {
    // Add any props you want to be able to change
    class: {
      defaultValue: defaultProps.class,
    },
  },
  excludeStories: ['defaultProps'],
};

export function Default(props: StoryProps) {
  return <Component {...props} />;
}
