import {Organization} from '../../../src/types'
import {lines} from '../../support/commands'

export const clearLocalStorage = () => {
  // clear the local storage after each test.
  // See: https://github.com/cypress-io/cypress/issues/2573
  cy.window().then(window => {
    window.sessionStorage.clear()
    window.localStorage.clear()
  })
}

export const setupData = (
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
            })
        })
      )
    )
  )
}

export const addAnnotation = (cy: Cypress.Chainable) => {
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

export const startEditingAnnotation = (cy: Cypress.Chainable) => {
  cy.getByTestID('cell blah').within(() => {
    // we have 2 line layers by the same id, we only want to click on the first
    cy.get('line')
      .first()
      .click()
  })
}

export const editAnnotation = (cy: Cypress.Chainable) => {
  startEditingAnnotation(cy)

  cy.getByTestID('edit-annotation-message')
    .clear()
    .type('lets edit this annotation...')

  cy.getByTestID('annotation-submit-button').click()
}

export const deleteAnnotation = (cy: Cypress.Chainable) => {
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

export const checkAnnotationText = (cy: Cypress.Chainable, text: string) => {
  cy.getByTestID('cell blah').within(() => {
    cy.getByTestID('giraffe-inner-plot').trigger('mouseover')
  })
  cy.getByTestID('giraffe-annotation-tooltip').contains(text)
}

const ensureRangeAnnotationTimesAreNotEqual = (
  cy: Cypress.Chainable
) => {
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

export const addRangeAnnotation = (
  cy: Cypress.Chainable,
  layerTestID = 'line'
) => {
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

export const testAddAnnotation = (cy: Cypress.Chainable) => {
  addAnnotation(cy)

  // reload to make sure the annotation was added in the backend as well.
  cy.reload()

  // we need to see if the annotations got created and that the tooltip says "I'm a hippopotamus"
  checkAnnotationText(cy, 'im a hippopotamus')
}

const testEditAnnotation = (cy: Cypress.Chainable) => {
  addAnnotation(cy)

  // should have the annotation created , lets click it to show the modal.
  editAnnotation(cy)

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

export const testEditRangeAnnotation = (
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

export const testDeleteAnnotation = (cy: Cypress.Chainable) => {
  addAnnotation(cy)

  deleteAnnotation(cy)
}
