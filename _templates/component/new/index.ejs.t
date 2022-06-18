---
to: <%=folder%>/<%=h.changeCase.pascalCase(name)%>/index.tsx
---
<%
name = h.changeCase.pascalCase(name)
-%>
export { <%=name%> } from './<%=name%>';