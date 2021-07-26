import {h} from 'preact'

import styled from '#src/lib/styled'

export default function CodeSnippet({snippet}: {snippet: any}) {
	const str = typeof snippet === 'string' ? snippet : JSON.stringify(snippet, null, 2)
	return (
		<CodeSnippetPre>
			<code class="language-javascript">
				{str}
			</code>
		</CodeSnippetPre>
	)
}

const CodeSnippetPre = styled.pre`
	:root
		background: var(--gray3)
		border: 4px solid var(--gray2)
		overflow-x: scroll
		padding: 1.2em .5em
		
`