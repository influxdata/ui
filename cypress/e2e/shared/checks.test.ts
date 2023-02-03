import {GenCheck, Organization} from '../../../src/types'
import {Bucket} from '../../../src/client'
import {calcNanoTimestamp} from '../../support/Utils'

// a generous commitment to delivering this page in a loaded state
const PAGE_LOAD_SLA = 10000

const measurement = 'my_meas'
const field = 'my_field'
const stringField = 'string_field'

const isIOxOrg = Boolean(Cypress.env('useIox'))
const isTSMOrg = !isIOxOrg

const setupTest = (shouldShowAlerts: boolean = true) => {
  cy.flush()
  cy.signin()
  cy.setFeatureFlags({showAlertsInNewIOx: shouldShowAlerts})

  cy.writeData([
    `${measurement} ${field}=0,${stringField}="string1"`,
    `${measurement} ${field}=1,${stringField}="string2"`,
  ])
  // visit the alerting index
  cy.get<Organization>('@org').then((org: Organization) => {
    cy.fixture('routes').then(({orgs, alerting}) => {
      cy.visit(`${orgs}/${org.id}${alerting}`)
    })
  })
  if (isTSMOrg) {
    cy.getByTestID('tree-nav')
    cy.get('[data-testid="resource-list--body"]', {
      timeout: PAGE_LOAD_SLA,
    })
    // User can only see all panels at once on large screens
    cy.getByTestID('alerting-tab--checks').click({force: true})
  }
}

