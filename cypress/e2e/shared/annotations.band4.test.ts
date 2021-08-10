import {
  addRangeAnnotation,
  checkAnnotationText,
  clearLocalStorage,
  setupData,
} from 'cypress/e2e/util/annotationsSetup'

describe('The Annotations UI functionality on a band plot graph type', () => {
  const bandSuffix = 'band'

  beforeEach(() => setupData(cy, bandSuffix))
  afterEach(clearLocalStorage)

  it('can add a range annotation for the band plot', () => {
    addRangeAnnotation(cy, 'band-chart')
    checkAnnotationText(cy, 'range annotation here!')
  })
})
