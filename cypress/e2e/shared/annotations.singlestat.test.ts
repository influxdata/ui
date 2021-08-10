import {
  clearLocalStorage,
  setupData,
  testAddAnnotation,
} from '../util/annotationsSetup'

describe('The Annotations UI functionality on a graph + single stat graph type', () => {
  const singleStatSuffix = 'line-plus-single-stat'

  beforeEach(() => setupData(cy, singleStatSuffix))
  afterEach(clearLocalStorage)

  it('can create an annotation on the single stat + line graph', () => {
    testAddAnnotation(cy)
  })
})
