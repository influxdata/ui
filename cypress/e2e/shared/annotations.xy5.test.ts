import {
  clearLocalStorage,
  setupData,
  testEditRangeAnnotation,
} from 'cypress/e2e/util/annotationsSetup'

describe('The Annotations UI functionality, on a graph (xy line) graph type', () => {
  beforeEach(() => setupData(cy))
  afterEach(clearLocalStorage)
  it('can add and edit a range annotation for the xy line graph', () => {
    testEditRangeAnnotation(cy)
  })
})
