import {Organization} from '../../src/types'
import {points} from '../support/commands'

export const ANNOTATION_TEXT = 'im a hippopotamus'
export const EDIT_ANNOTATION_TEXT = 'lets edit this annotation'
export const RANGE_ANNOTATION_TEXT = 'range annotation here'
export const EDIT_RANGE_ANNOTATION_TEXT =
  'editing the text here for the range annotation'

export const setupData = (cy: Cypress.Chainable, plotTypeSuffix = '') =>
  cy.flush().then(() =>
    cy.signin().then(() =>
      cy.get('@org').then(({id: orgID, name}: Organization) =>
        cy.createDashboard(orgID).then(({body}) =>
          cy.fixture('routes').then(({orgs}) => {
            cy.visit(`${orgs}/${orgID}/dashboards/${body.id}`)
            return cy.then(() => {
              cy.createBucket(orgID, name, 'devbucket')
              /*
                note:
                  graph types vary in the presentation of the line
                  for example, "Graph" presents a line less steep than "Graph + Single Stat"
                  use enough points and a time difference that works for all graph types
                  10 points and 5 minute time difference works well
              */
              cy.writeData(points(10, 600_000), 'devbucket')

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

              cy.getByTestID('page-title').click()
              cy.getByTestID('renamable-page-title--input')
                .clear()
                .type('blah{enter}')
              cy.getByTestID('save-cell--button').click()

              cy.getByTestID('toggle-annotations-controls').click()
            })
          })
        )
      )
    )
  )

export const addAnnotation = (cy: Cypress.Chainable) => {
  cy.getByTestID('cell blah').within(() => {
    cy.getByTestID('giraffe-inner-plot').click({shiftKey: true})
  })

  cy.getByTestID('overlay--container').should('be.visible')
  cy.getByTestID('annotation-message--form').should('be.visible')

  cy.getByTestID('edit-annotation-message')
    .focused()
    .invoke('val', ANNOTATION_TEXT)
    .focused()
    .type('.')
    .then(() => {
      cy.getByTestID('annotation-submit-button')
        .should($el => {
          expect($el).to.have.length(1)
          expect(Cypress.dom.isDetached($el)).to.be.false
          // eslint-disable-next-line @typescript-eslint/unbound-method
          expect($el).not.to.be.disabled
        })
        .click()
    })

  cy.getByTestID('annotation-message--form').should('not.exist')
}

export const startEditingAnnotation = (cy: Cypress.Chainable) => {
  cy.getByTestID('cell blah').should('be.visible')
  cy.get('.giraffe-annotation-click-target')
    .should($el => {
      expect(Cypress.dom.isDetached($el)).to.be.false
    })
    .click({force: true})
}

export const deleteAnnotation = (cy: Cypress.Chainable) => {
  // should have the annotation created , lets click it to show the modal.
  startEditingAnnotation(cy)

  cy.getByTestID('overlay--container').should('be.visible')

  cy.getByTestID('delete-annotation-button').clickAttached()

  // make sure the delete was successful
  cy.getByTestID('notification-success').should('be.visible')

  // annotation line should not exist in the dashboard cell
  cy.getByTestID('cell blah').within(() => {
    cy.get('.giraffe-annotation-click-target').should('not.exist')
  })
}

export const checkAnnotationText = (cy: Cypress.Chainable, text: string) => {
  cy.getByTestID('cell blah').within(() => {
    cy.get('.giraffe-annotation-click-target')
      .should($el => {
        expect(Cypress.dom.isDetached($el)).to.be.false
      })
      .trigger('mouseover')
  })
  cy.getByTestID('giraffe-annotation-tooltip').contains(text)
}

