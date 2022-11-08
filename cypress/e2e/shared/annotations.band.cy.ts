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

describe('The Annotations UI functionality on a band plot graph type', () => {
  const bandSuffix = 'band'

  beforeEach(() => setupData(cy, bandSuffix))

  it('can create an annotation on the band plot', () => {
    testAddAnnotation(cy)
  })
  it('can edit an annotation for the band plot', () => {
    testEditAnnotation(cy)
  })
  it('can delete an annotation for the band plot ', () => {
    testDeleteAnnotation(cy)
  })

  it('can add a range annotation for the band plot', () => {
    addRangeAnnotation(cy, 'band-chart')
    checkAnnotationText(cy, RANGE_ANNOTATION_TEXT)
  })
  it('can add and edit a range annotation for the band plot', () => {
    testEditRangeAnnotation(cy, 'band-chart')
  })

  it('can add and then delete a range annotation for the band plot', () => {
    addRangeAnnotation(cy, 'band-chart')
    deleteAnnotation(cy)
  })
})
