import '@testing-library/jest-dom'
import {cleanup} from '@testing-library/preact'
import {afterEach, vi} from 'vitest'

afterEach(() => {
  cleanup()
  vi.resetAllMocks()
})

export * from '@testing-library/preact'
export * from 'vitest'
export {decorateComponent} from './storyLib'
export {default as userEvent} from '@testing-library/user-event'
