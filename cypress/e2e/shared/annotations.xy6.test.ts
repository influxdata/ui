import {
  addRangeAnnotation,
  clearLocalStorage,
  deleteAnnotation,
  setupData,
} from 'cypress/e2e/util/annotationsSetup'

describe('The Annotations UI functionality, on a graph (xy line) graph type', () => {
  beforeEach(() => setupData(cy))
  afterEach(clearLocalStorage)

  it('can add and then delete a range annotation for the xy line graph', () => {
    addRangeAnnotation(cy)
    deleteAnnotation(cy)
  })
})
