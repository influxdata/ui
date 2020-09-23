import {cleanup} from '@testing-library/react'
import 'intersection-observer'
import MutationObserver from 'mutation-observer'
import fetchMock from 'jest-fetch-mock'

// global vars
process.env.API_PREFIX = 'http://example.com/'

declare global {
  interface Window {
    flushAllPromises: () => Promise<any>
    MutationObserver: MutationObserver
    monaco: any
  }
}

// Adds MutationObserver as a polyfill for testing
window.MutationObserver = MutationObserver

window.flushAllPromises = async () => {
  return new Promise(resolve => setImmediate(resolve))
}

// mocks and stuff
fetchMock.enableMocks()
jest.mock('honeybadger-js', () => () => null)
window.monaco = {
  editor: {
    defineTheme: jest.fn(),
  },
  languages: {
    setLanguageConfiguration: jest.fn(),
    setTokensProvider: jest.fn(),
    register: jest.fn(),
  },
}

// cleans up state between @testing-library/react tests
afterEach(() => {
  cleanup()
  fetchMock.resetMocks()
})
