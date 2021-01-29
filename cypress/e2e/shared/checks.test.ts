import {Organization} from '../../../src/types'

// a generous commitment to delivering this page in a loaded state
const PAGE_LOAD_SLA = 10000

const measurement = 'my_meas'
const field = 'my_field'
const stringField = 'string_field'
describe('Checks', () => {
  beforeEach(() => {
    cy.flush()

    cy.signin().then(() => {
      // visit the alerting index
      cy.get('@org').then(({id: orgID}: Organization) => {
        cy.writeData([
          `${measurement} ${field}=0,${stringField}="string1"`,
          `${measurement} ${field}=1,${stringField}="string2"`,
        ])
        cy.fixture('routes').then(({orgs, alerting}) => {
          cy.visit(`${orgs}/${orgID}${alerting}`)
        })
      })
    })
    cy.get('[data-testid="resource-list--body"]', {timeout: PAGE_LOAD_SLA})

    // User can only see all panels at once on large screens
    cy.getByTestID('alerting-tab--checks').click({force: true})
  })

  // TODO(watts): resolve flakeyness caused by detached elements with: https://github.com/influxdata/ui/pull/515
  it.skip('can validate a threshold check', () => {
    cy.log('Create threshold check')
    cy.getByTestID('create-check').click()
    cy.getByTestID('create-threshold-check').click()
    // added test to disable group on check query builder
    cy.getByTestID('dropdown--button')
      .should('be.disabled')
      .and('not.contain', 'Group')
      .contains('Filter')
    cy.get<string>('@defaultBucketListSelector').then(
      (defaultBucketListSelector: string) => {
        cy.getByTestID(defaultBucketListSelector)
          .wait(1200)
          .click()

        cy.log(
          'Select measurement and field; assert checklist popover and save button'
        )
        cy.get('.query-checklist--popover').should('be.visible')
        cy.getByTestID('save-cell--button').should('be.disabled')
        cy.getByTestID(`selector-list ${measurement}`).click()
        cy.getByTestID(`selector-list ${field}`).click()
        cy.get('.query-checklist--popover').should('be.visible')
        cy.getByTestID('save-cell--button').should('be.disabled')

        cy.log('Assert "Window Period" placeholder')
        cy.get('.duration-input').within(() => {
          cy.getByTitle('This input is disabled').should(
            'have.value',
            'auto (1m)'
          )
        })

        cy.log(
          'Navigate to "Configure Check" tab; add threshold condition; assert checklist popover and save button'
        )
        cy.getByTestID('checkeo--header alerting-tab').click()
        cy.getByTestID('add-threshold-condition-WARN').click()
        cy.get('.query-checklist--popover').should('not.exist')
        cy.getByTestID('save-cell--button').should('be.enabled')

        cy.log(
          'Change "Schedule Every" parameter and assert its change in "Window Period" placeholder'
        )
        cy.getByTestID('schedule-check')
          .clear()
          .type('135s')
        cy.getByTestID('select-group--option').click()
        cy.get('.duration-input').within(() => {
          cy.getByTitle('This input is disabled').should(
            'have.value',
            'auto (135s)'
          )
        })

        cy.log('Name the check; save')
        cy.getByTestID('overlay--container').within(() => {
          cy.getByTestID('page-title')
            .contains('Name this Check')
            .click()
          cy.getByTestID('renamable-page-title--input')
            .clear()
            .type('Threshold check test{enter}')
        })
        cy.getByTestID('save-cell--button').click()

        cy.log('Assert the check card')
        cy.getByTestID('check-card--name')
          .contains('Threshold check test')
          .should('exist')
      }
    )
  })

  // TODO(watts): resolve flakeyness caused by detached elements with: https://github.com/influxdata/ui/pull/515
  it.skip('can create and filter checks', () => {
    cy.get<string>('@defaultBucketListSelector').then(
      (defaultBucketListSelector: string) => {
        cy.log('create first check')
        cy.getByTestID('create-check').click()
        cy.getByTestID('create-deadman-check').click()

        cy.log('select measurement and field')
        cy.intercept('POST', '/query', req => {
          if (req.body.query.includes('_measurement')) {
            req.alias = 'measurementQuery'
          }
        })
        cy.intercept('POST', '/query', req => {
          if (req.body.query.includes('distinct(column: "_field")')) {
            req.alias = 'fieldQuery'
          }
        })

        cy.getByTestID(defaultBucketListSelector).click()
        cy.wait('@measurementQuery')
        cy.getByTestID(`selector-list ${measurement}`).should('be.visible')
        cy.getByTestID(`selector-list ${measurement}`).click()
        cy.wait('@fieldQuery')
        cy.getByTestID(`selector-list ${field}`).should('be.visible')
        cy.getByTestID(`selector-list ${field}`).click()

        cy.log('name the check; save')
        cy.getByTestID('overlay').within(() => {
          cy.getByTestID('page-title')
            .contains('Name this Check')
            .click()
          cy.getByTestID('renamable-page-title--input')
            .clear()
            .type('Alpha{enter}')
        })
        cy.getByTestID('save-cell--button').click()

        cy.getByTestID('overlay').should('not.exist')
        // bust the /query cache
        cy.reload()
        cy.intercept('POST', '/query', req => {
          if (req.body.query.includes('_measurement')) {
            req.alias = 'measurementQueryBeta'
          }
        })
        cy.intercept('POST', '/query', req => {
          if (req.body.query.includes('distinct(column: "_field")')) {
            req.alias = 'fieldQueryBeta'
          }
        })

        cy.log('create second check')
        cy.getByTestID('create-check').click()
        cy.getByTestID('create-deadman-check').click()

        cy.log('select measurement and field')
        cy.getByTestID(defaultBucketListSelector).should('be.visible')
        cy.getByTestID(defaultBucketListSelector).click()
        cy.wait('@measurementQueryBeta')
        cy.getByTestID(`selector-list ${measurement}`).should('be.visible')
        cy.getByTestID(`selector-list ${measurement}`).click()
        cy.wait('@fieldQueryBeta')
        cy.getByTestID(`selector-list ${field}`).should('be.visible')
        cy.getByTestID(`selector-list ${field}`).click()

        cy.log('name the check; save')
        cy.getByTestID('overlay').within(() => {
          cy.getByTestID('page-title')
            .contains('Name this Check')
            .click()
          cy.getByTestID('renamable-page-title--input')
            .clear()
            .type('Beta{enter}')
        })
        cy.getByTestID('save-cell--button').click()

        cy.log('assert the number of check cards')
        cy.getByTestID('check-card').should('have.length', 2)

        cy.log('filter checks')
        cy.getByTestID('filter--input checks').type('Al')
        cy.getByTestID('check-card--name')
          .contains('Alpha')
          .should('be.visible')
        cy.getByTestID('check-card').should('have.length', 1)

        cy.log('clear filter and assert the number of check cards again')
        cy.getByTestID('filter--input checks').clear()
        cy.getByTestID('check-card').should('have.length', 2)
      }
    )
  })

  it('can validate a deadman check', () => {
    cy.get<string>('@defaultBucketListSelector').then(
      (defaultBucketListSelector: string) => {
        // create deadman check
        cy.getByTestID('create-check').click()
        cy.getByTestID('create-deadman-check').click()

        // checklist popover and save button check
        cy.get('.query-checklist--popover').should('be.visible')
        cy.getByTestID('save-cell--button').should('be.disabled')

        // select measurement and field - checklist popover should disappear, save button should activate
        cy.getByTestID(defaultBucketListSelector).click()
        cy.getByTestID(`selector-list ${measurement}`).click()
        cy.getByTestID('save-cell--button').should('be.disabled')
        cy.getByTestID(`selector-list ${field}`).click()
        cy.get('.query-checklist--popover').should('not.exist')
        cy.getByTestID('save-cell--button').should('be.enabled')

        // submit the graph
        cy.getByTestID('empty-graph--no-queries')
        cy.getByTestID('time-machine-submit-button').click()
        cy.getByTestID('giraffe-axes').should('exist')

        // navigate to configure check tab
        cy.getByTestID('checkeo--header alerting-tab').click()

        // conditions inputs check
        cy.getByTestID('builder-conditions')
          .should('contain', 'Deadman')
          .within(() => {
            cy.getByTestID('duration-input')
              .first()
              .click()
            cy.get('.duration-input--menu').should('exist')
            cy.getByTestID('duration-input')
              .first()
              .clear()
              .type('60s')

            cy.getByTestID('builder-card--header').click()
            cy.get('.duration-input--menu').should('not.exist')

            cy.getByTestID('duration-input')
              .last()
              .click()
            cy.get('.duration-input--menu').should('exist')
            cy.getByTestID('duration-input')
              .last()
              .clear()
              .type('660s')
            cy.getByTestID('builder-card--header').click()
            cy.get('.duration-input--menu').should('not.exist')

            cy.getByTestID('check-levels--dropdown--button').click()
            cy.getByTestID('dropdown-menu')
              .should('be.visible')
              .within(() => {
                cy.getByTestID('check-levels--dropdown-item OK').click()
              })
            cy.get('.color-dropdown--name').should('have.text', 'OK')
          })

        // name the check; save
        cy.getByTestID('overlay').within(() => {
          cy.getByTestID('page-title')
            .contains('Name this Check')
            .click()
          cy.getByTestID('renamable-page-title--input')
            .clear()
            .type('Deadman check test{enter}')
        })

        cy.getByTestID('save-cell--button').click()

        // assert the check card
        cy.getByTestID('check-card--name')
          .contains('Deadman check test')
          .should('exist')
      }
    )
  })

  it('checks only allow numeric fields', () => {
    cy.get<string>('@defaultBucketListSelector').then(
      (defaultBucketListSelector: string) => {
        // create deadman check
        cy.getByTestID('create-check').click()
        cy.getByTestID('create-deadman-check').click()

        // checklist popover and save button check
        cy.get('.query-checklist--popover').should('be.visible')
        cy.getByTestID('save-cell--button').should('be.disabled')

        // select measurement and field - checklist popover should disappear, save button should activate
        cy.getByTestID(defaultBucketListSelector).click()
        cy.getByTestID(`selector-list ${measurement}`).click()
        cy.getByTestID('save-cell--button').should('be.disabled')
        cy.getByTestID(`selector-list ${stringField}`).click()
        cy.get('.query-checklist--popover').should('not.exist')
        cy.getByTestID('save-cell--button').should('be.enabled')

        // submit the graph
        cy.getByTestID('empty-graph--no-queries')
        cy.getByTestID('time-machine-submit-button').click()

        // check for error message
        cy.getByTestID('empty-graph--numeric').should('exist')
      }
    )
  })

  describe('When a check does not exist', () => {
    it('should route the user to the alerting index page', () => {
      const nonexistentID = '046cd86a2030f000'

      // visiting the check edit overlay
      cy.get('@org').then(({id}: Organization) => {
        cy.fixture('routes').then(({orgs, alerting, checks}) => {
          cy.visit(`${orgs}/${id}${alerting}${checks}/${nonexistentID}/edit`)

          cy.url().should('include', `${orgs}/${id}${alerting}`)
        })
      })
    })
  })

  describe('Check should be viewable once created', () => {
    beforeEach(() => {
      cy.get<string>('@defaultBucketListSelector').then(
        (defaultBucketListSelector: string) => {
          // creates a check before each iteration
          // TODO: refactor into a request
          cy.getByTestID('create-check').click()
          cy.getByTestID('create-threshold-check').click()
          cy.getByTestID(defaultBucketListSelector)
            .wait(1200)
            .click()
          cy.getByTestID(`selector-list ${measurement}`).click()
          cy.getByTestID('save-cell--button').should('be.disabled')
          cy.getByTestID(`selector-list ${field}`).click()
          cy.getByTestID('save-cell--button').should('be.disabled')
          cy.getByTestID('checkeo--header alerting-tab').click()
          cy.getByTestID('add-threshold-condition-WARN').click()
          cy.getByTestID('input-field-WARN')
            .clear()
            .type('5s')
          cy.getByTestID('add-threshold-condition-CRIT').click()
          cy.getByTestID('input-field-CRIT')
            .clear()
            .type('0')
          cy.getByTestID('save-cell--button').click()
          cy.getByTestID('check-card').should('have.length', 1)
          cy.getByTestID('notification-error').should('not.exist')
        }
      )
    })

    it('after check creation confirm history page has graph', () => {
      cy.getByTestID('context-history-menu').click()
      cy.getByTestID('context-history-task').click()
      cy.getByTestID('giraffe-axes').should('be.visible')

      // Clicking the check status input results in dropdown and clicking outside removes dropdown
      cy.getByTestID('check-status-input').click()
      cy.getByTestID('check-status-dropdown').should('be.visible')
      cy.getByTestID('alert-history-title').click()
      cy.getByTestID('check-status-dropdown').should('not.exist')

      // Minimize the graph by dragging
      cy.get('.threshold-marker--area.threshold-marker--crit')
        .trigger('mousedown', {which: 1, pageX: 600, pageY: 100})
        .trigger('mousemove', {which: 1, pageX: 700, pageY: 100})
        .trigger('mouseup', {force: true})
    })

    it('accepts keyboard tabs as navigation', () => {
      // have to make the viewport huge to get it not to switch to tablet size
      cy.viewport(1800, 980)

      cy.get('body').tab()
      cy.getByTestID('filter--input checks').should('have.focus')

      cy.focused()
        .tab()
        .tab()
      cy.getByTestID('filter--input endpoints').should('have.focus')

      cy.focused().tab()
      cy.getByTestID('filter--input rules').should('have.focus')
    })

    it('should allow created checks to be selected and routed to the edit page', () => {
      cy.getByTestID('check-card--name').should('have.length', 1)
      cy.getByTestID('check-card--name').click()
      cy.get('@org').then(({id}: Organization) => {
        cy.fixture('routes').then(({orgs, alerting, checks}) => {
          cy.url().then(url => {
            Cypress.minimatch(
              url,
              `
                *${orgs}/${id}${alerting}${checks}/*/edit
              `
            )
          })
        })
      })
    })

    it('should allow created checks edited checks to persist changes (especially if the value is 0)', () => {
      const checkName = 'Check it out!'
      // Selects the check to edit
      cy.getByTestID('check-card--name').should('have.length', 1)
      cy.getByTestID('check-card--name').click()
      // ensures that the check WARN value is set to 0
      cy.getByTestID('input-field-WARN')
        .should('have.value', '5')
        .clear()
        .type('0')
      // renames the check
      cy.getByTestID('page-title')
        .contains('Name this Check')
        .type(checkName)
      cy.getByTestID('save-cell--button').click()
      // checks that the values persisted
      cy.getByTestID('check-card--name').contains(checkName)
    })

    it('can edit the check card', () => {
      // toggle on / off
      cy.get('.cf-resource-card__disabled').should('not.exist')
      cy.getByTestID('check-card--slide-toggle').click()
      cy.getByTestID('notification-error').should('not.exist')
      cy.get('.cf-resource-card__disabled').should('exist')
      cy.getByTestID('check-card--slide-toggle').click()
      cy.getByTestID('notification-error').should('not.exist')
      cy.get('.cf-resource-card__disabled').should('not.exist')

      // last run status
      cy.getByTestID('last-run-status--icon').should('exist')
      cy.getByTestID('last-run-status--icon').trigger('mouseover')
      cy.getByTestID('popover--dialog')
        .should('exist')
        .contains('Last Run Status:')
        // Need to trigger mouseout else the popover obscures the other buttons
        .trigger('mouseout')

      // create a label
      cy.getByTestID('check-card').within(() => {
        cy.getByTestID('inline-labels--add').click()
      })

      const labelName = 'l1'
      cy.getByTestID('inline-labels--popover--contents').type(labelName)
      cy.getByTestID('inline-labels--create-new').click()
      cy.getByTestID('create-label-form--submit').click()

      // delete the label
      cy.getByTestID(`label--pill--delete ${labelName}`).click({force: true})
      cy.getByTestID('inline-labels--empty').should('exist')
    })
  })
})
