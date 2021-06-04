import {Organization} from '../../../src/types'
import {lines} from '../../support/commands'

describe('The Annotations UI functionality', () => {
  const singleStatSuffix = 'line-plus-single-stat'
  const bandSuffix = 'band'

  const setupData = (cy, plotTypeSuffix = '') => {
    cy.flush()
    cy.signin().then(() =>
      cy.fixture('routes').then(({orgs}) => {
        cy.get('@org').then(({id: orgID}: Organization) => {
          cy.visit(`${orgs}/${orgID}/dashboards-list`)
          cy.getByTestID('tree-nav')
        })
      })
    )
    cy.window().then(w => {
      cy.wait(1000)
      w.influx.set('annotations', true)
      w.influx.set('useGiraffeGraphs', true)
      w.influx.set('rangeAnnotations', true)
    })
    cy.get('@org').then(({id: orgID}: Organization) => {
      cy.createDashboard(orgID).then(({body}) => {
        cy.fixture('routes').then(({orgs}) => {
          cy.visit(`${orgs}/${orgID}/dashboards/${body.id}`)
          cy.getByTestID('tree-nav')
          cy.createBucket(orgID, name, 'schmucket')
          // have to add large amount of data to fill the window so that the random click for annotation works
          cy.writeData(lines(3000), 'schmucket')
        })
      })
    })

    // make a dashboard cell
    cy.getByTestID('add-cell--button')
      .click()
      .then(() => {
        cy.getByTestID('selector-list schmucket').click()
        cy.getByTestID(`selector-list m`)
          .should('exist')
          .click()
        cy.getByTestID('selector-list v')
          .should('exist')
          .click()

        if (plotTypeSuffix) {
          cy.getByTestID('view-type--dropdown').click()
          cy.getByTestID(`view-type--${plotTypeSuffix}`).click()
        }

        cy.getByTestID(`selector-list tv1`)
          .should('exist')
          .click()
          .then(() => {
            cy.getByTestID('time-machine-submit-button').click()
          })
      })
    cy.getByTestID('overlay').within(() => {
      cy.getByTestID('page-title').click()
      cy.getByTestID('renamable-page-title--input')
        .clear()
        .type('blah')
      cy.getByTestID('save-cell--button').click()
    })

    cy.getByTestID('toggle-annotations-controls').click()
    cy.getByTestID('annotations-control-bar').should('be.visible')
  }

  afterEach(() => {
    // clear the local storage after each test.
    // See: https://github.com/cypress-io/cypress/issues/2573
    cy.window().then(window => {
      window.sessionStorage.clear()
      window.localStorage.clear()
    })
  })

  const addAnnotationTest = cy => {
    addAnnotation(cy)

    // reload to make sure the annotation was added in the backend as well.
    cy.reload()

    // we need to see if the annotations got created and that the tooltip says "I'm a hippopotamus"
    checkAnnotationText(cy, 'im a hippopotamus')
  }

  const startEditingAnnotation = cy => {
    cy.getByTestID('cell blah').within(() => {
      // we have 2 line layers by the same id, we only want to click on the first
      cy.get('line')
        .first()
        .click()
    })
  }

  const editTheAnnotation = cy => {
    startEditingAnnotation(cy)

    cy.getByTestID('edit-annotation-message')
      .clear()
      .type('lets edit this annotation...')

    cy.getByTestID('edit-annotation-submit-button').click()
  }

  const editAnnotationTest = cy => {
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

  function actuallyDeleteAnnotation(cy) {
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

  const deleteAnnotationTest = cy => {
    addAnnotation(cy)

    actuallyDeleteAnnotation(cy)
  }

  const addAnnotation = cy => {
    cy.getByTestID('cell blah').within(() => {
      cy.getByTestID('giraffe-inner-plot').click()
    })
    cy.getByTestID('overlay--container').within(() => {
      cy.getByTestID('edit-annotation-message')
        .should('be.visible')
        .click()
        .focused()
        .type('im a hippopotamus')
      cy.getByTestID('add-annotation-submit').click()
    })
  }

  const checkAnnotationText = (cy, text) => {
    cy.getByTestID('cell blah').within(() => {
      cy.getByTestID('giraffe-inner-plot').trigger('mouseover')
    })
    cy.getByTestID('giraffe-annotation-tooltip').contains(text)
  }

  const ensureRangeAnnotationTimesAreNotEqual = cy => {
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

  const addRangeAnnotation = (cy, layerTestID = 'line') => {
    cy.getByTestID('cell blah').within(() => {
      cy.getByTestID(`giraffe-layer-${layerTestID}`).then(([canvas]) => {
        const {width, height} = canvas

        cy.wrap(canvas).trigger('mousedown', {
          x: width / 3,
          y: height / 2,
          force: true,
        })
        cy.wrap(canvas).trigger('mousemove', {
          x: (width * 2) / 3,
          y: height / 2,
          force: true,
        })
        cy.wrap(canvas).trigger('mouseup', {force: true})
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

      cy.getByTestID('add-annotation-submit').click()
    })
  }

  const editRangeAnnotationTest = (cy, layerTestID = 'line') => {
    addRangeAnnotation(cy, layerTestID)

    startEditingAnnotation(cy)

    cy.getByTestID('edit-annotation-message')
      .clear()
      .type('editing the text here for the range annotation')

    ensureRangeAnnotationTimesAreNotEqual(cy)

    cy.getByTestID('edit-annotation-submit-button').click()

    // reload to make sure the annotation was edited in the backend as well.
    cy.reload()

    checkAnnotationText(cy, 'editing the text here for the range annotation')
  }

  describe('annotations on a graph + single stat graph type', () => {
    beforeEach(() => {
      setupData(cy, singleStatSuffix)
    })
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
    beforeEach(() => {
      setupData(cy, bandSuffix)
    })
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

  describe('annotations on a graph (xy line) graph type: ', () => {
    beforeEach(() => {
      setupData(cy)
    })
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

    it('can create an annotation when graph is clicked and the control bar is closed', () => {
      // switch off the control bar
      cy.getByTestID('toggle-annotations-controls').click()
      cy.getByTestID('annotations-control-bar').should('not.exist')

      addAnnotation(cy)

      // reload to make sure the annotation was added in the backend as well.
      cy.reload()

      // should have the annotation created and the tooltip should says "im a hippopotamus"
      cy.getByTestID('cell blah').within(() => {
        cy.getByTestID('giraffe-inner-plot').trigger('mouseover')
      })
      cy.getByTestID('giraffe-annotation-tooltip').contains('im a hippopotamus')
    })

    it('can hide the Annotations Control bar after clicking on the Annotations Toggle Button', () => {
      cy.getByTestID('toggle-annotations-controls').click()
      cy.getByTestID('annotations-control-bar').should('not.exist')
    })

    it('can disable writing annotations if Enable-Annotations is disabled', () => {
      // turn off one-click annotation
      cy.getByTestID('annotations-write-mode-toggle').click()

      // click on the graph
      cy.getByTestID('cell blah').within(() => {
        cy.getByTestID('giraffe-inner-plot').click()
      })
      // should not show an overlay
      cy.getByTestID('overlay').should('not.exist')
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
          cy.getByTestID('selector-list schmucket').click()
          cy.getByTestID(`selector-list m`).click()
          cy.getByTestID('selector-list v').click()
          cy.getByTestID(`selector-list tv1`)
            .click()
            .then(() => {
              cy.getByTestID('time-machine-submit-button').click()
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
        cy.getByTestID('giraffe-inner-plot').click()
      })

      cy.getByTestID('overlay--container').within(() => {
        cy.getByTestID('edit-annotation-message')
          .should('be.visible')
          .click()
          .focused()
          .type('annotation in newCell')
        cy.getByTestID('add-annotation-submit').click()
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