describe('Checks - TSM', () => {
  beforeEach(() => {
    setupTest()
  })

  describe('threshold checks', () => {
    it('can validate a threshold check', () => {
      cy.intercept('POST', '/api/v2/query?*', req => {
        if (req.body.query.includes('_measurement')) {
          req.alias = 'measurementQuery'
        }
      })
      cy.intercept('POST', '/api/v2/query?*', req => {
        if (req.body.query.includes('_field')) {
          req.alias = 'fieldQuery'
        }
      })

      cy.log('Create threshold check')
      cy.getByTestID('create-check').click()
      cy.getByTestID('create-threshold-check').click()
      // added test to disable group on check query builder
      cy.getByTestID('dropdown--button')
        .should('be.disabled')
        .and('not.contain', 'Group')
        .contains('Filter')
      cy.getByTestID('overlay--children').should('be.visible')
      cy.get<string>('@defaultBucketListSelector').then(
        (defaultBucketListSelector: string) => {
          cy.getByTestID(defaultBucketListSelector).click()

          cy.log(
            'Select measurement and field; assert checklist popover and save button'
          )
          cy.get('.query-checklist--popover').should('be.visible')
          cy.getByTestID('save-cell--button').should('be.disabled')
          cy.wait('@measurementQuery')
          cy.getByTestID(`selector-list ${measurement}`).click()
          cy.wait('@fieldQuery')
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
          cy.getByTestID('schedule-check').clear().type('135s')
          cy.getByTestID('select-group--option').click()
          cy.get('.duration-input').within(() => {
            cy.getByTitle('This input is disabled').should(
              'have.value',
              'auto (135s)'
            )
          })

          cy.log('Name the check; save')
          cy.getByTestID('overlay--children').within(() => {
            cy.getByTestID('page-title').contains('Name this Check').click()
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

    it('can reconfigure a threshold check', () => {
      const every = '5m'
      const offset = '1m'
      const testTags: {key: string; value: string}[] = [
        {key: 'Prima', value: 'Smith'},
        {key: 'Astaire', value: 'Rodgers'},
        {key: 'Gable', value: 'Lombard'},
      ]
      const newMsg =
        'Just a message from ${r._check_name} whoa level is ${r._level} ' +
        'for type ${r._type} and ${r._source_measurement} ' +
        'where foo is ${r.foo}'

      // TODO use negative value after #3399 is resolved
      // https://github.com/influxdata/ui/issues/3399
      // const rangeBtm = "-0.01"
      const rangeBtm = '0.01'
      const rangeTop = '7.28'

      initCheck(thresholdCheck).then(resp => {
        expect(resp.name).to.equal(thresholdCheck.name)
      })
      cy.reload()
      cy.intercept('PUT', '**/checks/*').as('putCheck')
      cy.getByTestID('check-card--name').eq(0).click()
      cy.getByTestID('overlay').should('be.visible')
      // Properties
      // Scheduler properties
      cy.getByTestID('schedule-check').click()
      cy.getByTestID('dropdown-menu--contents').within(() => {
        cy.contains('5m').click()
      })
      cy.getByTestID('offset-options').click()
      cy.getByTestID('dropdown-menu--contents').within(() => {
        cy.contains('1m').click()
      })
      // Tags

      testTags.forEach((tag, index) => {
        cy.getByTestID('dashed-button').click()
        cy.getByTestID('tag-rule-key--input').eq(index).type(tag.key)
        cy.getByTestID('tag-rule-value--input').eq(index).type(tag.value)
      })

      // Status Message Template

      cy.getByTestID('status-message-textarea')
        .clear()
        .type(newMsg, {parseSpecialCharSequences: false})

      // Thresholds
      // remove one threshold
      cy.getByTestID('panel-OK').within(() => {
        cy.getByTestID('add-threshold-condition-OK').should('not.exist')
        cy.getByTestID('dismiss-button').click()
      })
      cy.getByTestID('add-threshold-condition-OK').should('be.visible')

      // change logic of one threshold
      cy.getByTestID('panel-INFO').within(() => {
        cy.getByTestID('dropdown--button')
          .should('contain.text', 'is above')
          .click()
        cy.getByTestID('dropdown-menu--contents').within(() => {
          cy.contains('is inside range').click()
        })
        cy.getByTestID('input-field')
          .should('have.length', 2)
          .eq(0)
          .clear()
          // seem to be encountering cypress issue here https://github.com/cypress-io/cypress/issues/3817
          .type(` ${rangeBtm}{del}`) // workaround
        cy.getByTestID('input-field').eq(0).should('have.value', rangeBtm)
        cy.getByTestID('input-field')
          .eq(1)
          .clear()
          // seem to be encountering cypress issue here https://github.com/cypress-io/cypress/issues/3817
          .type(` ${rangeTop}{del}`) // workaround
        cy.getByTestID('input-field').eq(1).should('have.value', rangeTop)
      })
      // change value of one threshold
      cy.getByTestID('panel-WARN').within(() => {
        cy.getByTestID('input-field-WARN')
          .clear()
          // seem to be encountering cypress issue here https://github.com/cypress-io/cypress/issues/3817
          .type(` ${rangeTop}{del}`) // workaround
      })
      cy.getByTestID('save-cell--button').click()
      cy.wait('@putCheck').then(({response}) => {
        if (!response) {
          fail('No response after update check')
        }
        expect(response.body.tags).to.deep.equal(testTags)
        expect(response.body.every).to.equal(every)
        expect(response.body.offset).to.equal(offset)
        expect(response.body.statusMessageTemplate).to.equal(newMsg)
        expect(
          response.body.thresholds.filter((th: any) => th.level === 'INFO')[0]
            .min
        ).to.equal(parseFloat(rangeBtm))
        expect(
          response.body.thresholds.filter((th: any) => th.level === 'INFO')[0]
            .max
        ).to.equal(parseFloat(rangeTop))
        expect(
          response.body.thresholds.filter((th: any) => th.level === 'WARN')[0]
            .value
        ).to.equal(parseFloat(rangeTop))
      })
    })
  })

  it('can create and filter checks', () => {
    cy.get<Organization>('@org').then(({id: orgID}: Organization) => {
      cy.intercept(
        'POST',
        `/api/v2/query?${new URLSearchParams({orgID})}`,
        req => {
          if (req.body.query.includes('_measurement')) {
            req.alias = 'measurementQuery'
          }
        }
      )
      cy.intercept(
        'POST',
        `/api/v2/query?${new URLSearchParams({orgID})}`,
        req => {
          if (req.body.query.includes('distinct(column: "_field")')) {
            req.alias = 'fieldQuery'
          }
        }
      )
      cy.get<string>('@defaultBucketListSelector').then(
        (defaultBucketListSelector: string) => {
          cy.log('create first check')
          cy.getByTestID('create-check').click()
          cy.getByTestID('create-deadman-check').click()

          cy.log('select measurement and field')

          cy.getByTestID(defaultBucketListSelector).click()
          cy.wait('@measurementQuery')
          cy.getByTestID(`selector-list ${measurement}`).should('be.visible')
          cy.getByTestID(`selector-list ${measurement}`).click()
          cy.wait('@fieldQuery')
          cy.getByTestID(`selector-list ${field}`).should('be.visible')
          cy.getByTestID(`selector-list ${field}`).click()

          cy.log('name the check; save')
          cy.getByTestID('overlay').within(() => {
            cy.getByTestID('page-title').contains('Name this Check').click()
            cy.getByTestID('renamable-page-title--input')
              .clear()
              .type('Alpha{enter}')
          })
          cy.getByTestID('save-cell--button').click()

          cy.getByTestID('overlay').should('not.exist')

          // create a second check
          cy.intercept(
            'POST',
            `/api/v2/query?${new URLSearchParams({orgID})}`,
            req => {
              if (req.body.query.includes('distinct(column: "_field")')) {
                req.alias = 'fieldQueryBeta'
              }
            }
          )
          cy.intercept(
            'POST',
            `/api/v2/query?${new URLSearchParams({orgID})}`,
            req => {
              if (req.body.query.includes('_measurement')) {
                req.alias = 'measurementQueryBeta'
              }
            }
          )
          // bust the /query cache
          cy.reload()

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
            cy.getByTestID('page-title').contains('Name this Check').click()
            cy.getByTestID('renamable-page-title--input')
              .clear()
              .type('Beta{enter}')
          })
          cy.getByTestID('save-cell--button').click()

          cy.log('assert the number of check cards')
          cy.getByTestIDHead('check-card ').should('have.length', 2)

          cy.log('filter checks')
          cy.getByTestID('filter--input checks').type('Al')
          cy.getByTestID('check-card--name')
            .contains('Alpha')
            .should('be.visible')
          cy.getByTestIDHead('check-card ').should('have.length', 1)

          cy.log('clear filter and assert the number of check cards again')
          cy.getByTestID('filter--input checks').clear()
          cy.getByTestIDHead('check-card ').should('have.length', 2)
        }
      )
    })
  })

  describe('deadman checks', () => {
    it('can validate a deadman check', () => {
      cy.intercept('POST', '/api/v2/query?*', req => {
        if (req.body.query.includes('_measurement')) {
          req.alias = 'measurementQuery'
        }
      })
      cy.intercept('POST', '/api/v2/query?*', req => {
        if (req.body.query.includes('distinct(column: "_field")')) {
          req.alias = 'fieldQuery'
        }
      })

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
          cy.wait('@measurementQuery')
          cy.getByTestID(`selector-list ${measurement}`).click()
          cy.getByTestID('save-cell--button').should('be.disabled')
          cy.wait('@fieldQuery')
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
              cy.getByTestID('duration-input--for').click()
              cy.get('.duration-input--menu').should('exist')
              cy.getByTestID('duration-input--for').clear().type('60s')

              cy.getByTestID('builder-card--header').click()
              cy.get('.duration-input--menu').should('not.exist')

              cy.getByTestID('duration-input--stop').click()
              cy.get('.duration-input--menu').should('exist')
              cy.getByTestID('duration-input--stop').clear().type('660s')
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
            cy.getByTestID('page-title').contains('Name this Check').click()
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

    it('deadman checks should render a table for non-numeric fields', () => {
      cy.isIoxOrg().then(isIox => {
        // iox uses `${orgId}_${bucketId}` for a namespace_id
        // And gives a namespace_id failure if no data is written yet.
        // https://github.com/influxdata/monitor-ci/issues/402#issuecomment-1362368473
        cy.skipOn(isIox)
      })

      cy.intercept('POST', '/api/v2/query?*', req => {
        if (req.body.query.includes('_measurement')) {
          req.alias = 'measurementQuery'
        }
      })

      cy.get<string>('@defaultBucketListSelector').then(
        (defaultBucketListSelector: string) => {
          cy.intercept('POST', '/api/v2/query?*').as('query')

          // create deadman check
          cy.getByTestID('create-check').click()
          cy.getByTestID('create-deadman-check').click()

          // checklist popover and save button check
          cy.get('.query-checklist--popover').should('be.visible')
          cy.getByTestID('save-cell--button').should('be.disabled')

          // select measurement and field - checklist popover should disappear, save button should activate
          cy.getByTestID(defaultBucketListSelector).click()
          cy.wait('@measurementQuery')
          cy.getByTestID(`selector-list ${measurement}`).click()
          cy.getByTestID('save-cell--button').should('be.disabled')
          cy.getByTestID(`selector-list ${stringField}`).click()
          cy.get('.query-checklist--popover').should('not.exist')
          cy.getByTestID('save-cell--button').should('be.enabled')

          // submit the graph
          cy.getByTestID('empty-graph--no-queries')
          cy.getByTestID('time-machine-submit-button').click()

          cy.wait('@query').its('response.statusCode').should('eq', 200)
          // check for table
          cy.getByTestID('simple-table').should('exist')
          cy.getByTestID('raw-data--toggle').should('not.exist')

          // change field to numeric value
          cy.getByTestID(`selector-list ${field}`).click()
          cy.get('.query-checklist--popover').should('not.exist')
          cy.getByTestID('save-cell--button').should('be.enabled')

          // submit the graph
          cy.getByTestID('time-machine-submit-button').click()

          // make sure the plot is visible
          cy.getByTestID('giraffe-inner-plot').should('be.visible')

          // change back to string field
          cy.getByTestID(`selector-list ${stringField}`).click()

          // save the check
          cy.getByTestID('save-cell--button').click()

          // go to the history page
          cy.getByTestID('context-menu-task').click({force: true})
          cy.getByTestID('context-history-task').click({force: true})

          // make sure table is present
          cy.getByTestID('simple-table').should('exist')
        }
      )
    })

    it('can reconfigure a deadman check', () => {
      const tmSinceClick = '1h'
      const tmSinceText = '10m'
      const tmStaleClick = '24h'
      const tmStaleText = '90m'
      const newLevel = 'WARN'

      initCheck(deadmanCheck).then(resp => {
        expect(resp.name).to.equal(deadmanCheck.name)
      })

      cy.reload()
      cy.intercept('PUT', '**/checks/*').as('putCheck')
      cy.getByTestID('check-card--name').eq(0).click()
      cy.getByTestID('overlay').should('be.visible')

      // Tags, properties and message already covered in threshold check
      // Just modify alert criteria by clicking
      cy.getByTestID('duration-input--for').click()
      cy.getByTestID('dropdown-menu--contents').within(() => {
        cy.contains(tmSinceClick).click()
      })

      cy.getByTestID('check-levels--dropdown--button').click()
      cy.getByTestID(`check-levels--dropdown-item ${newLevel}`).click()

      cy.getByTestID('duration-input--stop').click()
      cy.getByTestID('dropdown-menu--contents').within(() => {
        cy.contains(tmStaleClick).click()
      })

      cy.getByTestID('save-cell--button').click()

      cy.wait('@putCheck').then(({response}) => {
        if (response) {
          expect(response.body.timeSince).to.equal(tmSinceClick)
          expect(response.body.staleTime).to.equal(tmStaleClick)
          expect(response.body.level).to.equal(newLevel)
        } else {
          fail('no response on save check')
        }
      })

      // Now modify criteria by typing
      cy.getByTestID('check-card--name').eq(0).click()
      cy.getByTestID('overlay').should('be.visible')

      cy.getByTestID('duration-input--for').clear().type(tmSinceText)

      cy.getByTestID('duration-input--stop').clear().type(tmStaleText)

      cy.getByTestID('save-cell--button').click()

      cy.wait('@putCheck').then(({response}) => {
        if (response) {
          expect(response.body.timeSince).to.equal(tmSinceText)
          expect(response.body.staleTime).to.equal(tmStaleText)
        } else {
          fail('no response on save check')
        }
      })
    })
  })

  describe('When a check does not exist', () => {
    it('should route the user to the alerting index page', () => {
      const nonexistentID = '046cd86a2030f000'

      // visiting the check edit overlay
      cy.get<Organization>('@org').then(({id}: Organization) => {
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
          cy.getByTestID(defaultBucketListSelector).wait(1200).click()
          cy.getByTestID(`selector-list ${measurement}`).click()
          cy.getByTestID('save-cell--button').should('be.disabled')
          cy.getByTestID(`selector-list ${field}`).click()
          cy.getByTestID('save-cell--button').should('be.disabled')
          cy.getByTestID('checkeo--header alerting-tab').click()
          cy.getByTestID('add-threshold-condition-WARN').click()
          cy.getByTestID('input-field-WARN').clear().type('5s')
          cy.getByTestID('add-threshold-condition-CRIT').click()
          cy.getByTestID('input-field-CRIT').clear().type('0')
          cy.getByTestID('save-cell--button').click()
          cy.getByTestIDHead('check-card ').should('have.length', 1)
          cy.getByTestID('notification-error').should('not.exist')
        }
      )
    })

    it('ensures the history page has a graph after check creation confirmation', () => {
      cy.isIoxOrg().then(isIox => {
        // iox uses `${orgId}_${bucketId}` for a namespace_id
        // And gives a namespace_id failure if no data is written yet.
        // https://github.com/influxdata/monitor-ci/issues/402#issuecomment-1362368473
        cy.skipOn(isIox)
      })

      cy.getByTestID('context-menu-task').click()
      cy.getByTestID('context-history-task').click()
      cy.getByTestID('giraffe-axes').should('be.visible')

      // Clicking the check status input results in dropdown and clicking outside removes dropdown
      cy.getByTestID('check-status-input').click()
      cy.getByTestID('check-status-dropdown').should('be.visible')
      cy.getByTestID('alert-history-title').click()
      cy.getByTestID('check-status-dropdown').should('not.exist')

      // Minimize the graph by dragging
      cy.get('.threshold-marker--handle.threshold-marker--crit')
        .trigger('mousedown', {which: 1, pageX: 600, pageY: 100})
        .trigger('mousemove', {which: 1, pageX: 700, pageY: 100})
        .trigger('mouseup', {force: true})
    })

    describe('test tabbing behavior with small screen', () => {
      beforeEach(() => {
        // have to make the viewport small to use tablet size
        cy.viewport(1200, 980)
        cy.getByTestID('select-group').should('be.visible')
      })
      it('accepts keyboard tabs as navigation', () => {
        // chrome and firefox handle focusing after btn clicks differently.
        // It doesn't affect the UX to the user, but does affect testing.
        // https://zellwk.com/blog/inconsistent-button-behavior/
        if (Cypress.browser.name === 'firefox') {
          cy.get('body').tab()

          cy.getByTestID('filter--input checks').should('have.focus')

          cy.getByTestID('alerting-tab--endpoints').click().focus()
          cy.get('body').tab()
          cy.getByTestID('filter--input endpoints').should('have.focus')

          cy.getByTestID('alerting-tab--rules').click().focus()
          cy.get('body').tab()
          cy.getByTestID('filter--input rules').should('have.focus')
        } else {
          cy.get('body').tab().tab()

          cy.getByTestID('filter--input checks').should('have.focus')

          cy.getByTestID('alerting-tab--endpoints').click().focus()
          cy.focused().tab()
          cy.getByTestID('filter--input endpoints').should('have.focus')

          cy.getByTestID('alerting-tab--rules').click().focus()
          cy.focused().tab()
          cy.getByTestID('filter--input rules').should('have.focus')
        }
      })
    })

    it('should allow created checks to be selected and routed to the edit page', () => {
      cy.getByTestID('check-card--name').should('have.length', 1)
      cy.getByTestID('check-card--name').click()
      cy.get<Organization>('@org').then(({id}: Organization) => {
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

    it('should allow edited checks to persist changes (especially if the value is 0)', () => {
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
      cy.getByTestID('page-title').contains('Name this Check').type(checkName)
      cy.getByTestID('save-cell--button').click()
      // checks that the values persisted
      cy.getByTestID('check-card--name').contains(checkName)
    })

    it('can edit the check card', () => {
      const newDescription =
        "The protagonist of Fyodor Dostoevsky's 1869 novel The Idiot."
      const newName = 'Prince Myshkin'

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

      // implicitly verify id value while setting up intercept
      cy.getByTestID('copy-resource-id').then(elem => {
        const checkID = elem.text().replace(/^\D+/g, '').substring(0, 16)
        return cy
          .intercept('PATCH', `/api/v2/checks/${checkID}*`)
          .as('patchCheck')
      })

      // edit the name
      cy.getByTestID('check-card--name-button').click()
      cy.getByTestID('check-card--input')
        .clear()
        .type(newName + '{enter}')

      cy.wait('@patchCheck').then(({response}) => {
        if (response) {
          expect(response.body.name).to.equal(newName)
        } else {
          fail('no response from patch name call')
        }
      })

      // verify last completed and last updated
      cy.getByTestID('resource-list--meta').within(() => {
        cy.contains('Last completed').then((elem: any) => {
          const now = new Date()
          const text = elem.text()
          const cdate = new Date(text.replace(/^\D+/g, ''))
          // assert last completed value timestamp is sane
          expect(now.getTime() - cdate.getTime())
            .to.be.at.least(0)
            .and.to.be.below(Cypress.config('requestTimeout'))
        })
        cy.contains('Last updated').then((elem: any) => {
          const interval = parseInt(elem.text().replace(/\D+/g, ''))
          // assert last update value is sane
          expect(interval)
            .to.be.at.least(0)
            .and.to.be.at.most(Cypress.config('requestTimeout') / 1000)
        })
      })

      cy.getByTestID('check-card--name').should('have.text', newName)

      // edit the description
      cy.getByTestID('resource-list--editable-description')
        .click()
        .within(() => {
          cy.getByTestID('input-field')
            .clear()
            .type(newDescription + `{enter}`)
          cy.wait('@patchCheck').then(({response}) => {
            if (response) {
              expect(response.body.description).to.equal(newDescription)
            } else {
              fail('no response from patch description call')
            }
          })
        })

      cy.getByTestID('resource-list--editable-description').should(
        'have.text',
        newDescription
      )

      // copy task id to clipboard
      cy.window().then(win => {
        cy.stub(win, 'prompt').returns('DISABLED WINDOW PROMPT') // disable pop-up prompt
      })

      // verify copy task id to clipboard notification
      // NB. since cypress.click event is javascript generated and untrusted
      // calling navigator.clipboard or document.execCommand('copy') are
      // blocked in automated tests without native calls.
      // So for now just assert a notification with the correct ID was fired
      // even if the notification is failure to copy
      cy.getByTestID('copy-task-id').then(elem => {
        const taskID = elem.text().replace(/^\D+/g, '').substring(0, 16)
        elem.click()
        cy.getByTestIDHead('notification-').should('contain', taskID)
      })

      // create a label
      cy.getByTestID(`check-card ${newName}`).within(() => {
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

  describe('External links', () => {
    it('can assert the link on the checks page points to "Create checks" article in documentation ', () => {
      cy.getByTestID('Checks--question-mark').trigger('mouseover')
      cy.getByTestID('Checks--question-mark--tooltip--contents')
        .should('be.visible')
        .within(() => {
          cy.get('a').then($a => {
            const url = $a.prop('href')
            cy.request(url)
              .its('body')
              .should(
                'match',
                /https:\/\/docs\.influxdata\.com\/influxdb\/.+?\/monitor-alert\/checks\/create\//i
              )
          })
        })
    })
  })

  const deadmanCheck: GenCheck = {
    type: 'deadman',
    name: 'Ghost Check',
    status: 'active',
    orgID: '',
    query: {
      name: '',
      text: `from(bucket: \"%BUCKETNAME%\")\n  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)\n  |> filter(fn: (r) => r[\"_measurement\"] == \"wumpus\")\n  |> filter(fn: (r) => r[\"_field\"] == \"dur\")`,
      editMode: 'builder',
      builderConfig: {
        buckets: [],
        tags: [
          {
            key: '_measurement',
            values: ['wumpus'],
            aggregateFunctionType: 'filter',
          },
          {key: '_field', values: ['dur'], aggregateFunctionType: 'filter'},
          {key: 'foo', values: [], aggregateFunctionType: 'filter'},
        ],
        functions: [],
      },
      //        hidden: false
    },
    labels: [],
    every: '5m',
    level: 'CRIT',
    offset: '10s',
    reportZero: false,
    staleTime: '20m',
    statusMessageTemplate: 'Check: ${ r._check_name } is: ${ r._level }',
    tags: [],
    timeSince: '3m',
  }

  const thresholdCheck: GenCheck = {
    type: 'threshold',
    name: 'Phantom Check',
    status: 'active',
    orgID: '',
    query: {
      name: '',
      text: 'from(bucket: "%BUCKETNAME%")\n  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)\n  |> filter(fn: (r) => r["_measurement"] == "wumpus")\n  |> filter(fn: (r) => r["_field"] == "mag")\n  |> aggregateWindow(every: 1m, fn: mean, createEmpty: false)\n  |> yield(name: "mean")',
      editMode: 'builder',
      builderConfig: {
        buckets: [],
        tags: [
          {
            key: '_measurement',
            values: ['wumpus'],
            aggregateFunctionType: 'filter',
          },
          {key: '_field', values: ['mag'], aggregateFunctionType: 'filter'},
          {key: 'foo', values: [], aggregateFunctionType: 'filter'},
        ],
        functions: [{name: 'mean'}],
        aggregateWindow: {
          period: '1m',
          fillValues: false,
        },
      },
      //        hidden: false
    },
    labels: [],
    every: '1m',
    offset: '10s',
    statusMessageTemplate: 'Check: ${ r._check_name } is: ${ r._level }',
    tags: [],
    thresholds: [
      {
        allValues: false,
        level: 'CRIT',
        value: 15.03155,
        type: 'greater',
      },
      {
        allValues: false,
        level: 'WARN',
        value: 6.03155,
        type: 'greater',
      },
      {
        allValues: false,
        level: 'INFO',
        value: 1.03155,
        type: 'greater',
      },
      {
        allValues: false,
        level: 'OK',
        value: 1.03155,
        type: 'lesser',
      },
    ],
  }

  const createCheck = (
    check: GenCheck,
    org: Organization,
    bucket: Bucket,
    alias: string
  ): Cypress.Chainable<any> => {
    if (check.query.builderConfig && check.query.builderConfig.buckets) {
      check.query.builderConfig.buckets[0] = bucket.name
    }
    if (check.query.text) {
      check.query.text = check.query.text.replace('%BUCKETNAME%', bucket.name)
    } else {
      throw `check ${check.name} does not contain query text`
    }
    if (org.id) {
      check.orgID = org.id
    } else {
      throw `org ${org.name} has no id`
    }
    // get default org and bucket
    // create check
    return cy.createCheck(check).then((resp: any) => {
      cy.wrap(resp.body).as(alias)
    })
  }

  const initCheck = (check: GenCheck): Cypress.Chainable<any> => {
    cy.writeLPDataFromFile({
      filename: 'data/wumpus01.lp',
      offset: '20m',
      stagger: '1m',
    })
    return cy.get<Organization>('@org').then((org: Organization) => {
      cy.get<Bucket>('@bucket').then((bucket: Bucket) => {
        cy.wrap(bucket.name).as('bucketName')
        createCheck(check, org, bucket, 'check')
      })
    })
  }

  describe('Clone checks', () => {
    it('can clone and delete a deadman check', () => {
      cy.intercept('POST', '/api/v2/checks*').as('createCheck')
      const cloneNamePrefix = `${deadmanCheck.name} (cloned at `
      // 1. create deadman over API
      initCheck(deadmanCheck)
      cy.reload()
      cy.getByTestID('tree-nav')
      cy.getByTestID('copy-resource-id').invoke('text').wrap('checkIDOrig')
      cy.getByTestID('copy-task-id').invoke('text').wrap('taskIDOrig')
      // 2. Clone
      cy.getByTestID('context-menu-task').click()
      cy.getByTestID('context-clone-task').click()
      cy.wait('@createCheck')
      // 3. Asserts
      cy.get<GenCheck>('@check').then(check => {
        cy.getByTestIDHead(`check-card ${cloneNamePrefix}`).within(() => {
          cy.getByTestID('copy-resource-id').should('not.have.text', check.id)
          cy.getByTestID('copy-task-id').should('not.have.text', check.taskID)
        })
      })

      cy.getByTestID('check-card--name').then(nameDivs => {
        const names = nameDivs.toArray().map((r: any) => r.innerText)
        expect(names.length).to.equal(2)
        const cloneName = names[1]
        const cloneTime = cloneName.slice(
          cloneNamePrefix.length,
          cloneName.length - 1
        )
        const cloneTimeAsDate = new Date(cloneTime)
        expect(cloneTimeAsDate.toTimeString()).not.to.equal('Invalid Date')
        expect(cloneTimeAsDate.valueOf()).to.equal(cloneTimeAsDate.valueOf())
      })
      // 3.1 Assert configure same
      cy.contains(cloneNamePrefix).click()
      cy.getByTestID('duration-input--for').should(
        'have.value',
        deadmanCheck.timeSince
      )
      cy.getByTestID('check-levels--dropdown--button').should(
        'contain',
        deadmanCheck.level
      )
      cy.getByTestID('duration-input--stop').should(
        'have.value',
        deadmanCheck.staleTime
      )
      cy.getByTestID('status-message-textarea').should(
        'contain',
        deadmanCheck.statusMessageTemplate
      )
      cy.getByTestID('offset-options').should('have.value', deadmanCheck.offset)
      cy.getByTestID('schedule-check').should('have.value', deadmanCheck.every)
      // 3.2 Assert query-builder
      cy.getByTestID('select-group--option').click()
      cy.get('@bucketName').then(bn =>
        cy
          .getByTestID(`selector-list ${bn}`)
          .should('have.class', 'cf-list-item__active')
      )

      cy.getByTestID('selector-list wumpus').should(
        'have.class',
        'cf-list-item__active'
      )
      cy.getByTestID('selector-list dur').should(
        'have.class',
        'cf-list-item__active'
      )
      cy.getByTestID('selector-list bar').should('be.visible')
      cy.getByTestID('giraffe-layer-line').should('be.visible')
      cy.getByTestID('square-button').eq(0).click()
      cy.getByTestIDHead(`check-card ${cloneNamePrefix}`).within(() => {
        cy.getByTestID('context-delete-task--button').click()
      })
      cy.getByTestID('context-delete-task--confirm-button').click()
      cy.getByTestID(`check-card ${cloneNamePrefix}`).should('not.exist')
      cy.getByTestID(`check-card ${deadmanCheck.name}`).should('be.visible')
      cy.getByTestID('check-card--name').should('have.length', 1)
    })
  })

  interface CheckStatus {
    level: string
    message: string
    pair: {key: string; val: any}
    sourceTimeStamp: number
    offset: string
    type?: 'deadman' | 'threshold'
    name?: string
  }

  interface CheckStatusRec extends CheckStatus {
    check: GenCheck
  }

  const writeCheckStatusRecord = (
    rec: CheckStatusRec
  ): Cypress.Chainable<any> => {
    const lp =
      `statuses,_check_id=${rec.check.id},_check_name=${rec.check.name.replace(
        / /g,
        '\\ '
      )},_level=${rec.level},_source_management=wumpus ` +
      `_source_timestamp=${rec.sourceTimeStamp},_message="${rec.message}",${rec.pair.key}=${rec.pair.val}`

    return cy.writeLPData({
      lines: [lp],
      offset: rec.offset,
      namedBucket: '_monitoring',
    })
  }

  const deadmanStatuses: CheckStatus[] = [
    {
      sourceTimeStamp: calcNanoTimestamp('5m'),
      level: 'ok',
      message: 'feelin groovy',
      pair: {key: 'dur', val: 9},
      offset: '-3m',
      type: 'deadman',
      name: deadmanCheck.name,
    },
    {
      sourceTimeStamp: calcNanoTimestamp('10m'),
      level: 'crit',
      message: 'oh no',
      pair: {key: 'dur', val: 89},
      offset: '-8m',
      type: 'deadman',
      name: deadmanCheck.name,
    },
    {
      sourceTimeStamp: calcNanoTimestamp('15m'),
      level: 'ok',
      message: 'feelin fine',
      pair: {key: 'dur', val: 7},
      offset: '-13m',
      type: 'deadman',
      name: deadmanCheck.name,
    },
  ]

  const thresholdStatuses: CheckStatus[] = [
    {
      sourceTimeStamp: calcNanoTimestamp('6m'),
      level: 'warn',
      message: 'Stan Goetz - Girl from Imphanema',
      pair: {key: 'mag', val: 10.3},
      offset: '-4m',
      type: 'threshold',
      name: thresholdCheck.name,
    },
    {
      sourceTimeStamp: calcNanoTimestamp('11m'),
      level: 'info',
      message: 'Stanislav Grof - Call of the jaguar',
      pair: {key: 'mag', val: 1.5},
      offset: '-9m',
      type: 'threshold',
      name: thresholdCheck.name,
    },
    {
      sourceTimeStamp: calcNanoTimestamp('16m'),
      level: 'crit',
      message: 'Stanley Kubrick - Barry Lyndon',
      pair: {key: 'mag', val: 67.2},
      offset: '-14m',
      type: 'threshold',
      name: thresholdCheck.name,
    },
    {
      sourceTimeStamp: calcNanoTimestamp('21m'),
      level: 'ok',
      message: 'Nina Simone - Baby just cares for me',
      pair: {key: 'mag', val: 1.01},
      offset: '-19m',
      type: 'threshold',
      name: thresholdCheck.name,
    },
  ]

  const sourceTimeStampSort = (a: CheckStatus, b: CheckStatus) => {
    if (a.sourceTimeStamp > b.sourceTimeStamp) {
      return 1
    } else if (a.sourceTimeStamp < b.sourceTimeStamp) {
      return -1
    } else {
      return 0
    }
  }

  const checkStatuses: CheckStatus[] = thresholdStatuses
    .concat(deadmanStatuses)
    .sort(sourceTimeStampSort)

  describe('Status history', () => {
    beforeEach(() => {
      cy.writeLPDataFromFile({
        filename: 'data/wumpus01.lp',
        offset: '20m',
        stagger: '1m',
      })

      return cy.get<Organization>('@org').then((org: Organization) => {
        cy.get<Bucket>('@bucket').then((bucket: Bucket) => {
          createCheck(deadmanCheck, org, bucket, 'deadmanCheck').then(
            dmresult => {
              createCheck(thresholdCheck, org, bucket, 'thresholdCheck').then(
                thresult => {
                  cy.log('Now write status messages')
                  deadmanStatuses.forEach((status: CheckStatus) => {
                    writeCheckStatusRecord({
                      check: dmresult,
                      sourceTimeStamp: status.sourceTimeStamp,
                      level: status.level,
                      message: status.message,
                      pair: status.pair,
                      offset: status.offset,
                    }).should('eq', 'success')
                  })

                  thresholdStatuses.forEach((status: CheckStatus) => {
                    writeCheckStatusRecord({
                      check: thresult,
                      sourceTimeStamp: status.sourceTimeStamp,
                      level: status.level,
                      message: status.message,
                      pair: status.pair,
                      offset: status.offset,
                    }).should('eq', 'success')
                  })
                  cy.reload()
                }
              )
            }
          )
        })
      })
    })

    const assertStatusesMatch = (statuses: CheckStatus[]) => {
      cy.getByTestIDHead('event-row ').should('have.length', statuses.length)

      for (let i = 0; i < statuses.length; i++) {
        cy.getByTestID(`event-row ${i}`).within(() => {
          cy.getByTestID('event-row--field level').should(
            'have.text',
            statuses[i].level
          )
          cy.getByTestID('event-row--field checkID').should(
            'have.text',
            statuses[i].name
          )
          cy.getByTestID('event-row--field message').should(
            'have.text',
            statuses[i].message
          )
        })
      }
    }

    it('shows and filters general status history', () => {
      cy.getByTestID('nav-item-alerting').within(() => {
        cy.get('+ button').trigger('mouseover')
      })
      cy.getByTestID('popover--dialog').within(() => {
        cy.contains('Alert History').click()
      })

      cy.getByTestID('alert-history-statuses--radio').click()

      // Assert basic history view is correct
      assertStatusesMatch(checkStatuses)

      // filter by check name
      cy.getByTestID('check-status-input').type(
        `"checkName" == "${thresholdCheck.name}"`
      )
      // make sure order matches UI records order
      const sortedThStatuses = thresholdStatuses.sort(sourceTimeStampSort)
      assertStatusesMatch(sortedThStatuses)

      // filter by level
      const critStatuses = checkStatuses.filter((check: CheckStatus) => {
        return check.level === 'crit'
      })

      cy.getByTestID('check-status-input').clear()
      cy.getByTestID('check-status-input').type('"level" == "crit"')

      assertStatusesMatch(critStatuses)

      // filter by message part
      const stanStatuses = checkStatuses.filter((check: CheckStatus) => {
        return check.message.match(/^Stan/)
      })

      cy.getByTestID('check-status-input').clear()
      cy.getByTestID('check-status-input').type('"message" =~  /^Stan/')

      assertStatusesMatch(stanStatuses)
    })

    it('shows status history per check', () => {
      // Deadman history
      cy.getByTestID(`check-card ${deadmanCheck.name}`).within(() => {
        cy.getByTestID('context-menu-task').click()
      })
      cy.getByTestID('context-history-task').click()

      assertStatusesMatch(deadmanStatuses)

      cy.getByTestID('giraffe-axes').should('be.visible')
      cy.getByTestID('giraffe-layer-line').should('be.visible')

      cy.getByTestIDHead('event-marker--line--').should('have.length', 1)

      cy.getByTestID('event-marker-vis-icon-ok').click()

      cy.getByTestIDHead('event-marker--line--').should('have.length', 3)

      cy.go('back')

      // Threshold history
      cy.getByTestID(`check-card ${thresholdCheck.name}`).within(() => {
        cy.getByTestID('context-menu-task').click()
      })

      cy.getByTestID('context-history-task').click()

      assertStatusesMatch(thresholdStatuses)

      cy.getByTestIDHead('event-marker--line--').should('have.length', 3)

      cy.getByTestID('event-marker-vis-toggle-info').click()
      cy.getByTestID('event-marker-vis-toggle-warn').click()

      cy.getByTestIDHead('event-marker--line--').should('have.length', 1)

      // check tooltip
      cy.getByTestID('event-marker--rect--crit').trigger('mouseover')
      cy.getByTestID('box-tooltip').should('be.visible')
      cy.getByTestID('event-marker-tooltip--cell time').should('be.visible')
      cy.getByTestID('event-marker-tooltip--cell level').should(
        'have.text',
        'crit'
      )
      cy.getByTestID('event-marker-tooltip--cell checkName').should(
        'have.text',
        thresholdCheck.name
      )
      cy.getByTestID('event-marker-tooltip--cell message').should(
        'have.text',
        thresholdStatuses.filter((status: CheckStatus) => {
          return status.level === 'crit'
        })[0].message
      )

      // Check right side level handle display
      const levels: string[] = ['ok', 'info', 'warn', 'crit']

      // Make sure handle locations are correct
      let lastY = 0
      for (let i = 0; i < levels.length; i++) {
        cy.getByTestID(`threshold-marker--handle--${levels[i]}`)
          .should('be.visible')
          .then(handle => {
            const handleY = handle[0].getBoundingClientRect().y
            if (i === 1) {
              // OK and INFO are same
              expect(lastY).to.equal(handleY)
            } else if (i > 1) {
              // WARN and CRIT are higher
              expect(lastY).to.be.above(handleY)
            }
            lastY = handleY
          })
      }
    })
  })
})

describe('Checks - IOx', () => {
  it('routes to 404 page when IOx user attempts to access checks', () => {
    cy.skipOn(isTSMOrg)
    const shouldShowAlerts = false
    setupTest(shouldShowAlerts)
    cy.contains('404: Page Not Found')
    cy.clickNavBarItem('nav-item-settings')
    cy.getByTestID('alerting-tab--checks').should('not.exist')
  })
})
