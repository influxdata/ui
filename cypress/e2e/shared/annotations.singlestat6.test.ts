import {
  addRangeAnnotation,
  clearLocalStorage,
  deleteAnnotation,
  setupData,
} from 'cypress/e2e/util/annotationsSetup'

describe('The Annotations UI functionality on a graph + single stat graph type', () => {
  const singleStatSuffix = 'line-plus-single-stat'

  beforeEach(() => setupData(cy, singleStatSuffix))
  afterEach(clearLocalStorage)

  it('can add and then delete a range annotation for the single stat + line graph', () => {
    addRangeAnnotation(cy)
    deleteAnnotation(cy)
  })
})
