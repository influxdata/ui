import {
  addRangeAnnotation,
  checkAnnotationText,
  deleteAnnotation,
  setupData,
  testAddAnnotation,
  testEditAnnotation,
  testEditRangeAnnotation,
  testDeleteAnnotation,
  RANGE_ANNOTATION_TEXT,
} from '../../util/annotationsSetup'

describe('The Annotations UI functionality, on a graph (xy line) graph type', () => {
  beforeEach(() => setupData(cy))

  it('can create an annotation on the xy line graph', () => {
    testAddAnnotation(cy)
  })
  it('can edit an annotation  for the xy line graph', () => {
    testEditAnnotation(cy)
  })
  it('can delete an annotation  for the xy line graph', () => {
    testDeleteAnnotation(cy)
  })
  it('can add a range annotation for the xy line graph', () => {
    addRangeAnnotation(cy)
    checkAnnotationText(cy, RANGE_ANNOTATION_TEXT)
  })
  it('can add and edit a range annotation for the xy line graph', () => {
    testEditRangeAnnotation(cy)
  })

  it('can add and then delete a range annotation for the xy line graph', () => {
    addRangeAnnotation(cy)
    deleteAnnotation(cy)
  })
})
