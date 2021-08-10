import {
  clearLocalStorage,
  setupData,
  testDeleteAnnotation,
} from 'cypress/e2e/util/annotationsSetup'

describe('The Annotations UI functionality on a band plot graph type', () => {
  const bandSuffix = 'band'

  beforeEach(() => setupData(cy, bandSuffix))
  afterEach(clearLocalStorage)

  it('can delete an annotation for the band plot ', () => {
    testDeleteAnnotation(cy)
  })
})
