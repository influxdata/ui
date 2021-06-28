import {
  addRangeAnnotation,
  checkAnnotationText,
  clearLocalStorage,
  setupData,
  testAddAnnotation,
  testEditAnnotation,
  testEditRangeAnnotation,
  testDeleteAnnotation,
} from '../util/annotationsSetup'

describe('The Annotations UI functionality, test suite one', () => {
  const singleStatSuffix = 'line-plus-single-stat'
  const bandSuffix = 'band'


  afterEach(clearLocalStorage)
// =======
//   const setupData = (
//     cy: Cypress.Chainable,
//     plotTypeSuffix = '',
//     enableRangeAnnotations = true
//   ) => {
//     cy.flush()
//     return cy.signin().then(() =>
//       cy.get('@org').then(({id: orgID}: Organization) =>
//         cy.createDashboard(orgID).then(({body}) =>
//           cy.fixture('routes').then(({orgs}) => {
//             cy.visit(`${orgs}/${orgID}/dashboards/${body.id}`)
//             return cy
//               .setFeatureFlags({
//                 annotations: true,
//                 useGiraffeGraphs: true,
//                 rangeAnnotations: enableRangeAnnotations,
//               })
//               .then(() => {
//                 cy.createBucket(orgID, name, 'schmucket')
//                 // have to add large amount of data to fill the window so that the random click for annotation works
//                 cy.writeData(lines(3000), 'schmucket')

//                 // make a dashboard cell
//                 cy.getByTestID('add-cell--button').click()
//                 cy.getByTestID('selector-list schmucket').should('be.visible')
//                 cy.getByTestID('selector-list schmucket').click()
//                 cy.getByTestID(`selector-list m`).should('be.visible')
//                 cy.getByTestID(`selector-list m`).click()
//                 cy.getByTestID('selector-list v').should('be.visible')
//                 cy.getByTestID(`selector-list v`).click()

//                 if (plotTypeSuffix) {
//                   cy.getByTestID('view-type--dropdown').click()
//                   cy.getByTestID(`view-type--${plotTypeSuffix}`).click()
//                 }

//                 cy.getByTestID(`selector-list tv1`).click()
//                 cy.getByTestID('time-machine-submit-button').click()
//                 cy.getByTestID('overlay').within(() => {
//                   cy.getByTestID('page-title').click()
//                   cy.getByTestID('renamable-page-title--input')
//                     .clear()
//                     .type('blah')
//                   cy.getByTestID('save-cell--button').click()
//                 })
//                 cy.getByTestID('toggle-annotations-controls').click()
//               })
//           })
//         )
//       )
//     )
//   }

//   afterEach(() => {
//     // clear the local storage after each test.
//     // See: https://github.com/cypress-io/cypress/issues/2573
//     cy.window().then(window => {
//       window.sessionStorage.clear()
//       window.localStorage.clear()
//     })
//   })

//   const addAnnotationTest = (cy: Cypress.Chainable) => {
//     addAnnotation(cy)

//     // reload to make sure the annotation was added in the backend as well.
//     cy.reload()

//     // we need to see if the annotations got created and that the tooltip says "I'm a hippopotamus"
//     checkAnnotationText(cy, 'im a hippopotamus')
//   }

//   const startEditingAnnotation = (cy: Cypress.Chainable) => {
//     cy.getByTestID('cell blah').within(() => {
//       // we have 2 line layers by the same id, we only want to click on the first
//       cy.get('line')
//         .first()
//         .click()
//     })
//   }

//   const editTheAnnotation = (cy: Cypress.Chainable) => {
//     startEditingAnnotation(cy)

//     cy.getByTestID('edit-annotation-message')
//       .clear()
//       .type('lets edit this annotation...')

//     cy.getByTestID('annotation-submit-button').click()
//   }

//   const editAnnotationTest = (cy: Cypress.Chainable) => {
//     addAnnotation(cy)

//     // should have the annotation created , lets click it to show the modal.
//     editTheAnnotation(cy)

//     // reload to make sure the annotation was edited in the backend as well.
//     cy.reload()

//     // annotation tooltip should say the new name
//     cy.getByTestID('cell blah').within(() => {
//       cy.getByTestID('giraffe-inner-plot').trigger('mouseover')
//     })
//     cy.getByTestID('giraffe-annotation-tooltip').contains(
//       'lets edit this annotation...'
//     )
//   }

//   const actuallyDeleteAnnotation = (cy: Cypress.Chainable) => {
//     // should have the annotation created , lets click it to show the modal.
//     cy.getByTestID('cell blah').within(() => {
//       // we have 2 line layers by the same id, we only want to click on the first
//       cy.get('line')
//         .first()
//         .click()
//     })

//     cy.getByTestID('delete-annotation-button').click()

//     // reload to make sure the annotation was deleted from the backend as well.
//     cy.reload()

//     // annotation line should not exist in the dashboard cell
//     cy.getByTestID('cell blah').within(() => {
//       cy.get('line').should('not.exist')
//     })
//   }

//   const deleteAnnotationTest = (cy: Cypress.Chainable) => {
//     addAnnotation(cy)

//     actuallyDeleteAnnotation(cy)
//   }

//   const addAnnotation = (cy: Cypress.Chainable) => {
//     cy.getByTestID('cell blah').within(() => {
//       cy.getByTestID('giraffe-inner-plot').click({shiftKey: true})
//     })
//     cy.getByTestID('overlay--container').within(() => {
//       cy.getByTestID('edit-annotation-message')
//         .should('be.visible')
//         .click()
//         .focused()
//         .type('im a hippopotamus')
//       cy.getByTestID('annotation-submit-button').click()
//     })
//   }

//   const checkAnnotationText = (cy: Cypress.Chainable, text: string) => {
//     cy.getByTestID('cell blah').within(() => {
//       cy.getByTestID('giraffe-inner-plot').trigger('mouseover')
//     })
//     cy.getByTestID('giraffe-annotation-tooltip').contains(text)
//   }

//   const ensureRangeAnnotationTimesAreNotEqual = (cy: Cypress.Chainable) => {
//     cy.getByTestID('endTime-testID')
//       .invoke('val')
//       .then(endTimeValue => {
//         cy.getByTestID('startTime-testID')
//           .invoke('val')
//           .then(startTimeValue => {
//             expect(endTimeValue).to.not.equal(startTimeValue)
//           })
//       })
//   }

//   const addRangeAnnotation = (cy: Cypress.Chainable, layerTestID = 'line') => {
//     cy.getByTestID('cell blah').within(() => {
//       cy.getByTestID(`giraffe-layer-${layerTestID}`).then(([canvas]) => {
//         const {width, height} = canvas

//         cy.wrap(canvas).trigger('mousedown', {
//           x: width / 3,
//           y: height / 2,
//           force: true,
//           shiftKey: true,
//         })
//         cy.wrap(canvas).trigger('mousemove', {
//           x: (width * 2) / 3,
//           y: height / 2,
//           force: true,
//           shiftKey: true,
//         })
//         cy.wrap(canvas).trigger('mouseup', {force: true, shiftKey: true})
//       })
//     })

//     cy.getByTestID('overlay--container').within(() => {
//       cy.getByTestID('edit-annotation-message')
//         .should('be.visible')
//         .click()
//         .focused()
//         .type('range annotation here!')

//       // make sure the two times (start and end) are not equal:
//       ensureRangeAnnotationTimesAreNotEqual(cy)

//       cy.getByTestID('annotation-submit-button').click()
//     })
//   }

//   const editRangeAnnotationTest = (
//     cy: Cypress.Chainable,
//     layerTestID = 'line'
//   ) => {
//     addRangeAnnotation(cy, layerTestID)

//     startEditingAnnotation(cy)

//     cy.getByTestID('edit-annotation-message')
//       .clear()
//       .type('editing the text here for the range annotation')

//     ensureRangeAnnotationTimesAreNotEqual(cy)

//     cy.getByTestID('annotation-submit-button').click()

//     // reload to make sure the annotation was edited in the backend as well.
//     cy.reload()

//     checkAnnotationText(cy, 'editing the text here for the range annotation')
//   }
// >>>>>>> chore: make annotations off by default

  describe('annotations on a graph + single stat graph type', () => {
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
      checkAnnotationText(cy, 'range annotation here!')
    })
    it('can add and edit a range annotation for the single stat + line graph', () => {
      testEditRangeAnnotation(cy)
    })
    it('can add and then delete a range annotation for the single stat + line graph', () => {
      addRangeAnnotation(cy)
      testDeleteAnnotation(cy)
    })
  })

  describe('annotations on a band plot graph type', () => {
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
      checkAnnotationText(cy, 'range annotation here!')
    })
    it('can add and edit a range annotation for the band plot', () => {
      testEditRangeAnnotation(cy, 'band-chart')
    })
    it('can add and then delete a range annotation for the band plot', () => {
      addRangeAnnotation(cy, 'band-chart')
      testDeleteAnnotation(cy)
    })
  })

  describe('point annotations only, range annotations are off: ', () => {
    beforeEach(() => setupData(cy, '', false))

    it('hides the range/point annotation type picker when range annotations are OFF', () => {
      cy.getByTestID('cell blah').within(() => {
        cy.getByTestID('giraffe-inner-plot').click({shiftKey: true})
      })
      cy.getByTestID('overlay--container').within(() => {
        cy.getByTestID('annotation-form-point-type-option').should('not.exist')
        cy.getByTestID('annotation-form-range-type-option').should('not.exist')
      })
    })
  })

  describe('annotations on a graph (xy line) graph type: ', () => {
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
      checkAnnotationText(cy, 'range annotation here!')
    })
    it('can add and edit a range annotation for the xy line graph', () => {
      testEditRangeAnnotation(cy)
    })
    it('can add and then delete a range annotation for the xy line graph', () => {
      addRangeAnnotation(cy)
      testDeleteAnnotation(cy)
    })

    it('can create an annotation that is scoped to a dashboard cell', () => {
      // create a new cell
      cy.getByTestID('button')
        .click()
        .then(() => {
          // Look at this article for removing flakiness https://www.cypress.io/blog/2020/07/22/do-not-get-too-detached/
          cy.getByTestID('selector-list schmucket').should('be.visible')
          cy.getByTestID('selector-list schmucket').click()
          cy.getByTestID(`selector-list m`).should('be.visible')
          cy.getByTestID(`selector-list m`).click()
          cy.getByTestID('selector-list v')
            .click()
            .then(() => {
              cy.getByTestID(`selector-list tv1`)
                .click()
                .then(() => {
                  cy.getByTestID('time-machine-submit-button').click()
                })
            })
        })
      cy.getByTestID('overlay').within(() => {
        cy.getByTestID('page-title').click()
        cy.getByTestID('renamable-page-title--input')
          .clear()
          .type('newCell')
        cy.getByTestID('save-cell--button').click()
      })

      // there should be no annotations in this cell
      cy.getByTestID('cell newCell').within(() => {
        cy.get('line').should('not.exist')
      })

      // create a new annotation in it
      cy.getByTestID('cell newCell').within(() => {
        cy.getByTestID('giraffe-inner-plot').click({shiftKey: true})
      })

      cy.getByTestID('overlay--container').within(() => {
        cy.getByTestID('edit-annotation-message').should('be.visible')
        cy.getByTestID('edit-annotation-message').click()
        cy.getByTestID('edit-annotation-message').focused()
        cy.getByTestID('edit-annotation-message').type('annotation in newCell')
        cy.getByTestID('annotation-submit-button').click()
      })

      // should have the annotation created and the tooltip should says "annotation in newCell"
      cy.getByTestID('cell newCell').within(() => {
        cy.getByTestID('giraffe-inner-plot').trigger('mouseover')
      })
      cy.getByTestID('giraffe-annotation-tooltip').contains(
        'annotation in newCell'
      )
    })
  })
})
