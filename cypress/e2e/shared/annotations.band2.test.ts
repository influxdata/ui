import {
  clearLocalStorage,
  setupData,
  testEditAnnotation,
} from 'cypress/e2e/util/annotationsSetup'

describe('The Annotations UI functionality on a band plot graph type', () => {
  const bandSuffix = 'band'

  beforeEach(() => setupData(cy, bandSuffix))
  afterEach(clearLocalStorage)

  it('can edit an annotation for the band plot', () => {
    testEditAnnotation(cy)
  })
})
