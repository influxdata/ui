import {Organization} from '../../../src/types'
import {points} from '../../support/commands'

export const setupData = (cy: Cypress.Chainable, plotTypeSuffix = '') =>
  cy.flush().then(() =>
    cy.signin().then(() =>
      cy.get('@org').then(({id: orgID}: Organization) =>
        cy.createDashboard(orgID).then(({body}) =>
          cy.fixture('routes').then(({orgs}) => {
            cy.visit(`${orgs}/${orgID}/dashboards/${body.id}`)
            return cy.then(() => {
              cy.createBucket(orgID, name, 'devbucket')
              // have to add large amount of data to fill the window so that the random click for annotation works
              cy.writeData(points(3, 1_200_000), 'devbucket')

              // make a dashboard cell
              cy.getByTestID('add-cell--button').click()
              cy.getByTestID('selector-list devbucket').should(
                'have.length.of.at.least',
                1
              )
              cy.getByTestID('selector-list devbucket').click()

              cy.getByTestID('selector-list m').should(
                'have.length.of.at.least',
                1
              )
              cy.getByTestID('selector-list m').clickAttached()

              cy.getByTestID('selector-list v').should(
                'have.length.of.at.least',
                1
              )
              cy.getByTestID('selector-list v').clickAttached()

              if (plotTypeSuffix) {
                cy.getByTestID('view-type--dropdown').click()
                cy.getByTestID(`view-type--${plotTypeSuffix}`).click()
              }

              cy.getByTestID(`selector-list tv1`).should(
                'have.length.of.at.least',
                1
              )
              cy.getByTestID(`selector-list tv1`).clickAttached()

              cy.getByTestID('time-machine-submit-button').click()

              cy.getByTestID('overlay').within(() => {
                cy.getByTestID('page-title').click()
                cy.getByTestID('renamable-page-title--input')
                  .clear()
                  .type('blah')
                cy.getByTestID('save-cell--button').click()
              })

              cy.getByTestID('toggle-annotations-controls').click()
            })
          })
        )
      )
    )
  )

export const reloadAndHandleAnnotationDefaultStatus = () => {
  cy.reload()
  cy.getByTestID('toggle-annotations-controls').click()
}

export const addAnnotation = (cy: Cypress.Chainable) => {
  cy.getByTestID('cell blah').within(() => {
    cy.getByTestID('giraffe-inner-plot').click({shiftKey: true})
  })

  cy.getByTestID('overlay--container')
    .should('be.visible')
    .within(() => {
      cy.getByTestID('edit-annotation-message')
        .should('be.visible')
        .click()
        .type('im a hippopotamus')
      cy.getByTestID('annotation-submit-button')
        .should('be.visible')
        .click()
    })
}

export const startEditingAnnotation = (cy: Cypress.Chainable) => {
  cy.getByTestID('cell blah').within(() => {
    // we have 2 line layers by the same id, we only want to click on the first
    cy.get('.giraffe-annotation-line')
      .first()
      .click({force: true})
  })
}

export const editAnnotation = (cy: Cypress.Chainable) => {
  startEditingAnnotation(cy)

  cy.getByTestID('overlay--container')
    .should('be.visible')
    .within(() => {
      cy.getByTestID('edit-annotation-message')
        .should('be.visible')
        .clear()
        .type('lets edit this annotation...')

      cy.getByTestID('annotation-submit-button')
        .should('be.visible')
        .click()
    })
}

export const deleteAnnotation = (cy: Cypress.Chainable) => {
  // should have the annotation created , lets click it to show the modal.
  startEditingAnnotation(cy)

  cy.getByTestID('overlay--container')
    .should('be.visible')
    .within(() => {
      cy.getByTestID('delete-annotation-button').click({force: true})
    })

  // reload to make sure the annotation was deleted from the backend as well.
  reloadAndHandleAnnotationDefaultStatus()

  // annotation line should not exist in the dashboard cell
  cy.getByTestID('cell blah').within(() => {
    cy.get('.giraffe-annotation-line').should('not.exist')
  })
}

export const checkAnnotationText = (cy: Cypress.Chainable, text: string) => {
  cy.getByTestID('cell blah').within(() => {
    cy.get('.giraffe-annotation-line')
      .should('exist')
      .first()
      .trigger('mouseover')
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

export const addRangeAnnotation = (
  cy: Cypress.Chainable,
  layerTestID = 'line'
) => {
  cy.getByTestID('cell blah').within(() => {
    cy.getByTestID(`giraffe-layer-${layerTestID}`).then(([canvas]) => {
      const {offsetWidth, offsetHeight} = canvas

      cy.wrap(canvas).trigger('mousedown', {
        x: offsetWidth / 3,
        y: offsetHeight / 2,
        force: true,
        shiftKey: true,
      })
      cy.wrap(canvas).trigger('mousemove', {
        x: (offsetWidth * 2) / 3,
        y: offsetHeight / 2,
        force: true,
        shiftKey: true,
      })
      cy.wrap(canvas).trigger('mouseup', {force: true, shiftKey: true})
    })
  })

  cy.getByTestID('overlay--container')
    .should('be.visible')
    .within(() => {
      cy.getByTestID('edit-annotation-message')
        .should('be.visible')
        .click()
        .type('range annotation here!')

      // make sure the two times (start and end) are not equal:
      ensureRangeAnnotationTimesAreNotEqual(cy)

      cy.getByTestID('annotation-submit-button')
        .should('be.visible')
        .click()
    })
}

export const testAddAnnotation = (cy: Cypress.Chainable) => {
  addAnnotation(cy)

  // reload to make sure the annotation was added in the backend as well.
  reloadAndHandleAnnotationDefaultStatus()

  // we need to see if the annotations got created and that the tooltip says "I'm a hippopotamus"
  checkAnnotationText(cy, 'im a hippopotamus')
}

export const testEditAnnotation = (cy: Cypress.Chainable) => {
  addAnnotation(cy)

  // should have the annotation created , lets click it to show the modal.
  editAnnotation(cy)

  // reload to make sure the annotation was edited in the backend as well.
  reloadAndHandleAnnotationDefaultStatus()

  // annotation tooltip should say the new name
  cy.getByTestID('cell blah').within(() => {
    cy.get('.giraffe-annotation-line')
      .should('exist')
      .first()
      .trigger('mouseover')
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

  cy.getByTestID('overlay--container')
    .should('be.visible')
    .within(() => {
      cy.getByTestID('edit-annotation-message')
        .should('be.visible')
        .clear()
        .type('editing the text here for the range annotation')
    })

  ensureRangeAnnotationTimesAreNotEqual(cy)

  cy.getByTestID('annotation-submit-button').click()

  // reload to make sure the annotation was edited in the backend as well.
  reloadAndHandleAnnotationDefaultStatus()

  checkAnnotationText(cy, 'editing the text here for the range annotation')
}

export const testDeleteAnnotation = (cy: Cypress.Chainable) => {
  addAnnotation(cy)

  deleteAnnotation(cy)
}
