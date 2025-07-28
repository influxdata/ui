import {Organization} from '../../../src/types'
import {makeGraphSnapshot} from '../../support/commands'
import {genCurve} from '../../support/Utils'

const newLabelName = 'click-me'
const dashboardName = 'Bee Happy'
const dashboardName2 = 'test dashboard'
const dashSearchName = 'bEE'

describe('Dashboards', () => {
  beforeEach(() => {
    cy.flush().then(() =>
      cy.signin().then(() =>
        cy
          .setFeatureFlags({
            showDashboardsInNewIOx: true,
            showVariablesInNewIOx: true,
          })
          .then(() => {
            cy.fixture('routes').then(({orgs}) => {
              return cy
                .get<Organization>('@org')
                .then(({id: orgID}: Organization) => {
                  cy.visit(`${orgs}/${orgID}/dashboards-list`)
                })
            })
            return cy.getByTestID('tree-nav')
          })
      )
    )
  })

  it('empty state should have a header with text and a button to create a dashboard', () => {
    cy.getByTestID('page-contents').within(() => {
      cy.getByTestID('empty-dashboards-list').within(() => {
        cy.getByTestID('empty-state--text').should($t => {
          expect($t).to.have.length(1)
          expect($t).to.contain(
            "Looks like you don't have any Dashboards, why not create one?"
          )
        })
        cy.getByTestID('add-resource-dropdown--button').should($b => {
          expect($b).to.have.length(1)
          expect($b).to.contain('Create Dashboard')
        })
      })
    })
  })

  it('can CRUD dashboards from empty state, header, and a Template', () => {
    const newName = 'new 🅱️ashboard'
    // Create from empty state
    cy.getByTestID('empty-dashboards-list').within(() => {
      cy.getByTestID('add-resource-dropdown--button').first().click()
    })

    cy.getByTestID('add-resource-dropdown--new').click()
    cy.fixture('routes').then(({orgs}) => {
      cy.get<Organization>('@org').then(({id}: Organization) => {
        cy.on('uncaught:exception', () => {
          // workaround for when ChunkLoadError is thrown at cy.visit in ffox
          return false
        })
        cy.visit(`${orgs}/${id}/dashboards-list`, {
          retryOnStatusCodeFailure: true,
        })
        cy.getByTestID('tree-nav')
      })
    })

    cy.getByTestID('dashboard-card').within(() => {
      cy.getByTestID('dashboard-card--name').first().trigger('mouseover')

      cy.getByTestID('dashboard-card--name-button').first().click()

      cy.get('.cf-input-field').type(newName).type('{enter}')
    })

    cy.getByTestID('dashboard-card').should('contain', newName)

    // Create from header
    cy.getByTestID('add-resource-dropdown--button').click()
    cy.getByTestID('add-resource-dropdown--new').click()

    cy.fixture('routes').then(({orgs}) => {
      cy.get<Organization>('@org').then(({id}: Organization) => {
        cy.on('uncaught:exception', () => {
          // workaround for when ChunkLoadError is thrown at cy.visit in ffox
          return false
        })
        cy.visit(`${orgs}/${id}/dashboards-list`)
        cy.getByTestID('tree-nav')
      })
    })

    cy.getByTestID('dashboard-card').should('have.length', 2)

    const dashboardDescription = 'this dashboard contains secret information'

    // change description
    cy.get(
      '[data-testid=resource-list--editable-description] .cf-resource-description--preview'
    )
      .first()
      .trigger('mouseover')
      .click('topLeft', {force: true})
    cy.get('[placeholder="Describe Name this Dashboard"]')
      .first()
      .type(dashboardDescription)
      .type('{enter}')
    cy.getByTestID('resource-list--editable-description').should(
      'contain',
      dashboardDescription
    )

    // remove description
    cy.get(
      '[data-testid=resource-list--editable-description] .cf-resource-description--preview'
    )
      .first()
      .trigger('mouseover')
      .click('topLeft', {force: true})
    cy.get('[placeholder="Describe Name this Dashboard"]')
      .first()
      .clear()
      .type('{enter}')
    cy.getByTestID('resource-list--editable-description').should(
      'not.contain',
      dashboardDescription
    )

    // Delete dashboards
    cy.getByTestID('dashboard-card')
      .first()
      .trigger('mouseover')
      .within(() => {
        cy.getByTestID('context-delete-menu--button').click()
      })
    cy.getByTestID('context-delete-menu--confirm-button').click()

    cy.getByTestID('dashboard-card')
      .first()
      .trigger('mouseover')
      .within(() => {
        cy.getByTestID('context-delete-menu--button').click()
      })
    cy.getByTestID('context-delete-menu--confirm-button').click()

    cy.getByTestID('empty-dashboards-list').should('exist')
  })

  describe('cloning', () => {
    const localDashName = 'Happy Dashboard'
    const labelName = 'bark'
    const secondLabelName = 'prrr'
    beforeEach(() => {
      cy.writeLPDataFromFile({
        filename: 'data/wumpus01.lp',
        offset: '20m',
        stagger: '1m',
      }).should('equal', 'success')

      cy.get<Organization>('@org').then(({id}: Organization) =>
        cy.createDashboard(id, localDashName).then(({body}) => {
          cy.createAndAddLabel('dashboards', id, body.id, labelName)
          cy.createLabel(secondLabelName, id, {
            description: 'I hate mieces',
            color: '#00ff44',
          })
          cy.createCell(body.id).then(cell1Resp => {
            cy.createMapVariableFromFixture('power_vars', id)
            cy.createView(body.id, cell1Resp.body.id, 'wumpusDurView')
            cy.createCell(body.id, {
              x: 4,
              y: 0,
              height: 8,
              width: 4,
            }).then(cell2Resp => {
              cy.createView(body.id, cell2Resp.body.id, 'sampleNote')
              cy.fixture('routes').then(({orgs}) =>
                cy
                  .get<Organization>('@org', {timeout: 1000})
                  .then(({id}: Organization) => {
                    cy.visit(`${orgs}/${id}/dashboards-list`)
                    cy.getByTestID('tree-nav')
                  })
              )
            })
          })
        })
      )
    })

    it.skip('can clone a dashboard', () => {
      cy.getByTestID('dashboard-card').should('have.length', 1)

      // get graph in original view

      cy.getByTestID('dashboard-card')
        .first()
        .within(() => {
          cy.getByTestID(`label--pill ${labelName}`).should('be.visible')
          cy.getByTestID('dashboard-card--name').click()
        })

      const cloneNamePrefix = `${localDashName} (cloned at `
      cy.getByTestID('nav-item-dashboards').click()

      cy.getByTestID('dashboard-card')
        .first()
        .within(() => {
          cy.getByTestID('context-menu-dashboard').click()
        })

      cy.getByTestID('context-clone-dashboard').click()

      // Verify cloned dashboard contents

      cy.getByTestID('page-title').should('contain.text', cloneNamePrefix)
      cy.getByTestID('variable-dropdown--Power').should('be.visible')
      cy.getByTestID('variable-dropdown-input-typeAhead--Power').should(
        'have.value',
        'base'
      )

      cy.getByTestID('cell--view-empty markdown').should(
        'contain.text',
        'The cat went here and there'
      )

      // Prep verification that changes in clone are not reflected in original,
      // i.e. that they are fully decoupled
      // change variable N.B. final assert is waiting on fix for #3287 see below
      cy.getByTestID('variable-dropdown-input-typeAhead--Power').click()
      cy.getByTestID('variable-dropdown--item').eq(4).click()
      // const viewGraphCopy = makeGraphSnapshot()
      cy.getByTestID('cell Name this Cell').within(() => {
        cy.getByTestID('cell-context--toggle').click()
      })

      const replaceText =
        '### William Blake\n#### Augeries of Innocense\n\n To see a World in a Grain of Sand\n\nAnd a Heaven in a Wild Flower\n\n...`'
      cy.getByTestID('cell-context--note').click()
      cy.getByTestID('markdown-editor')
        .click()
        .type(`{selectAll}{backspace}${replaceText}`)

      cy.getByTestID('save-note--button').click()

      cy.getByTestID('nav-item-dashboards').click()

      // Verify labels
      cy.getByTestID('dashboard-card')
        .eq(1)
        .within(() => {
          cy.getByTestID(`label--pill ${labelName}`).should('be.visible')
          cy.getByTestID('dashboard-card--name').should(
            'contain',
            cloneNamePrefix
          )
          cy.getByTestID('inline-labels--add').click()
        })

      cy.getByTestID(`label--pill ${secondLabelName}`).click()

      cy.getByTestID('dashboard-card')
        .eq(1)
        .within(() => {
          cy.getByTestID(`label--pill ${secondLabelName}`).should('be.visible')
          cy.getByTestID(`label--pill--delete ${labelName}`).click()
          cy.getByTestID(`label--pill ${labelName}`).should('not.exist')
        })

      cy.getByTestID('dashboard-card')
        .first()
        .within(() => {
          cy.getByTestID(`label--pill ${secondLabelName}`).should('not.exist')
          cy.getByTestID(`label--pill ${labelName}`).should('exist')
        })

      // Verify original is decoupled from clone
      cy.getByTestID('dashboard-card')
        .first()
        .within(() => {
          cy.getByTestID('dashboard-card--name').click()
        })

      cy.getByTestID('cell--view-empty markdown').should(
        'contain',
        'The cat went here and there'
      )
    })
  })

  describe('Dashboard List', () => {
    beforeEach(() => {
      cy.get<Organization>('@org').then(({id}: Organization) => {
        cy.createDashboard(id, dashboardName).then(({body}) => {
          cy.createAndAddLabel('dashboards', id, body.id, newLabelName)
          cy.createDashboard(id, dashboardName2).then(({body}) => {
            cy.createAndAddLabel('dashboards', id, body.id, 'bar')
          })
        })
        cy.fixture('routes').then(({orgs}) =>
          cy.get<Organization>('@org').then(({id}: Organization) => {
            cy.visit(`${orgs}/${id}/dashboards-list`)
            return cy.getByTestID('tree-nav')
          })
        )
      })
    })

    it('retains dashboard sort order after navigating away', () => {
      const expectedDashboardOrder = ['test dashboard', 'Bee Happy']

      cy.getByTestID('dashboard-card').should('have.length', 2)

      // change sort order to 'Name (Z → A)'
      cy.getByTestID('resource-sorter--button').click()
      cy.contains('Name (Z → A)').click()
      // assert dashboard order is correct
      cy.get('a[data-testid*="dashboard-card--name"]').each((val, index) => {
        cy.wrap(val).contains(expectedDashboardOrder[index])
      })

      // visit another page
      cy.getByTestID('tree-nav')
      cy.contains('Settings').click({force: true})
      cy.getByTestID('variables--tab').click()
      cy.contains("Looks like there aren't any Variables, why not create one?")
      // return to dashboards page
      cy.contains('Dashboards').click()

      // assert dashboard order remains the same
      cy.get('a[data-testid*="dashboard-card--name"]').each((val, index) => {
        cy.wrap(val).contains(expectedDashboardOrder[index])
      })
    })

    describe('Labeling', () => {
      it('can click to filter dashboard labels', () => {
        cy.getByTestID('dashboard-card').should('have.length', 2)

        cy.getByTestID(`label--pill ${newLabelName}`).click()

        cy.getByTestID('dashboard-card')
          .should('have.length', 1)
          .and('contain', newLabelName)
      })

      it('can delete a label from a dashboard', () => {
        cy.getByTestID('dashboard-card')
          .first()
          .within(() => {
            const pillID = `label--pill ${newLabelName}`

            cy.getByTestID(pillID).should('have.length', 1)

            cy.getByTestID(`label--pill--delete ${newLabelName}`).click({
              force: true,
            })

            cy.getByTestID(pillID).should('have.length', 0)
            cy.getByTestID(`inline-labels--empty`).should('have.length', 1)
          })
      })

      it('clicking a list item adds a label and leaves open the popover with the next item highlighted', () => {
        const labelName = 'clicky'

        cy.get<Organization>('@org').then(({id}: Organization) => {
          cy.createLabel(labelName, id)
          cy.reload()
          cy.getByTestID(`inline-labels--add`).first().click()

          cy.getByTestID(`label--pill ${labelName}`).click()

          cy.getByTestID(`label--pill bar`).should('be.visible')
        })
      })

      it('can add an existing label to a dashboard', () => {
        const labelName = 'swogglez'

        cy.get<Organization>('@org').then(({id}: Organization) => {
          cy.createLabel(labelName, id)
          cy.reload()
          cy.getByTestID(`inline-labels--add`).first().click()

          cy.getByTestID(`label--pill ${labelName}`).click()

          cy.getByTestID('dashboard-card')
            .first()
            .within(() => {
              cy.getByTestID(`label--pill ${labelName}`).should('be.visible')
            })
        })
      })

      it('typing in the input updates the list', () => {
        const labelName = 'banana'

        cy.get<Organization>('@org').then(({id}: Organization) => {
          cy.createLabel(labelName, id)
          cy.reload()
          cy.getByTestID(`inline-labels--add`).first().click()

          cy.getByTestID(`inline-labels--popover-field`).type(labelName)

          cy.getByTestID(`label--pill ${labelName}`).should('be.visible')
          cy.getByTestID('inline-labels--list').should('have.length', 1)
        })
      })

      it('typing a new label name and pressing ENTER starts label creation flow, closes popover', () => {
        const labelName = 'choco'

        cy.getByTestID(`inline-labels--add`).first().click()

        cy.getByTestID('inline-labels--popover--contents').should('be.visible')
        cy.getByTestID(`inline-labels--popover-field`)
          .type(labelName)
          .type('{enter}')
        cy.getByTestID('overlay--body').should('be.visible')
        cy.getByTestID('inline-labels--popover--contents').should('not.exist')
      })

      it('typing a new label name and clicking name starts label creation flow, closes popover', () => {
        // https://github.com/influxdata/influxdb/issues/17964
        const labelName = 'the new new'

        cy.getByTestID(`inline-labels--add`).first().click()

        cy.getByTestID('inline-labels--popover--contents').should('be.visible')

        cy.getByTestID(`inline-labels--popover-field`).type(labelName)

        cy.getByTestID(`inline-labels--create-new`).click()

        cy.getByTestID('overlay--body').should('be.visible')
        cy.getByTestID('inline-labels--popover--contents').should('not.exist')
      })

      it('can create a label and add to a dashboard', () => {
        const label = 'plerps'
        cy.getByTestID(`inline-labels--add`).first().click()

        cy.getByTestID('inline-labels--popover-field').type(label)
        cy.getByTestID('inline-labels--create-new').click()

        cy.getByTestID('overlay--container').within(() => {
          cy.getByTestID('label-overlay-form').should(form => {
            expect(form).to.exist
          })
          cy.getByTestID('create-label-form--name').should('have.value', label)
          cy.getByTestID('create-label-form--submit').click()
        })

        cy.getByTestID('dashboard-card')
          .first()
          .within(() => {
            cy.getByTestID(`label--pill ${label}`).should('be.visible')
          })
      })
    })

    describe('Searching', () => {
      it('can search dashboards by labels', () => {
        cy.getByTestID('dashboard-card').should('have.length', 2)

        cy.getByTestID('search-widget').type(newLabelName)

        cy.getByTestID('dashboard-card').should('have.length', 1)

        cy.getByTestID('dashboard-card')
          .first()
          .get('.cf-label')
          .should('contain', newLabelName)
      })

      it('can search by clicking label', () => {
        const clicked = 'click-me'

        cy.getByTestID('dashboard-card').should('have.length', 2)

        cy.getByTestID(`label--pill ${clicked}`).click()

        cy.getByTestID('search-widget').should('have.value', clicked)

        cy.getByTestID('dashboard-card').should('have.length', 1)
      })

      it('can search by dashboard name', () => {
        cy.getByTestID('search-widget').type(dashSearchName)

        cy.getByTestID('dashboard-card').should('have.length', 1)
        cy.contains(dashboardName)
      })

      it('can persist search term', () => {
        cy.getByTestID('dashboard-card').should('have.length', 2)

        cy.getByTestID('search-widget').type(dashSearchName)

        cy.getByTestID('dashboard-card').should('have.length', 1)

        cy.getByTestID('dashboard-card')
          .first()
          .getByTestID('dashboard-card--name')
          .should('contain', dashboardName)

        // Navigate Away and come back using browser's back button
        cy.getByTestID('dashboard-card')
          .first()
          .getByTestID('dashboard-card--name')
          .click()
        cy.getByTestID('page-title').contains(dashboardName)
        cy.go('back')
        cy.getByTestID('search-widget').should('have.value', dashSearchName)

        // Navigate Away and come back by clicking on Boards icon
        cy.getByTestID('nav-item-data-explorer').click()
        cy.getByTestID('page-title').contains('Data Explorer')
        cy.getByTestID('nav-item-dashboards').click()
        cy.getByTestID('search-widget').should('have.value', dashSearchName)
      })
    })
  })

  it('should redirect to the dashboard list when dashboard not exist', () => {
    const nonexistentID = '0499992503cd3700'

    // visiting the dashboard edit page
    cy.get<Organization>('@org').then(({id}: Organization) => {
      cy.fixture('routes').then(({orgs, dashboards}) => {
        cy.visit(`${orgs}/${id}${dashboards}/${nonexistentID}`)
        cy.url().should('include', `${orgs}/${id}/dashboards-list`)
      })
    })
  })

  before(() =>
    cy.exec('rm cypress/downloads/*', {
      log: true,
      failOnNonZeroExit: false,
    })
  )

  it('creates a dashboard and downloads JSON', () => {
    cy.get<Organization>('@org').then(({id: orgID}: Organization) => {
      cy.createDashboard(orgID).then(({body}) => {
        cy.fixture('routes').then(({orgs}) => {
          cy.visit(`${orgs}/${orgID}/dashboards/${body.id}`)
        })
      })
    })
    cy.getByTestID('nav-item-dashboards').click()
    cy.getByTestID('dashboard-card--name').click()
    cy.getByTestID('page-title').type('dashboard') // dashboard name added to prevent failure due to downloading JSON with a different name
    cy.getByTestID('add-note--button').click()
    cy.getByTestID('note-editor--overlay').should('be.visible')
    cy.getByTestID('markdown-editor').type('test note added')
    cy.getByTestID('save-note--button').click() // note added to add content to be downloaded in the JSON file
    cy.getByTestID('nav-item-dashboards').click()
    cy.getByTestID('dashboard-card').invoke('hover')
  })

  it.skip('changes time range', () => {
    const dashName = 'dashboard'
    const newDate = new Date()
    const now = newDate.toISOString()
    const pastDate = new Date(new Date() - 1000 * 60 * 60 * 2)
    const past = pastDate.toISOString()
    cy.get<Organization>('@org').then(({id}: Organization) =>
      cy.createDashboard(id, dashName).then(({body}) => {
        cy.createCell(body.id).then(cell1Resp =>
          cy.createView(body.id, cell1Resp.body.id).then(() =>
            cy.fixture('routes').then(({orgs}) =>
              cy.get<Organization>('@org').then(({id}: Organization) => {
                cy.visit(`${orgs}/${id}/dashboards-list`)
                cy.getByTestID('tree-nav').then(() =>
                  cy
                    .intercept('POST', '/api/v2/query?*')
                    .as('loadQuery')
                    .then(() =>
                      cy.writeLPData({
                        lines: genCurve({points: 3500, freq: 6, shift: 13}),
                        offset: `${8 * 24 * 60}m`,
                        stagger: `${(8 * 24 * 60) / 3499}m`,
                      })
                    )
                )
              })
            )
          )
        )
      })
    )
    cy.getByTestID('dashboard-card--name').click()
    cy.getByTestID('cell-context--toggle').click()
    cy.getByTestID('cell-context--configure').click()
    cy.getByTestID('page-header').should('be.visible')
    cy.getByTestID('selector-list curve').click()
    cy.getByTestID('selector-list p').click()
    cy.getByTestID('time-machine-submit-button').click()
    cy.getByTestID('save-cell--button').click()
    cy.wait('@loadQuery')
    cy.getByTestID('giraffe-axes').should('be.visible')

    const snapshot = makeGraphSnapshot()

    // fixed time range values
    // past 1m
    cy.getByTestID('timerange-dropdown').click()
    cy.getByTestID('dropdown-item-past1m').click()
    cy.wait('@loadQuery')

    const snapshot2 = makeGraphSnapshot()
    snapshot2.shouldBeSameAs(snapshot, false)

    // past 5m
    cy.getByTestID('timerange-dropdown').click()
    cy.getByTestID('dropdown-item-past5m').click()
    cy.wait('@loadQuery')

    const snapshot3 = makeGraphSnapshot()
    snapshot3.shouldBeSameAs(snapshot2, false)

    // past 1h is set as default value
    cy.getByTestID('timerange-dropdown').click()
    cy.getByTestID('dropdown-item-past1h').click()
    cy.wait('@loadQuery')

    const snapshot1 = makeGraphSnapshot()
    snapshot1.shouldBeSameAs(snapshot, true)

    // past 3h
    cy.getByTestID('timerange-dropdown').click()
    cy.getByTestID('dropdown-item-past3h').click()
    cy.wait('@loadQuery')

    const snapshot5 = makeGraphSnapshot()
    snapshot5.shouldBeSameAs(snapshot1, false)

    // past 6h
    cy.getByTestID('timerange-dropdown').click()
    cy.getByTestID('dropdown-item-past6h').click()
    cy.wait('@loadQuery')

    const snapshot6 = makeGraphSnapshot()
    snapshot6.shouldBeSameAs(snapshot5, false)

    // past 12h
    cy.getByTestID('timerange-dropdown').click()
    cy.getByTestID('dropdown-item-past12h').click()
    cy.wait('@loadQuery')

    const snapshot7 = makeGraphSnapshot()
    snapshot7.shouldBeSameAs(snapshot6, false)

    // past 24h
    cy.getByTestID('timerange-dropdown').click()
    cy.getByTestID('dropdown-item-past24h').click()
    cy.wait('@loadQuery')

    const snapshot8 = makeGraphSnapshot()
    snapshot8.shouldBeSameAs(snapshot7, false)

    // past 2d
    cy.getByTestID('timerange-dropdown').click()
    cy.getByTestID('dropdown-item-past2d').click()
    cy.wait('@loadQuery')

    const snapshot9 = makeGraphSnapshot()
    snapshot9.shouldBeSameAs(snapshot8, false)

    // past 7d
    cy.getByTestID('timerange-dropdown').click()
    cy.getByTestID('dropdown-item-past7d').click()
    cy.wait('@loadQuery')

    const snapshot10 = makeGraphSnapshot()
    snapshot10.shouldBeSameAs(snapshot9, false)

    // past 30d
    cy.getByTestID('timerange-dropdown').click()
    cy.getByTestID('dropdown-item-past30d').click()
    cy.wait('@loadQuery')

    const snapshot11 = makeGraphSnapshot()
    snapshot11.shouldBeSameAs(snapshot10, false)

    // past 15m
    cy.getByTestID('timerange-dropdown').click()
    cy.getByTestID('dropdown-item-past15m').click()
    cy.wait('@loadQuery')

    const snapshot4 = makeGraphSnapshot()
    snapshot4.shouldBeSameAs(snapshot11, false)

    // custom time range value
    cy.getByTestID('timerange-dropdown').click()
    cy.getByTestID('dropdown-item-customtimerange').click()
    cy.getByTestID('timerange-popover--dialog').should('be.visible')

    cy.getByTestID('timerange--input').first().clear().type(past)

    cy.getByTestID('timerange--input').last().clear().type(now)

    cy.getByTestID('daterange--apply-btn').click()
    cy.wait('@loadQuery')

    const snapshot12 = makeGraphSnapshot()
    snapshot12.shouldBeSameAs(snapshot4, false)
  })
})
