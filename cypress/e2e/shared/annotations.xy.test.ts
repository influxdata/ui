import {
  clearLocalStorage,
  setupData,
  testAddAnnotation,
} from '../util/annotationsSetup'

describe('The Annotations UI functionality, on a graph (xy line) graph type', () => {
  beforeEach(() => setupData(cy))
  afterEach(clearLocalStorage)

  it('can create an annotation on the xy line graph', () => {
    testAddAnnotation(cy)
  })
})
