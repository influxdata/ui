import {
  addRangeAnnotation,
  checkAnnotationText,
  clearLocalStorage,
  setupData,
} from 'cypress/e2e/util/annotationsSetup'

describe('The Annotations UI functionality on a graph + single stat graph type', () => {
  const singleStatSuffix = 'line-plus-single-stat'

  beforeEach(() => setupData(cy, singleStatSuffix))
  afterEach(clearLocalStorage)

  it('can add a range annotation for the xy single stat + line graph', () => {
    addRangeAnnotation(cy)
    checkAnnotationText(cy, 'range annotation here!')
  })
})
