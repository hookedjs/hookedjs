---
to: <%=folder%>/<%=h.changeCase.pascalCase(name)%>/<%=h.changeCase.pascalCase(name)%>.spec.tsx
---
<%
name = h.changeCase.pascalCase(name)
let prettyPath = `${folder}/${name}`.replace("./","").replace("src/", "")
-%>
import {decorateComponent, render} from '#src/lib/testLib'
import {h} from 'preact'


import {<%=name%> as Component} from './<%=name%>';
import Story, {
  Default,
  defaultProps as storyDefaultProps,
} from './<%=name%>.stories';

const TestComponent = decorateComponent(Default, Story, storyDefaultProps);

describe(`<%=prettyPath%>${Component.name}`, () => {
  it('should match default state', () => {
    const c = render(<TestComponent />);
    expect(c.getByText('<%=name%>')).toBeTruthy();
  });
});
