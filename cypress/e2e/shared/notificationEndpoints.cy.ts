import {
  NotificationEndpoint,
  GenEndpoint,
  SlackNotificationEndpoint,
  Organization,
} from '../../../src/types'

describe('Notification Endpoints', () => {
  const endpoint: GenEndpoint = {
    orgID: '',
    name: 'Pre-Created Endpoint',
    userID: '',
    description: 'interrupt everyone at work',
    status: 'active',
    type: 'slack',
    url: 'http://api.slack.com',
    token: 'plerps',
  }

  beforeEach(() => {
    cy.flush()
    cy.signin()
    cy.setFeatureFlags({
      showAlertsInNewIOx: true,
    })
    cy.get<Organization>('@org').then(({id}: Organization) =>
      cy.fixture('routes').then(({orgs, alerting}) => {
        cy.createEndpoint({
          ...(endpoint as NotificationEndpoint),
          orgID: id,
        }).then(({body}) => {
          cy.wrap(body).as('endpoint')
        })
        cy.visit(`${orgs}/${id}${alerting}`)
      })
    )
    cy.getByTestID('tree-nav')

    // User can only see all panels at once on large screens
    cy.getByTestID('alerting-tab--endpoints').click({force: true})
  })

  it('can create a notification endpoint', () => {
    const name = 'An Endpoint Has No Name'
    const description =
      'A minute, an hour, a month. Notification Endpoint is certain. The time is not.'

    cy.getByTestID('create-endpoint').click()

    cy.getByTestID('endpoint-name--input')
      .clear()
      .type(name)
      .should('have.value', name)

    cy.getByTestID('endpoint-description--textarea')
      .clear()
      .type(description)
      .should('have.value', description)

    cy.getByTestID('endpoint-change--dropdown')
      .click()
      .within(() => {
        cy.getByTestID('endpoint--dropdown--button').within(() => {
          cy.contains('Slack')
        })

        cy.getByTestID('endpoint--dropdown-item http').click()

        cy.getByTestID('endpoint--dropdown--button').within(() => {
          cy.contains('HTTP')
        })
      })

    cy.getByTestID('http-url')
      .clear()
      .type('http.url.us')
      .should('have.value', 'http.url.us')

    cy.getByTestID('endpoint-change--dropdown')
      .click()
      .within(() => {
        cy.getByTestID('endpoint--dropdown--button').within(() => {
          cy.contains('HTTP')
        })

        cy.getByTestID('endpoint--dropdown-item slack').click()

        cy.getByTestID('endpoint--dropdown--button').within(() => {
          cy.contains('Slack')
        })
      })

    cy.getByTestID('slack-url')
      .clear()
      .type('slack.url.us')
      .should('have.value', 'slack.url.us')

    cy.getByTestID('endpoint-save--button').click()

    cy.getByTestID(`endpoint-card ${name}`).should('exist')
  })

  it('can create a notification endpoint pager duty with client url', () => {
    const name = 'Pagerduty example'

    cy.getByTestID('create-endpoint').click()

    cy.getByTestID('endpoint-name--input')
      .clear()
      .type(name)
      .should('have.value', name)

    cy.getByTestID('endpoint-change--dropdown')
      .click()
      .within(() => {
        cy.getByTestID('endpoint--dropdown--button').within(() => {
          cy.contains('Slack')
        })

        cy.getByTestID('endpoint--dropdown-item pagerduty').click()

        cy.getByTestID('endpoint--dropdown--button').within(() => {
          cy.contains('Pagerduty')
        })
      })

    cy.getByTestID('pagerduty-url')
      .clear()
      .type('many-faced-god.gov')
      .should('have.value', 'many-faced-god.gov')

    cy.getByTestID('pagerduty-routing-key')
      .type('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9')
      .should('have.value', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9')

    cy.getByTestID('endpoint-save--button').click()

    cy.getByTestID(`endpoint-card ${name}`).should('exist')
  })

  it('can create a notification endpoint pager duty without client url', () => {
    const name = 'Pagerduty url none'

    cy.getByTestID('create-endpoint').click()

    cy.getByTestID('endpoint-name--input')
      .clear()
      .type(name)
      .should('have.value', name)

    cy.getByTestID('endpoint-change--dropdown')
      .click()
      .within(() => {
        cy.getByTestID('endpoint--dropdown--button').within(() => {
          cy.contains('Slack')
        })

        cy.getByTestID('endpoint--dropdown-item pagerduty').click()

        cy.getByTestID('endpoint--dropdown--button').within(() => {
          cy.contains('Pagerduty')
        })
      })

    cy.getByTestID('pagerduty-url').clear()

    cy.getByTestID('pagerduty-routing-key')
      .type('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9')
      .should('have.value', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9')

    cy.getByTestID('endpoint-save--button').click()

    cy.getByTestID(`endpoint-card ${name}`).should('exist')
  })

  it('can edit a notification endpoint', () => {
    cy.get<SlackNotificationEndpoint>('@endpoint').then(endpoint => {
      const {name, description, url} = endpoint
      const newName = 'An Endpoint Has No Name'
      const newDescription =
        'A minute, an hour, a month. Notification Endpoint is certain. The time is not.'
      const newURL = 'many-faced-god.gov'

      cy.intercept('PUT', `/api/v2/notificationEndpoints/${endpoint.id}`).as(
        'notificationEndpointPutCall'
      )

      cy.getByTestID(`endpoint-card--name ${name}`).click()

      cy.getByTestID('endpoint-name--input')
        .should('have.value', name)
        .clear()
        .type(newName)
        .should('have.value', newName)

      cy.getByTestID('endpoint-description--textarea')
        .should('have.value', description)
        .clear()
        .type(newDescription)
        .should('have.value', newDescription)

      cy.getByTestID('slack-url').should('have.value', url)

      cy.getByTestID('endpoint-change--dropdown')
        .click()
        .within(() => {
          cy.getByTestID('endpoint--dropdown--button').within(() => {
            cy.contains('Slack')
          })

          cy.getByTestID('endpoint--dropdown-item pagerduty').click()

          cy.getByTestID('endpoint--dropdown--button').within(() => {
            cy.contains('Pagerduty')
          })
        })

      cy.getByTestID('pagerduty-url')
        .clear()
        .type(newURL)
        .should('have.value', newURL)

      cy.getByTestID('pagerduty-routing-key')
        .clear()
        .type('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9')
        .should('have.value', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9')

      cy.getByTestID('endpoint-save--button').click()

      // now verify REST call
      cy.wait('@notificationEndpointPutCall').then(resp => {
        if (!resp.response) {
          throw 'PUT endpoint call returned no response'
        }
        expect(resp.response.body.name).to.equal(newName)
        expect(resp.response.body.description).to.equal(newDescription)
        expect(resp.response.body.clientURL).to.equal(newURL)
        expect(resp.response.body.type).to.equal('pagerduty')
        expect(resp.response.body.routingKey).to.match(/secret: .*-routing-key/)
      })

      // now verify Card Updated
      cy.getByTestID(`endpoint-card ${newName}`).within(() => {
        cy.getByTestID('resource-list--editable-description').should(
          'have.text',
          newDescription
        )
      })

      // Create a label
      cy.getByTestID(`endpoint-card ${newName}`).within(() => {
        cy.getByTestID('inline-labels--add').click()
      })

      const labelName = 'l1'
      cy.getByTestID('inline-labels--popover--contents').type(labelName)
      cy.getByTestID('inline-labels--create-new').click()
      cy.getByTestID('create-label-form--submit').click()

      // Delete the label
      cy.getByTestID(`label--pill--delete ${labelName}`).click({force: true})
      cy.getByTestID('inline-labels--empty').should('exist')
    })
  })

  it('can view history of endpoint', () => {
    cy.getByTestID(`context-menu-task`).click()
    cy.getByTestID(`context-history-task`).click()
    cy.getByTestID(`alert-history-title`).should('exist')
  })

  it('can delete endpoint', () => {
    cy.getByTestID(`context-delete-task--button`).click()
    cy.getByTestID(`context-delete-task--confirm-button`).click()
    cy.getByTestID(`endpoint-card--name ${name}`).should('not.exist')
  })

  // to be used for status change values
  const elementTextHasValueInRange = (
    elem: JQuery,
    min: number,
    max: number
  ) => {
    const t = elem.text().match(/\d+/)
    if (!t) {
      throw `Element text: "${elem.text()}" contains no value`
    }
    expect(parseInt(t[0])).to.be.at.least(min).and.to.be.at.most(max)
  }

  it('can change endpoint status', () => {
    cy.intercept('PATCH', '/api/v2/notificationEndpoints/*').as(
      'notificationEndpointPatchCall'
    )

    cy.getByTestID('endpoint-card Pre-Created Endpoint')
      .should('not.have.class', 'cf-resource-card__disabled')
      .within(() => {
        // use opportunity to verify last update status
        cy.getByTestID('resource-list--meta').within(() => {
          cy.get('> div')
            .eq(0)
            .then(elem => {
              elementTextHasValueInRange(elem, 1, 30)
            })
        })
        // Toggle inactive
        cy.getByTestID('endpoint-card--slide-toggle').click()
      })
    cy.wait('@notificationEndpointPatchCall').then(resp => {
      if (!resp.response) {
        throw 'Patch endpoint call returned no response'
      }
      // assert call to stack
      expect(resp.response.body.status).to.equal('inactive')
      cy.wrap(resp.response.body.id).as('endpID')
    })
    // assert rendering
    cy.getByTestID('endpoint-card Pre-Created Endpoint').should(
      'have.class',
      'cf-resource-card__disabled'
    )

    // N.B. Should inactive status be reflected elsewhere in UI?
    //   e.g. Create/Edit Notification rule Popup > Endpoint select
    //  see issue https://github.com/influxdata/ui/issues/3629
    // If so, TODO add assert here once 3629 resolved

    // N.B. also consider warning when endpoint is in use
    // see issue https://github.com/influxdata/ui/issues/3644
    //  TODO cover use case described in 3644 based on decision of team

    // Toggle back to active
    cy.getByTestID('endpoint-card Pre-Created Endpoint').within(() => {
      cy.getByTestID('endpoint-card--slide-toggle').click()
    })
    cy.wait('@notificationEndpointPatchCall').then(resp => {
      if (!resp.response) {
        throw 'Patch endpoint call returned no response'
      }
      expect(resp.response.body.status).to.equal('active')
    })

    cy.getByTestID('endpoint-card Pre-Created Endpoint')
      .should('not.have.class', 'cf-resource-card__disabled')
      .within(() => {
        // use opportunity to verify change in last update status
        cy.getByTestID('resource-list--meta').within(() => {
          cy.get('> div')
            .eq(0)
            .then(elem => {
              elementTextHasValueInRange(elem, 0, 3)
            })
          // use opportunity to verify id value in copy to clipboard
          cy.get('> div')
            .eq(1)
            .then(elem => {
              cy.get('@endpID').then(id => {
                expect(elem.text()).to.contain(id)
              })
            })
        })
      })
  })

  describe('When managing the list', () => {
    // Generate some more endpoints
    const endpoints: GenEndpoint[] = [
      {
        orgID: '',
        name: 'пораже́ние це́ли',
        userID: '',
        description:
          'В литературе, как, впрочем, и других областях искусства, есть статисты, классики и бунтари.',
        status: 'active',
        type: 'slack',
        url: 'http://api.slack.com',
        token: 'plerps',
      },
      {
        orgID: '',
        name: 'Quasiomodo',
        userID: '',
        description:
          'Quasimodo resta à genoux, baissa la tête et joignit les mains.',
        status: 'active',
        type: 'http',
        url: 'http://www.notredamedeparis.fr',
        authMethod: 'none',
        method: 'GET',
      },
      {
        orgID: '',
        name: 'Paquet',
        userID: '',
        description: 'une unité de données',
        status: 'active',
        type: 'pagerduty',
        clientURL: 'http://www.notredamedeparis.fr',
        routingKey: 'TEST_ROUTING_KEY',
      },
      {
        orgID: '',
        name: '@!#$%^&*()_=+"quoth"\\\'cite\'<tag/>',
        userID: '',
        description: 'Special chars',
        status: 'active',
        type: 'http',
        url: 'https://www.google.com',
        authMethod: 'basic',
        username: 'mlok',
        password: 'secret',
        method: 'POST',
      },
    ]
    beforeEach(() => {
      cy.get<Organization>('@org').then(({id}: Organization) =>
        cy.fixture('routes').then(({orgs, alerting}) => {
          endpoints.forEach(endpoint => {
            cy.createEndpoint({
              ...(endpoint as NotificationEndpoint),
              orgID: id,
            })
          })
          endpoints.push(endpoint)
          cy.visit(`${orgs}/${id}${alerting}`)
          cy.getByTestID('tree-nav')

          // User can only see all panels at once on large screens
          cy.getByTestID('alerting-tab--endpoints').click({force: true})
        })
      )
    })

    it('can filter endpoints', () => {
      const names = endpoints.map(endp => endp.name).sort()
      // Baseline check
      cy.get('[data-testid^="endpoint-card--name "]').should(cardNames => {
        const cnsText = cardNames.toArray().map(cn => cn.innerText)
        expect(cnsText).to.deep.eq(names)
      })
      cy.getByTestID('empty-state--text').should('not.be.visible')
      // Filter standard ASCII ABCD
      const ascFilter = names.filter(name => name.match(/.*[q|Q].*/))
      cy.getByTestID('filter--input endpoints').type('q')
      cy.get('[data-testid^="endpoint-card--name "]').should(cardNames => {
        const cnsText = cardNames.toArray().map(cn => cn.innerText)
        expect(cnsText).to.deep.eq(ascFilter)
      })
      // Check clear
      cy.getByTestID('filter--input endpoints').clear()
      cy.get('[data-testid^="endpoint-card--name "]').should(cardNames => {
        const cnsText = cardNames.toArray().map(cn => cn.innerText)
        expect(cnsText).to.deep.eq(names)
      })
      // Filter UNICODE non-latin
      const azbFilter = names.filter(name => name.match(/.*це́л.*/))
      cy.getByTestID('filter--input endpoints').type('це́л')
      cy.get('[data-testid^="endpoint-card--name "]').should(cardNames => {
        const cnsText = cardNames.toArray().map(cn => cn.innerText)
        expect(cnsText).to.deep.eq(azbFilter)
      })
      // Filter Special Chars
      const specFilter = names.filter(name => name.match(/.*@.*/))
      cy.getByTestID('filter--input endpoints')
        .clear()
        .type('@!#$%^&*()_=+"quoth"\\\'cite\'<tag/>')
      cy.get('[data-testid^="endpoint-card--name "]').should(cardNames => {
        const cnsText = cardNames.toArray().map(cn => cn.innerText)
        expect(cnsText).to.deep.eq(specFilter)
      })
      // Filter no match
      const nmFilter = names.filter(name => name.match(/.*zzz.*/))
      cy.getByTestID('filter--input endpoints').clear().type('zzz')
      cy.get('[data-testid^="endpoint-card--name "]').should(cardNames => {
        const cnsText = cardNames.toArray().map(cn => cn.innerText)
        expect(cnsText).to.deep.eq(nmFilter)
      })
      cy.getByTestID('empty-state--text').should('be.visible')
    })
  })

  describe('When a endpoint does not exist', () => {
    it('should route the user to the alerting index page', () => {
      const nonexistentID = '0495f0d1247ab600'

      // visitng the endpoint edit overlay
      cy.get<Organization>('@org').then(({id}: Organization) => {
        cy.fixture('routes').then(({orgs, alerting, endpoints}) => {
          cy.visit(`${orgs}/${id}${alerting}${endpoints}/${nonexistentID}/edit`)
          cy.url().should('include', `${orgs}/${id}${alerting}`)
        })
      })
    })
  })
})
