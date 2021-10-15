import {
  SlackNotificationEndpoint,
  Organization,
  GenEndpoint,
  GenRule,
  GenCheck,
  NotificationEndpoint,
  NotificationRule,
} from '../../../src/types'
import {Bucket} from '../../../src/client'
import {calcNanoTimestamp} from '../../support/Utils'

// skipping these tests until we have a local vault instance running
describe('NotificationRules', () => {
  const name1 = 'Slack 1'
  const name2 = 'Slack 2'
  const name3 = 'Slack 3'

  beforeEach(() => {
    cy.flush().then(() =>
      cy.signin().then(() => {
        cy.get<Organization>('@org').then(({id}: Organization) => {
          // create the notification endpoints
          cy.fixture('endpoints').then(({slack}) => {
            cy.createEndpoint({...slack, name: name1, orgID: id})
            cy.createEndpoint({...slack, name: name2, orgID: id}).then(
              ({body}) => {
                cy.wrap(body).as('selectedEndpoint')
              }
            )
            cy.createEndpoint({...slack, name: name3, orgID: id})
          })

          // visit the alerting index
          cy.fixture('routes').then(({orgs, alerting}) => {
            cy.visit(`${orgs}/${id}${alerting}`)
            cy.getByTestID('tree-nav')
          })
        })
      })
    )
  })

  describe('When a rule does not exist', () => {
    it('should route the user to the alerting index page', () => {
      const nonexistentID = '04984be058066088'

      // visitng the rules edit overlay
      cy.get<Organization>('@org').then(({id}: Organization) => {
        cy.fixture('routes').then(({orgs, alerting, rules}) => {
          cy.visit(`${orgs}/${id}${alerting}${rules}/${nonexistentID}/edit`)
          cy.url().should('include', `${orgs}/${id}${alerting}`)
        })
      })
    })
  })

  describe('numeric input validation in Theshold Checks', () => {
    beforeEach(() => {
      cy.getByTestID('page-contents').within(() => {
        cy.getByTestID('dropdown').click()
        cy.getByTestID('create-threshold-check').click()
      })
    })

    describe('when threshold is above', () => {
      it('should put input field in error status and stay in error status when input is invalid or empty', () => {
        cy.getByTestID('checkeo--header alerting-tab').click()
        cy.getByTestID('add-threshold-condition-CRIT').click()
        cy.getByTestID('builder-conditions').within(() => {
          cy.getByTestID('panel').within(() => {
            cy.getByTestID('input-field-CRIT')
              .click()
              .type('{backspace}{backspace}')
              .invoke('attr', 'type')
              .should('equal', 'text')
              .getByTestID('input-field-CRIT--error')
              .should('have.length', 1)
              .and('have.value', '')
            cy.getByTestID('input-field-CRIT')
              .click()
              .type('somerangetext')
              .invoke('val')
              .should('equal', '')
              .getByTestID('input-field-CRIT--error')
              .should('have.length', 1)
          })
        })
      })

      it('should allow "20" to be deleted and then allow numeric input to get out of error status', () => {
        cy.getByTestID('checkeo--header alerting-tab').click()
        cy.getByTestID('add-threshold-condition-CRIT').click()
        cy.getByTestID('builder-conditions').within(() => {
          cy.getByTestID('panel').within(() => {
            cy.getByTestID('input-field-CRIT')
              .click()
              .type('{backspace}{backspace}9')
              .invoke('val')
              .should('equal', '9')
              .getByTestID('input-field--error')
              .should('have.length', 0)
          })
        })
      })
    })

    describe('when threshold is inside range', () => {
      it('should put input field in error status and stay in error status when input is invalid or empty', () => {
        cy.getByTestID('checkeo--header alerting-tab').click()
        cy.getByTestID('add-threshold-condition-CRIT').click()
        cy.getByTestID('builder-conditions').within(() => {
          cy.getByTestID('panel').within(() => {
            cy.getByTestID('dropdown--button').click()
            cy.get(
              '.cf-dropdown-item--children:contains("is inside range")'
            ).click()
            cy.getByTestID('input-field')
              .first()
              .click()
              .type('{backspace}{backspace}')
              .invoke('attr', 'type')
              .should('equal', 'text')
              .getByTestID('input-field--error')
              .should('have.length', 1)
              .and('have.value', '')
            cy.getByTestID('input-field')
              .first()
              .click()
              .type('hhhhhhhhhhhh')
              .invoke('val')
              .should('equal', '')
              .getByTestID('input-field--error')
              .should('have.length', 1)
          })
        })
      })

      it('should allow "20" to be deleted and then allow numeric input to get out of error status', () => {
        cy.getByTestID('checkeo--header alerting-tab').click()
        cy.getByTestID('add-threshold-condition-CRIT').click()
        cy.getByTestID('builder-conditions').within(() => {
          cy.getByTestID('panel').within(() => {
            cy.getByTestID('dropdown--button').click()
            cy.get(
              '.cf-dropdown-item--children:contains("is inside range")'
            ).click()
            cy.getByTestID('input-field')
              .first()
              .click()
              .type('{backspace}{backspace}7')
              .invoke('val')
              .should('equal', '7')
              .getByTestID('input-field--error')
              .should('have.length', 0)
          })
        })
      })
    })
  })

  it('can create a notification rule', () => {
    // User can only see all panels at once on large screens
    cy.getByTestID('alerting-tab--rules').click({force: true})

    const ruleName = 'my-new-rule'
    cy.getByTestID('create-rule').click()

    cy.getByTestID('rule-name--input').type(ruleName)

    cy.getByTestID('rule-schedule-every--input')
      .clear()
      .type('20m')
      .should('have.value', '20m')

    cy.getByTestID('rule-schedule-offset--input')
      .clear()
      .type('1m')
      .should('have.value', '1m')

    // Editing a Status Rule
    cy.getByTestID('status-rule').within(() => {
      cy.getByTestID('status-change--dropdown')
        .click()
        .within(() => {
          cy.getByTestID('status-change--dropdown-item is equal to').click()
          cy.getByTestID('status-change--dropdown--button').within(() => {
            cy.contains('equal')
          })
        })

      cy.getByTestID('levels--dropdown previousLevel').should('not.exist')
      cy.getByTestID('levels--dropdown currentLevel').should('exist')

      cy.getByTestID('status-change--dropdown')
        .click()
        .within(() => {
          cy.getByTestID('status-change--dropdown-item changes from').click()
          cy.getByTestID('status-change--dropdown--button').within(() => {
            cy.contains('changes from')
          })
        })

      cy.getByTestID('levels--dropdown previousLevel').click()
      cy.getByTestID('levels--dropdown-item INFO').click()
      cy.getByTestID('levels--dropdown--button previousLevel').within(() => {
        cy.contains('INFO')
      })

      cy.getByTestID('levels--dropdown currentLevel').click()
      cy.getByTestID('levels--dropdown-item CRIT').click()
      cy.getByTestID('levels--dropdown--button currentLevel').within(() => {
        cy.contains('CRIT')
      })
    })

    cy.getByTestID('endpoint--dropdown--button')
      .within(() => {
        cy.contains(name1)
      })
      .click()

    cy.get<SlackNotificationEndpoint>('@selectedEndpoint').then(({id}) => {
      cy.getByTestID(`endpoint--dropdown-item ${id}`).click()
      cy.getByTestID('endpoint--dropdown--button')
        .within(() => {
          cy.contains(name2)
        })
        .click()
    })

    const message = `
      Have you ever wanted to interrupt all your co-workers, but don't
      want to struggle with the hassle of typing @here in #general? Well,
      do we have the notification for you!
    `

    cy.getByTestID('slack-message-template--textarea')
      .clear()
      .type(message)
      .should('contain', message)

    cy.getByTestID('rule-overlay-save--button').click()

    // Add a label
    cy.getByTestID(`rule-card ${ruleName}`).within(() => {
      cy.getByTestID('inline-labels--add').click()
    })

    const labelName = 'l1'
    cy.getByTestID('inline-labels--popover--contents').type(labelName)
    cy.getByTestID('inline-labels--create-new').click()
    cy.getByTestID('create-label-form--submit').click()

    // Delete the label
    cy.getByTestID(`label--pill--delete ${labelName}`).click({force: true})
    cy.getByTestID('inline-labels--empty').should('exist')

    // Filter for the new rule
    cy.getByTestID('filter--input rules').type(ruleName)

    cy.getByTestID('rule-card--name')
      .contains(ruleName)
      .click()

    const editedName = ruleName + '!'

    // Edit the rule
    cy.getByTestID('rule-name--input')
      .clear()
      .type(editedName)

    cy.getByTestID('rule-schedule-every--input')
      .clear()
      .type('21m')
      .should('have.value', '21m')

    cy.getByTestID('rule-schedule-offset--input')
      .clear()
      .type('2m')
      .should('have.value', '2m')

    cy.getByTestID('rule-overlay-save--button').click()

    // Open overlay
    cy.getByTestID('rule-card--name')
      .contains(editedName)
      .click()

    // Close overlay
    cy.getByTestID('dismiss-overlay')
      .find('button')
      .click()

    // Delete the rule
    cy.getByTestID('rules--column').within(() => {
      cy.getByTestID(`context-delete-menu`).click()
      cy.getByTestID(`context-delete-task`).click()
    })

    // Remove the filter
    cy.getByTestID('filter--input rules').clear()
    cy.getByTestID('rule-card--name').should('have.length', 0)
  })

  // TODO add click through to history page after #2592 is fixed
  //   - currently all history tests start with direct route to page
  describe('notification history', () => {
    const endp: GenEndpoint = {
      orgID: '',
      name: 'Test HTTP Endpoint',
      userID: '',
      description: 'A Dummy Endpoint in AWS Land',
      status: 'active',
      type: 'http',
      url: 'http://endpoint.devnull.io:3000',
      authMethod: 'none',
      method: 'POST',
    }

    const rule: GenRule & {activeStatus: string} = {
      type: 'http',
      every: '1m',
      offset: '0m',
      url: '',
      orgID: '',
      name: 'Test Rule',
      activeStatus: 'active',
      status: 'active',
      endpointID: '',
      tagRules: [],
      labels: [],
      statusRules: [{currentLevel: 'CRIT', period: '1h', count: 1}],
      description: '',
    }

    const check: GenCheck = {
      type: 'deadman',
      name: 'Ghost Check',
      status: 'active',
      orgID: '',
      query: {
        name: '',
        text: '',
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
          functions: [],
        },
        //        hidden: false
      },
      labels: [],
      every: '1m',
      level: 'CRIT',
      offset: '0s',
      reportZero: false,
      staleTime: '10m',
      statusMessageTemplate: 'Check: ${ r._check_name } is: ${ r._level }',
      tags: [],
      timeSince: '90s',
    }

    interface MonitoringRec {
      check: GenCheck
      endp: NotificationEndpoint
      rule: GenRule
      level: string
      source: string
      sent: string
      valField: {key: string; val: string}
      sourceTimestamp: number
      statusTimestamp: number
      message: string
    }

    const writeMonitoringRecord = (
      rec: MonitoringRec,
      offset: string
    ): Cypress.Chainable<any> => {
      const lp =
        `notifications,_level=${rec.level},_notification_endpoint_id=${rec.endp.id},` +
        `_notification_endpoint_name=${rec.endp.name.replace(
          / /g,
          '\\ '
        )},_notification_rule_id=${rec.rule.id},` +
        `_notification_rule_name=${rec.rule.name.replace(/ /g, '\\ ')},` +
        `_check_id=${rec.check.id},_check_name=${rec.check.name.replace(
          / /g,
          '\\ '
        )},` +
        `_sent=${rec.sent},_source_measurement=${rec.source},_type=deadman,${
          rec.valField.key
        }=${rec.valField.val.replace(/ /g, '\\ ')} ` + // end tags start fields
        `_source_timestamp=${rec.sourceTimestamp},_status_timestamp=${
          rec.statusTimestamp
        },_message="${rec.message.replace(/ /g, ' ')}",dead="true"`

      return cy.writeLPData({
        lines: [lp],
        offset: offset,
        namedBucket: '_monitoring',
      })
    }

    // Ensure all Async data prep is completed in correct order before starting tests
    // Replaces beforeEach()
    beforeEach(() => {
      return cy
        .writeLPDataFromFile({
          filename: 'data/wumpus01.lp',
          offset: '20m',
          stagger: '1m',
        })
        .then(() => {
          return cy
            .get<Organization>('@org')
            .then((org: Organization) => {
              cy.get<Bucket>('@bucket').then((bucket: Bucket) => {
                // get default org and bucket
                // 2. create check
                const queryText = `from(bucket: \"${bucket.name}\")\n  |> range(start: v.timeRangeStart, stop: v.timeRangeStop)\n  |> filter(fn: (r) => r[\"_measurement\"] == \"wumpus\")\n  |> filter(fn: (r) => r[\"_field\"] == \"mag\")`
                cy.createCheck({
                  ...check,
                  orgID: org.id,
                  query: {
                    ...check.query,
                    text: queryText,
                    builderConfig: {
                      ...check.query.builderConfig,
                      buckets: [bucket.id],
                    },
                  },
                }).then(resp => {
                  cy.wrap(resp.body).as('check')
                })

                cy.createEndpoint({
                  ...(endp as NotificationEndpoint),
                  orgID: org.id,
                }).then(resp => {
                  cy.wrap(resp.body).as('endp')
                })

                cy.get<NotificationEndpoint>('@endp').then(endp => {
                  cy.createRule({
                    ...(rule as NotificationRule),
                    orgID: org.id,
                    endpointID: endp.id,
                  }).then(resp => {
                    cy.wrap(resp.body).as('rule')
                  })
                })
              })
            })
            .then(() => {
              return cy
                .get<GenCheck>('@check')
                .then(check => {
                  cy.get<NotificationEndpoint>('@endp').then(endp => {
                    cy.get<GenRule>('@rule').then(rule => {
                      writeMonitoringRecord(
                        {
                          check: check,
                          endp: endp,
                          rule: rule,
                          level: 'crit',
                          source: 'wumpus',
                          sent: 'true',
                          valField: {key: 'foo', val: 'bar'},
                          sourceTimestamp: calcNanoTimestamp('17m'),
                          statusTimestamp: calcNanoTimestamp('16m'),
                          message: 'This is a fake critical message',
                        },
                        '15m'
                      ).then(() => {
                        writeMonitoringRecord(
                          {
                            check: check,
                            endp: endp,
                            rule: rule,
                            level: 'info',
                            source: 'wumpus',
                            sent: 'false',
                            valField: {key: 'foo', val: 'bar'},
                            sourceTimestamp: calcNanoTimestamp('12m'),
                            statusTimestamp: calcNanoTimestamp('11m'),
                            message: 'This is a fake info message',
                          },
                          '10m'
                        ).then(() => {
                          writeMonitoringRecord(
                            {
                              check: check,
                              endp: endp,
                              rule: rule,
                              level: 'warn',
                              source: 'wumpus',
                              sent: 'true',
                              valField: {key: 'foo', val: 'bar'},
                              sourceTimestamp: calcNanoTimestamp('22m'),
                              statusTimestamp: calcNanoTimestamp('21m'),
                              message: 'This is a fake warning message',
                            },
                            '20m'
                          ).then(() => {
                            return writeMonitoringRecord(
                              {
                                check: check,
                                endp: endp,
                                rule: rule,
                                level: 'ok',
                                source: 'wumpus',
                                sent: 'true',
                                valField: {key: 'foo', val: 'bar'},
                                sourceTimestamp: calcNanoTimestamp('7m'),
                                statusTimestamp: calcNanoTimestamp('6m'),
                                message: 'This is a fake OK message',
                              },
                              '5m'
                            )
                          })
                        })
                      })
                    })
                  })
                })
                .then(() => {
                  // use direct route to page
                  return cy
                    .get<Organization>('@org')
                    .then(({id}: Organization) => {
                      cy.get<NotificationRule>('@rule').then(rule => {
                        cy.fixture('routes').then(({orgs}) => {
                          cy.visit(
                            `${orgs}/${id}/alert-history?type=notifications&filter="notificationRuleID%20%3D%3D%20%22${rule.id}"`
                          )
                          cy.url().should(
                            'include',
                            `${orgs}/${id}/alert-history`
                          )
                        })
                      })
                    })
                })
            })
        })
    })

    it('shows and filters history', () => {
      cy.get('.event-row').should('have.length', 4)
      cy.get('.event-row--field:nth-of-type(1)').then(timestamps => {
        const stamps = timestamps
          .toArray()
          .map(n => new Date(n.innerText).getTime())
        // assert sort desc by date
        for (let i = 1; i < stamps.length; i++) {
          expect(stamps[i - 1]).to.be.above(stamps[i])
        }
      })
      // verify first row
      cy.getByTestID('event-row 0').within(() => {
        cy.getByTestID('event-row--field level').should('have.text', 'ok')
        cy.getByTestID('event-row--field sent').within(() => {
          cy.getByTestID('sent-table-field sent').should('be.visible')
        })
        cy.getByTestID('event-row--field checkID').should(
          'have.text',
          check.name
        )
        cy.getByTestID('event-row--field notificationRuleID').should(
          'have.text',
          rule.name
        )
        cy.getByTestID('event-row--field notificationEndpointID').should(
          'have.text',
          endp.name
        )
      })
      // verify second row
      cy.getByTestID('event-row 1').within(() => {
        cy.getByTestID('event-row--field level').should('have.text', 'info')
        cy.getByTestID('event-row--field sent').within(() => {
          cy.getByTestID('sent-table-field not-sent').should('be.visible')
        })
      })
      // verify third row
      cy.getByTestID('event-row 2').within(() => {
        cy.getByTestID('event-row--field level').should('have.text', 'crit')
        cy.getByTestID('event-row--field sent').within(() => {
          cy.getByTestID('sent-table-field sent').should('be.visible')
        })
      })
      // verify fourth row
      cy.getByTestID('event-row 3').within(() => {
        cy.getByTestID('event-row--field level').should('have.text', 'warn')
      })
      // check links...
      //    ...To Check
      cy.getByTestID('overlay').should('not.exist')
      cy.getByTestID('event-row--field checkID')
        .eq(3)
        .within(() => {
          cy.get('a').click()
        })
      cy.getByTestID('overlay')
        .should('be.visible')
        .within(() => {
          cy.getByTestID('page-title').should('have.text', check.name)
          cy.getByTestID('giraffe-inner-plot').should('be.visible')
          cy.getByTestID('query-builder').should('be.visible')
        })
      cy.go('back')
      //    ...To Rule
      cy.getByTestID('overlay').should('not.exist')
      cy.getByTestID('event-row--field notificationRuleID')
        .eq(2)
        .within(() => {
          cy.get('a').click()
        })
      cy.getByTestID('overlay')
        .should('be.visible')
        .within(() => {
          cy.getByTestID('rule-name--input').should('have.value', rule.name)
          cy.getByTestID('levels--dropdown--button currentLevel').should(
            'have.text',
            rule.statusRules[0].currentLevel
          )
          cy.getByTestID('endpoint--dropdown--button').should(
            'have.text',
            endp.name
          )
        })
      cy.go('back')
      //    ...To Endpoint
      cy.getByTestID('overlay').should('not.exist')
      cy.getByTestID('event-row--field notificationEndpointID')
        .eq(1)
        .within(() => {
          cy.get('a').click()
        })
      cy.getByTestID('overlay')
        .should('be.visible')
        .within(() => {
          cy.getByTestID('endpoint--dropdown--button').should(
            'have.text',
            'HTTP'
          )
          cy.getByTestID('endpoint-name--input').should('have.value', endp.name)
          cy.getByTestID('endpoint-description--textarea').should(
            'have.value',
            endp.description
          )
          cy.getByTestID('http-method--dropdown--button').should(
            'have.text',
            'POST'
          )
          cy.getByTestID('http-authMethod--dropdown--button').should(
            'have.text',
            'none'
          )
          cy.getByTestID('http-url').should('have.value', endp.url)
        })
      cy.go('back')
      cy.getByTestID('overlay').should('not.exist')

      cy.getByTestID('check-status-dropdown').should('not.exist')
      cy.getByTestID('check-status-input').click()
      cy.getByTestID('check-status-dropdown').should('be.visible')

      // Filter level == crit
      cy.getByTestID('check-status-input')
        .clear()
        .type('"level" == "crit"')
      cy.get('.event-row').should('have.length', 1)
      //    ...verify row
      cy.get('[class$=ScrollContainer] > div:nth-of-type(1)').within(() => {
        cy.get('.level-table-field--crit').should('be.visible')
        cy.get('.sent-table-field--sent').should('be.visible')
      })
      // Filter level != info
      cy.getByTestID('check-status-input')
        .clear()
        .type('"level" != "info"')
      cy.get('[data-testid^="event-row "]')
        .should('have.length', 3)
        .then(rows => {
          const levels = rows
            .find('.event-row--field:nth-of-type(2)')
            .toArray()
            .map(r => r.innerText)
          expect(levels).to.deep.eq(['ok', 'crit', 'warn'])
        })
      // Filter notificationRuleName == rule.name
      cy.getByTestID('check-status-input')
        .clear()
        .type(`"notificationRuleName" == "${rule.name}"`)
      cy.get('[data-testid^="event-row "]')
        .should('have.length', 4)
        .then(rows => {
          const levels = rows
            .find('.event-row--field:nth-of-type(2)')
            .toArray()
            .map(r => r.innerText)
          expect(levels).to.deep.eq(['ok', 'info', 'crit', 'warn'])
        })
      cy.getByTitle('Refresh').click()
      cy.getByTestID('check-status-dropdown').should('not.exist')
    })

    it('refreshes the history', () => {
      cy.get('.event-row').should('have.length', 4)
      cy.get<GenCheck>('@check').then(check => {
        cy.get<NotificationEndpoint>('@endp').then(endp => {
          cy.get<GenRule>('@rule').then(rule => {
            writeMonitoringRecord(
              {
                check: check,
                endp: endp,
                rule: rule,
                level: 'info',
                source: 'wumpus',
                sent: 'false',
                valField: {key: 'foo', val: 'bar'},
                sourceTimestamp: calcNanoTimestamp('4m'),
                statusTimestamp: calcNanoTimestamp('3m'),
                message: 'This is a fake info message',
              },
              '2m'
            )
          })
        })
      })
      cy.getByTitle('Refresh').click()
      cy.get('.event-row')
        .should('have.length', 5)
        .then(rows => {
          const levels = rows
            .find('.event-row--field:nth-of-type(2)')
            .toArray()
            .map(r => r.innerText)
          expect(levels).to.deep.eq(['info', 'ok', 'info', 'crit', 'warn'])
        })
    })

    it('Switches between local and UTC time', () => {
      let hours: number[] = []
      cy.get('.event-row--field:nth-of-type(1) ').then(timestamps => {
        hours = timestamps.toArray().map(n => new Date(n.innerText).getHours())
      })

      // Switch to UTC
      cy.getByTestID('dropdown--button')
        .should('have.text', 'Local')
        .click()
      cy.getByTitle('UTC').click()
      cy.getByTestID('dropdown--button').should('have.text', 'UTC')

      // compare UTC values
      cy.getByTestID('event-row--field time').then(timestamps => {
        const UTCHours = timestamps
          .toArray()
          .map((n: any) => new Date(n.innerText).getHours())
        expect(UTCHours).to.not.deep.eq(hours)
      })

      // Switch back to Local
      cy.getByTestID('dropdown--button').click()
      cy.getByTitle('Local').click()
      cy.getByTestID('dropdown--button').should('have.text', 'Local')

      cy.getByTestID('event-row--field time').then(timestamps => {
        const CurrHours = timestamps
          .toArray()
          .map(n => new Date(n.innerText).getHours())
        expect(CurrHours).to.deep.eq(hours)
      })
    })
  })
})
