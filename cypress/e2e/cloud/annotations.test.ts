import {Organization} from '../../../src/types'
import {lines} from '../../support/commands'
describe('The Annotations UI functionality', () => {
  beforeEach(() => {
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
    cy.getByTestID('annotations-one-click-toggle').click()
  })

  afterEach(() => {
    // clear the local storage after each test.
    cy.window().then(window => {
      window.sessionStorage.clear()
      window.localStorage.clear()
    })
  })

  it('can create an annotation when the graph is clicked and the control bar is open', () => {
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

    // reload to make sure the annotation was added in the backend as well.
    cy.reload()

    // we need to see if the annotations got created and that the tooltip says "yoho"
    cy.getByTestID('cell blah').within(() => {
      cy.getByTestID('giraffe-inner-plot').trigger('mouseover')
    })
    cy.getByTestID('giraffe-annotation-tooltip').contains('im a hippopotamus')
  })

  it('can create an annotation when graph is clicked and the control bar is closed', () => {
    // switch off the control bar
    cy.getByTestID('toggle-annotations-controls').click()
    cy.getByTestID('annotations-control-bar').should('not.exist')

    // add the annotation
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
    cy.getByTestID('annotations-one-click-toggle').click()

    // click on the graph
    cy.getByTestID('cell blah').within(() => {
      cy.getByTestID('giraffe-inner-plot').click()
    })
    // should not show an overlay
    cy.getByTestID('overlay').should('not.exist')
  })

  it('can show a tooltip when annotation is hovered on in the graph', () => {
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

    cy.getByTestID('cell blah').within(() => {
      cy.getByTestID('giraffe-inner-plot').trigger('mouseover')
    })
    cy.getByTestID('giraffe-annotation-tooltip').contains('im a hippopotamus')
  })

  it('can delete an annotation by clicking on the annotation line', () => {
    // add the annotation
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
  })

  it('can edit an annotation by clicking on the annotation line', () => {
    // add the annotation
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

    cy.getByTestID('edit-annotation-submit-button').click()

    // reload to make sure the annotation was edited in the backend as well.
    cy.reload()

    // annotation tooltip should say the new name
    cy.getByTestID('cell blah').within(() => {
      cy.getByTestID('giraffe-inner-plot').trigger('mouseover')
    })
    cy.getByTestID('giraffe-annotation-tooltip').contains(
      'lets edit this annotation...'
    )
  })

  it('can cancel an annotation edit process by clicking on the cancel button in the edit annotation form', () => {
    // add the annotation
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
        cy.getByTestID(`selector-list m`)
          .should('exist')
          .click()
        cy.getByTestID('selector-list v')
          .should('exist')
          .click()
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
