---
to: <%=folder%>/<%=h.changeCase.pascalCase(name)%>/<%=h.changeCase.pascalCase(name)%>.tsx
---
<%
name = h.changeCase.pascalCase(name)
-%>
import {h} from 'preact';

interface Props {
  class?: string;
}

export const defaultProps: Required<Pick<
  Props,
  'class'
>> = {
  class: '',
};

/**
 * Displays the name of the component.
 */
export function <%=name%>(propsRaw: Props) {
  const props = { ...defaultProps, ...propsRaw };
  return (
    <div class={props.class}>
      <h1>
        <%=name%>
      </h1>
    </div>
  );
}

function getFncName() {
  const stackLine = new Error()!.stack!.split('\n')[2].trim();
  const fncName = stackLine.match(/at ([^ ]+)/)?.[1];
  return `Hello, ${fncName}`;
}
