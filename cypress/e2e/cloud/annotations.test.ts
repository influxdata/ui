import {Organization} from '../../../src/types'
import {lines} from '../../support/commands'
import * as moment from 'moment'

describe('The Annotations UI functionality', () => {
  const singleStatSuffix = 'line-plus-single-stat'
  const bandSuffix = 'band'

  const setupData = (
    cy: Cypress.Chainable,
    plotTypeSuffix = '',
    enableRangeAnnotations = true
  ) => {
    cy.flush()
    return cy.signin().then(() =>
      cy.get('@org').then(({id: orgID}: Organization) =>
        cy.createDashboard(orgID).then(({body}) =>
          cy.fixture('routes').then(({orgs}) => {
            cy.visit(`${orgs}/${orgID}/dashboards/${body.id}`)
            return cy
              .setFeatureFlags({
                annotations: true,
                useGiraffeGraphs: true,
                rangeAnnotations: enableRangeAnnotations,
              })
              .then(() => {
                cy.createBucket(orgID, name, 'schmucket')
                // have to add large amount of data to fill the window so that the random click for annotation works
                cy.writeData(lines(3000), 'schmucket')

                // make a dashboard cell
                cy.getByTestID('add-cell--button').click()
                cy.getByTestID('selector-list schmucket').should('be.visible')
                cy.getByTestID('selector-list schmucket').click()
                cy.getByTestID(`selector-list m`).should('be.visible')
                cy.getByTestID(`selector-list m`).click()
                cy.getByTestID('selector-list v').should('be.visible')
                cy.getByTestID(`selector-list v`).click()

                if (plotTypeSuffix) {
                  cy.getByTestID('view-type--dropdown').click()
                  cy.getByTestID(`view-type--${plotTypeSuffix}`).click()
                }

                cy.getByTestID(`selector-list tv1`).click()
                cy.getByTestID('time-machine-submit-button').click()
                cy.getByTestID('overlay').within(() => {
                  cy.getByTestID('page-title').click()
                  cy.getByTestID('renamable-page-title--input')
                    .clear()
                    .type('blah')
                  cy.getByTestID('save-cell--button').click()
                })

                // annotations are on by default; so the bar should be visible:
                return cy
                  .getByTestID('annotations-control-bar')
                  .should('be.visible')
              })
          })
        )
      )
    )
  }

  afterEach(() => {
    // clear the local storage after each test.
    // See: https://github.com/cypress-io/cypress/issues/2573
    cy.window().then(window => {
      window.sessionStorage.clear()
      window.localStorage.clear()
    })
  })

  const addAnnotationTest = (cy: Cypress.Chainable) => {
    addAnnotation(cy)

    // reload to make sure the annotation was added in the backend as well.
    cy.reload()

    // we need to see if the annotations got created and that the tooltip says "I'm a hippopotamus"
    checkAnnotationText(cy, 'im a hippopotamus')
  }

  const startEditingAnnotation = (cy: Cypress.Chainable) => {
    cy.getByTestID('cell blah').within(() => {
      // we have 2 line layers by the same id, we only want to click on the first
      cy.get('line')
        .first()
        .click()
    })
  }

  const editTheAnnotation = (cy: Cypress.Chainable) => {
    startEditingAnnotation(cy)

    cy.getByTestID('edit-annotation-message')
      .clear()
      .type('lets edit this annotation...')

    cy.getByTestID('annotation-submit-button').click()
  }

  const editAnnotationTest = (cy: Cypress.Chainable) => {
    addAnnotation(cy)

    // should have the annotation created , lets click it to show the modal.
    editTheAnnotation(cy)

    // reload to make sure the annotation was edited in the backend as well.
    cy.reload()

    // annotation tooltip should say the new name
    cy.getByTestID('cell blah').within(() => {
      cy.getByTestID('giraffe-inner-plot').trigger('mouseover')
    })
    cy.getByTestID('giraffe-annotation-tooltip').contains(
      'lets edit this annotation...'
    )
  }

  const actuallyDeleteAnnotation = (cy: Cypress.Chainable) => {
    // should have the annotation created , lets click it to show the modal.
    cy.getByTestID('cell blah').within(() => {
      // we have 2 line layers by the same id, we only want to click on the first
      cy.get('line')
        .first()
        .click()
    })

    cy.getByTestID('delete-annotation-button').click()

    // reload to make sure the annotation was deleted from the backend as well.
    cy.reload()

    // annotation line should not exist in the dashboard cell
    cy.getByTestID('cell blah').within(() => {
      cy.get('line').should('not.exist')
    })
  }

  const deleteAnnotationTest = (cy: Cypress.Chainable) => {
    addAnnotation(cy)

    actuallyDeleteAnnotation(cy)
  }

  const addAnnotation = (cy: Cypress.Chainable) => {
    cy.getByTestID('cell blah').within(() => {
      cy.getByTestID('giraffe-inner-plot').click({shiftKey: true})
    })
    cy.getByTestID('overlay--container').within(() => {
      cy.getByTestID('edit-annotation-message')
        .should('be.visible')
        .click()
        .focused()
        .type('im a hippopotamus')
      cy.getByTestID('annotation-submit-button').click()
    })
  }

  const checkAnnotationText = (cy: Cypress.Chainable, text: string) => {
    cy.getByTestID('cell blah').within(() => {
      cy.getByTestID('giraffe-inner-plot').trigger('mouseover')
    })
    cy.getByTestID('giraffe-annotation-tooltip').contains(text)
  }

  const ensureRangeAnnotationTimesAreNotEqual = (cy: Cypress.Chainable) => {
    cy.getByTestID('endTime-testID')
      .invoke('val')
      .then(endTimeValue => {
        cy.getByTestID('startTime-testID')
          .invoke('val')
          .then(startTimeValue => {
            expect(endTimeValue).to.not.equal(startTimeValue)
          })
      })
  }

  const addRangeAnnotation = (cy: Cypress.Chainable, layerTestID = 'line') => {
    cy.getByTestID('cell blah').within(() => {
      cy.getByTestID(`giraffe-layer-${layerTestID}`).then(([canvas]) => {
        const {width, height} = canvas

        cy.wrap(canvas).trigger('mousedown', {
          x: width / 3,
          y: height / 2,
          force: true,
          shiftKey: true,
        })
        cy.wrap(canvas).trigger('mousemove', {
          x: (width * 2) / 3,
          y: height / 2,
          force: true,
          shiftKey: true,
        })
        cy.wrap(canvas).trigger('mouseup', {force: true, shiftKey: true})
      })
    })

    cy.getByTestID('overlay--container').within(() => {
      cy.getByTestID('edit-annotation-message')
        .should('be.visible')
        .click()
        .focused()
        .type('range annotation here!')

      // make sure the two times (start and end) are not equal:
      ensureRangeAnnotationTimesAreNotEqual(cy)

      cy.getByTestID('annotation-submit-button').click()
    })
  }

  const editRangeAnnotationTest = (
    cy: Cypress.Chainable,
    layerTestID = 'line'
  ) => {
    addRangeAnnotation(cy, layerTestID)

    startEditingAnnotation(cy)

    cy.getByTestID('edit-annotation-message')
      .clear()
      .type('editing the text here for the range annotation')

    ensureRangeAnnotationTimesAreNotEqual(cy)

    cy.getByTestID('annotation-submit-button').click()

    // reload to make sure the annotation was edited in the backend as well.
    cy.reload()

    checkAnnotationText(cy, 'editing the text here for the range annotation')
  }

  describe('annotations on a graph + single stat graph type', () => {
    beforeEach(() => setupData(cy, singleStatSuffix))
    it('can create an annotation on the single stat + line graph', () => {
      addAnnotationTest(cy)
    })
    it('can edit an annotation for the single stat + line graph', () => {
      editAnnotationTest(cy)
    })
    it('can delete an annotation for the single stat + line graph', () => {
      deleteAnnotationTest(cy)
    })
    it('can add a range annotation for the xy single stat + line graph', () => {
      addRangeAnnotation(cy)
      checkAnnotationText(cy, 'range annotation here!')
    })
    it('can add and edit a range annotation for the single stat + line graph', () => {
      editRangeAnnotationTest(cy)
    })
    it('can add and then delete a range annotation for the single stat + line graph', () => {
      addRangeAnnotation(cy)
      actuallyDeleteAnnotation(cy)
    })
  })

  describe('annotations on a band plot graph type', () => {
    beforeEach(() => setupData(cy, bandSuffix))
    it('can create an annotation on the band plot', () => {
      addAnnotationTest(cy)
    })
    it('can edit an annotation for the band plot', () => {
      editAnnotationTest(cy)
    })
    it('can delete an annotation for the band plot ', () => {
      deleteAnnotationTest(cy)
    })

    it('can add a range annotation for the band plot', () => {
      addRangeAnnotation(cy, 'band-chart')
      checkAnnotationText(cy, 'range annotation here!')
    })
    it('can add and edit a range annotation for the band plot', () => {
      editRangeAnnotationTest(cy, 'band-chart')
    })
    it('can add and then delete a range annotation for the band plot', () => {
      addRangeAnnotation(cy, 'band-chart')
      actuallyDeleteAnnotation(cy)
    })
  })
  describe('point annotations only, range annotations are off: ', () => {
    beforeEach(() => setupData(cy, '', false))

    it('can show the correct message on the annotation bar when range annotations are OFF', () => {
      cy.getByTestID('annotations-control-bar').should(
        'contain',
        'Shift + click on a graph to create a point annotation'
      )
      cy.getByTestID('annotations-control-bar').should(
        'not.contain',
        'click + shift + drag to create a range annotation'
      )
    })

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
      addAnnotationTest(cy)
    })
    it('can edit an annotation  for the xy line graph', () => {
      editAnnotationTest(cy)
    })
    it('can delete an annotation  for the xy line graph', () => {
      deleteAnnotationTest(cy)
    })
    it('can add a range annotation for the xy line graph', () => {
      addRangeAnnotation(cy)
      checkAnnotationText(cy, 'range annotation here!')
    })
    it('can add and edit a range annotation for the xy line graph', () => {
      editRangeAnnotationTest(cy)
    })
    it('can add and then delete a range annotation for the xy line graph', () => {
      addRangeAnnotation(cy)
      actuallyDeleteAnnotation(cy)
    })

    it('can show the correct message on the annotation bar when range annotations are on', () => {
      cy.getByTestID('annotations-control-bar').should(
        'contain',
        'Shift + click on a graph to create a point annotation'
      )
      cy.getByTestID('annotations-control-bar').should(
        'contain',
        'click + shift + drag to create a range annotation'
      )
    })

    it('shows the range/point annotation type picker when range annotations are on', () => {
      cy.getByTestID('cell blah').within(() => {
        cy.getByTestID('giraffe-inner-plot').click({shiftKey: true})
      })
      cy.getByTestID('overlay--container').within(() => {
        cy.getByTestID('annotation-form-point-type-option').should('be.visible')
        cy.getByTestID('annotation-form-range-type-option').should('be.visible')
      })
    })
    it('can add a range annotation, then edit it and switch back and forth from point->range and the endtime stays the same', () => {
      addRangeAnnotation(cy)
      startEditingAnnotation(cy)

      // verify there is an end time:
      cy.getByTestID('endTime-testID').should('be.visible')

      // verify that it is range annotation (the range selector option is selected)
      cy.getByTestID('annotation-form-range-type-option--input').should(
        'be.checked'
      )

      // get the 'end time' value:
      cy.getByTestID('endTime-testID')
        .invoke('val')
        .then(endTimeValue => {
          // switch it to a point annotation
          cy.getByTestID('annotation-form-point-type-option').click()

          // the endTime input should disappear
          cy.getByTestID('endTime-testID').should('not.exist')

          // switch back to range:
          cy.getByTestID('annotation-form-range-type-option').click()

          cy.getByTestID('endTime-testID')
            .should('be.visible')
            .invoke('val')
            .then(endTimeValue2 => {
              expect(endTimeValue).to.equal(endTimeValue2)
            })
        })
    })
    it('can add a range annotation, then edit it and change to a point annotation', () => {
      addRangeAnnotation(cy)
      cy.reload()
      startEditingAnnotation(cy)

      // verify that it is range annotation (the range selector option is selected)
      cy.getByTestID('annotation-form-range-type-option--input').should(
        'be.checked'
      )

      // switch it to a point annotation
      cy.getByTestID('annotation-form-point-type-option').click()

      // verify that it is point  annotation now
      cy.getByTestID('annotation-form-point-type-option--input').should(
        'be.checked'
      )

      // the endTime input should disappear
      cy.getByTestID('endTime-testID').should('not.exist')

      // save it
      cy.getByTestID('annotation-submit-button').click()

      // reload to make sure it gets to the backend
      cy.reload()
      startEditingAnnotation(cy)

      // make sure it is (still) a point annotation:
      cy.getByTestID('endTime-testID').should('not.exist')
      cy.getByTestID('annotation-form-point-type-option--input').should(
        'be.checked'
      )
    })
    it('can add an annotation; that is originally a point and then switch to a range', () => {
      cy.getByTestID('cell blah').within(() => {
        cy.getByTestID('giraffe-inner-plot').click({shiftKey: true})
      })
      cy.getByTestID('overlay--container').within(() => {
        cy.getByTestID('edit-annotation-message')
          .should('be.visible')
          .click()
          .focused()
          .type('random annotation, should be a range')

        // should be of type 'point'
        cy.getByTestID('annotation-form-point-type-option--input').should(
          'be.checked'
        )

        // confirm that the 'endTime' input is NOT THERE
        cy.getByTestID('endTime-testID').should('not.exist')

        // now: click the button to switch to range:
        cy.getByTestID('annotation-form-range-type-option').click()

        // now, the end time input SHOULD show up
        cy.getByTestID('endTime-testID').should('be.visible')

        // at first the two times are equal; check that; then upgrade the time by 10 minutes; and save it
        cy.getByTestID('startTime-testID')
          .invoke('val')
          .then(startTimeValue => {
            cy.getByTestID('endTime-testID')
              .invoke('val')
              .then(endTimeValue => {
                expect(endTimeValue).to.equal(startTimeValue)

                const newEndTime = moment(endTimeValue)
                  .add(10, 'minutes')
                  .format('YYYY-MM-DD hh:mm:ss a')

                cy.getByTestID('endTime-testID')
                  .click()
                  .focused()
                  .clear()
                  .type(newEndTime)

                cy.getByTestID('annotation-submit-button').click()

                // reload to make sure the annotation was added in the backend as well.
                cy.reload()
              })
          })
      }) // end overlay-container within
      checkAnnotationText(cy, 'random annotation, should be a range')

      startEditingAnnotation(cy)

      // verify there is an end time:
      cy.getByTestID('endTime-testID').should('be.visible')

      // verify that it is range annotation (the range selector option is selected)
      cy.getByTestID('annotation-form-range-type-option--input').should(
        'be.checked'
      )

      cy.getByTestID('startTime-testID')
        .invoke('val')
        .then(startTimeValue => {
          cy.getByTestID('endTime-testID')
            .invoke('val')
            .then(endTimeValue => {
              expect(endTimeValue).to.not.equal(startTimeValue)

              // should be 10 minutes between them:
              const duration = moment.duration(
                moment(endTimeValue).diff(moment(startTimeValue))
              )
              const minutes = duration.asMinutes()

              expect(minutes).to.equal(10)
            })
        })
    })

    it('can create an annotation, and then after turning off annotation mode annotations disappear', () => {
      // create an annotation
      addAnnotation(cy)

      // reload to make sure the annotation was added in the backend as well.
      cy.reload()

      // verify the tooltip shows up
      checkAnnotationText(cy, 'im a hippopotamus')

      // turn off annotations mode
      cy.getByTestID('toggle-annotations-controls').click()

      // verify the annotation does NOT show up
      cy.getByTestID('cell blah').within(() => {
        cy.getByTestID('giraffe-inner-plot').trigger('mouseover')
      })

      cy.getByTestID('giraffe-annotation-tooltip').should('not.exist')
    })

    it('cannot create an annotation when graph is clicked and the control bar is closed', () => {
      // switch off the control bar
      cy.getByTestID('toggle-annotations-controls').click()
      cy.getByTestID('annotations-control-bar').should('not.exist')

      cy.getByTestID('cell blah').within(() => {
        cy.getByTestID('giraffe-inner-plot').click({shiftKey: true})
      })

      cy.getByTestID('overlay--container').should('not.exist')
    })

    it('cannot create an annotation when the shift key is NOT pressed down', () => {
      cy.getByTestID('cell blah').within(() => {
        cy.getByTestID('giraffe-inner-plot').click()
      })

      cy.getByTestID('overlay--container').should('not.exist')
    })

    it('can hide the Annotations Control bar after clicking on the Annotations Toggle Button', () => {
      cy.getByTestID('toggle-annotations-controls').click()
      cy.getByTestID('annotations-control-bar').should('not.exist')
    })

    it('can show a tooltip when annotation is hovered on in the graph', () => {
      addAnnotation(cy)

      cy.getByTestID('cell blah').within(() => {
        cy.getByTestID('giraffe-inner-plot').trigger('mouseover')
      })
      cy.getByTestID('giraffe-annotation-tooltip').contains('im a hippopotamus')
    })

    it('can cancel an annotation edit process by clicking on the cancel button in the edit annotation form', () => {
      addAnnotation(cy)

      // should have the annotation created , lets click it to show the modal.
      cy.getByTestID('cell blah').within(() => {
        // we have 2 line layers by the same id, we only want to click on the first
        cy.get('line')
          .first()
          .click()
      })

      cy.getByTestID('edit-annotation-message')
        .clear()
        .type('lets edit this annotation...')

      cy.getByTestID('edit-annotation-cancel-button').click()

      // annotation tooltip should say the old name
      cy.getByTestID('cell blah').within(() => {
        cy.getByTestID('giraffe-inner-plot').trigger('mouseover')
      })
      cy.getByTestID('giraffe-annotation-tooltip').contains('im a hippopotamus')
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
