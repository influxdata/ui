import {cleanup} from '@testing-library/react'
import 'intersection-observer'
import MutationObserver from 'mutation-observer'
import fetchMock from 'jest-fetch-mock'
import '@testing-library/jest-dom'

// global vars
process.env.API_PREFIX = 'http://example.com/'

declare global {
  interface Window {
    flushAllPromises: () => Promise<any>
    MutationObserver: MutationObserver
  }
}

// Adds MutationObserver as a polyfill for testing
window.MutationObserver = MutationObserver

window.flushAllPromises = async () => {
  return new Promise(resolve => setImmediate(resolve))
}

// mocks and stuff
fetchMock.enableMocks()
jest.mock('src/shared/utils/errors')

// cleans up state between @testing-library/react tests
afterEach(() => {
  window.localStorage.clear()
  cleanup()
  fetchMock.resetMocks()
})
