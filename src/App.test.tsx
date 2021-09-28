import { render } from '@testing-library/preact'
import { expect } from 'chai'
import { h } from 'preact'

import App from './App'

describe('<App>', () => {
	it('renders learn react link', async () => {
		const { getByText } = render(<App />)
		await sleep(80) // browser needs a moment to settle
		const linkElement = getByText(/Home/i)
		expect(document.body.contains(linkElement))
	})
})

