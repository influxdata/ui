import {
  clearLocalStorage,
  setupData,
  testEditRangeAnnotation,
} from 'cypress/e2e/util/annotationsSetup'

describe('The Annotations UI functionality on a band plot graph type', () => {
  const bandSuffix = 'band'

  beforeEach(() => setupData(cy, bandSuffix))
  afterEach(clearLocalStorage)

  it('can add and edit a range annotation for the band plot', () => {
    testEditRangeAnnotation(cy, 'band-chart')
  })
})
