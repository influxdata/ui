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
} from '../util/annotationsSetup'

describe.skip('The Annotations UI functionality on a graph + single stat graph type', () => {
  const singleStatSuffix = 'line-plus-single-stat'

  beforeEach(() => setupData(cy, singleStatSuffix))

  it('can create an annotation on the single stat + line graph', () => {
    testAddAnnotation(cy)
  })
  it('can edit an annotation for the single stat + line graph', () => {
    testEditAnnotation(cy)
  })
  it('can delete an annotation for the single stat + line graph', () => {
    testDeleteAnnotation(cy)
  })
  it('can add a range annotation for the xy single stat + line graph', () => {
    addRangeAnnotation(cy)
    checkAnnotationText(cy, RANGE_ANNOTATION_TEXT)
  })
  it('can add and edit a range annotation for the single stat + line graph', () => {
    testEditRangeAnnotation(cy)
  })

  it('can add and then delete a range annotation for the single stat + line graph', () => {
    addRangeAnnotation(cy)
    deleteAnnotation(cy)
  })
})
