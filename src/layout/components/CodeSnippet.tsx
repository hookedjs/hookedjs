import pstyled from '#src/lib/pstyled'
import {h} from 'preact'

export default function CodeSnippet({snippet}: {snippet: any}) {
  const str = typeof snippet === 'string' ? snippet : JSON.stringify(snippet, null, 2)
  return (
    <CodeSnippetPre>
      <code class="language-javascript">{str}</code>
    </CodeSnippetPre>
  )
}

const CodeSnippetPre = pstyled.pre`
	:root
		background: var(--gray3)
		border: 4px solid var(--gray2)
		overflow-x: scroll
		padding: 1.2em .5em
`
