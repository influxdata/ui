import {cleanup} from '@testing-library/react'
import 'intersection-observer'
import MutationObserver from 'mutation-observer'
import fetchMock from 'jest-fetch-mock'
import '@testing-library/jest-dom'
import {getMockedParse} from 'src/shared/utils/mocks/mockedParse'
import 'setimmediate'

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

/*
  N.B. when using react testing library render()
  the mocked values in src/external/languages/flux/parser are ignored.
  So, need to mock here as well
*/
jest.mock('src/languageSupport/languages/flux/lspUtils', () => ({
  parse: jest.fn(getMockedParse()),
  format_from_js_file: jest.fn(),
  isValidFlux: jest.fn(_ => true),
}))

jest.mock('src/shared/workers/serviceWorker', () => ({
  registerServiceWorker: jest.fn(),
  registerServiceWorkerInfluxQL: jest.fn(),
}))

class Worker {
  public url = ''

  constructor(stringUrl) {
    this.url = stringUrl
  }

  onmessage(_) {}
  onerror(_) {}

  postMessage(_) {}

  terminate() {}
  addEventListener(_, __, ___) {}
  removeEventListener(_, __, ___) {}
  dispatchEvent(_): boolean {
    return false
  }
}

window.Worker = Worker as any

// cleans up state between @testing-library/react tests
afterEach(() => {
  window.localStorage.clear()
  cleanup()
  fetchMock.resetMocks()
})
