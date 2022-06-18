import '@testing-library/jest-dom'
import {afterEach, vi} from 'vitest'

afterEach(() => {
  vi.restoreAllMocks()
})

export * from '@testing-library/preact'
export * from 'vitest'
export {decorateComponent} from './storyLib'
export {default as userEvent} from '@testing-library/user-event'