export const addRangeAnnotation = (
  cy: Cypress.Chainable,
  layerTestID = 'line'
) => {
  cy.getByTestID('cell blah').within(() => {
    cy.getByTestID(`giraffe-layer-${layerTestID}`).then(([canvas]) => {
      const {offsetWidth, offsetHeight} = canvas
      const {x, y} = canvas.getBoundingClientRect()

      cy.wrap(canvas).trigger('mousedown', {
        pageX: x + offsetWidth / 4,
        pageY: y + offsetHeight / 2,
        force: true,
        shiftKey: true,
      })
      cy.wrap(canvas).trigger('mousemove', {
        pageX: x + (offsetWidth * 3) / 4,
        pageY: y + offsetHeight / 2,
        force: true,
        shiftKey: true,
      })
      cy.wrap(canvas).trigger('mouseup', {force: true, shiftKey: true})
    })
  })

  cy.getByTestID('overlay--container').should('be.visible')
  cy.getByTestID('annotation-message--form').should('be.visible')

  cy.getByTestID('edit-annotation-message')
    .focused()
    .invoke('val', RANGE_ANNOTATION_TEXT)
    .focused()
    .type('.')
    .then(() => {
      cy.getByTestID('annotation-submit-button')
        .should($el => {
          expect($el).to.have.length(1)
          expect(Cypress.dom.isDetached($el)).to.be.false
          // eslint-disable-next-line @typescript-eslint/unbound-method
          expect($el).not.to.be.disabled
        })
        .click()
    })

  cy.getByTestID('annotation-message--form').should('not.exist')
}

export const testAddAnnotation = (cy: Cypress.Chainable) => {
  addAnnotation(cy)

  // we need to see if the annotations got created and that the tooltip says "I'm a hippopotamus"
  checkAnnotationText(cy, ANNOTATION_TEXT)
}

export const testEditAnnotation = (cy: Cypress.Chainable) => {
  addAnnotation(cy)

  startEditingAnnotation(cy)

  cy.getByTestID('overlay--container').should('be.visible')
  cy.getByTestID('annotation-message--form').should('be.visible')

  cy.getByTestID('edit-annotation-message')
    .focused()
    .invoke('val', EDIT_ANNOTATION_TEXT)
    .focused()
    .type('.')
    .then(() => {
      cy.getByTestID('annotation-submit-button')
        .should($el => {
          expect($el).to.have.length(1)
          expect(Cypress.dom.isDetached($el)).to.be.false
          // eslint-disable-next-line @typescript-eslint/unbound-method
          expect($el).not.to.be.disabled
        })
        .click()
    })

  cy.getByTestID('annotation-message--form').should('not.exist')

  // make sure the edit was saved successfully
  cy.getByTestID('notification-success').should('be.visible')

  checkAnnotationText(cy, EDIT_ANNOTATION_TEXT)
}

export const testEditRangeAnnotation = (
  cy: Cypress.Chainable,
  layerTestID = 'line'
) => {
  addRangeAnnotation(cy, layerTestID)

  startEditingAnnotation(cy)

  cy.getByTestID('overlay--container').should('be.visible')
  cy.getByTestID('annotation-message--form').should('be.visible')

  cy.getByTestID('edit-annotation-message')
    .focused()
    .invoke('val', EDIT_RANGE_ANNOTATION_TEXT)
    .focused()
    .type('.')
    .then(() => {
      // ensure the two times are not equal before submitting
      cy.getByTestID('endTime-testID')
        .invoke('val')
        .then(endTimeValue => {
          cy.getByTestID('startTime-testID')
            .invoke('val')
            .then(startTimeValue => {
              expect(endTimeValue).to.not.equal(startTimeValue)

              cy.getByTestID('annotation-submit-button')
                .should($el => {
                  expect($el).to.have.length(1)
                  expect(Cypress.dom.isDetached($el)).to.be.false
                  // eslint-disable-next-line @typescript-eslint/unbound-method
                  expect($el).not.to.be.disabled
                })
                .click()
            })
        })
    })

  cy.getByTestID('annotation-message--form').should('not.exist')

  // make sure the edit was saved successfully
  cy.getByTestID('notification-success').should('be.visible')

  checkAnnotationText(cy, EDIT_RANGE_ANNOTATION_TEXT)
}

export const testDeleteAnnotation = (cy: Cypress.Chainable) => {
  addAnnotation(cy)

  deleteAnnotation(cy)
}
