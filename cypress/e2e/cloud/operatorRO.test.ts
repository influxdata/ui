describe('Operator Page', () => {
  beforeEach(() =>
    cy.flush().then(() =>
      cy.signin().then(() => {
        cy.get('@org').then(() => {
          cy.getByTestID('home-page--header').should('be.visible')

          cy.quartzProvision({
            isOperator: true,
            operatorRole: 'read-only',
          }).then(() => {
            cy.reload()
            cy.setFeatureFlags({
              operatorRole: true,
              uiUnificationFlag: true,
            }).then(() => {
              cy.getByTestID('nav-item--operator').click()
              // cy.pause()
              cy.getByTestID('operator-page--title').contains('2.0 Resources')
            })
          })
        })
      })
    )
  )

  it('should render the Operator page and allow for RUD operations', () => {
    // Validates that the default behavior is to open to the account tab
    cy.getByTestID('accountTab').should('satisfy', element => {
      const classList = Array.from(element[0].classList)
      return classList.includes('cf-tabs--tab__active')
    })

    // Expect the org tab to be inactive
    cy.getByTestID('orgTab').should('satisfy', element => {
      const classList = Array.from(element[0].classList)
      return classList.includes('cf-tabs--tab__active') === false
    })

    cy.get('.cf-refless-popover--trigger').click()
    cy.getByTestID('refless-popover--contents').contains('test@influxdata.com')
    cy.getByTestID('logout-button').should('exist')

    // preloads 6 accounts
    cy.getByTestID('table-body').within(() => {
      cy.getByTestID('table-row').should('have.length', 6)
    })

    cy.getByTestID('operator-resource--searchbar').clear()

    cy.getByTestID('accountTab').click()

    cy.location().should(loc => {
      expect(loc.pathname).to.eq('/operator/accounts')
    })

    // todo: after getting local testing with local quartz-mock working:
    //  check that the name ''operator-678' is on the page
    // (that is the name)

    cy.getByTestID('account-id')
      .first()
      .within(() => {
        cy.get('a').click()
      })

    cy.location().should(loc => {
      expect(loc.pathname).to.eq('/operator/accounts/1')
    })

    // make sure the buttons don't exist on the page
    cy.getByTestID('account-delete--button').should('not.exist')
    cy.getByTestID('remove-user--button').should('not.exist')

    // go back to account listing
    cy.getByTestID('account-view--back-button').click()

    cy.getByTestID('orgTab').click()
    cy.getByTestID('operator-resource--searchbar').type('678', {
      force: true,
      delay: 50,
    })

    cy.getByTestID('table-body').within(() => {
      cy.getByTestID('table-row').should('have.length', 1)
    })

    cy.getByTestID('org-id')
      .last()
      .within(() => {
        cy.get('a').click()
      })

    // check all the fields are <p /> and not <input />
    const testIds = [
      'rate.readKBs',
      'rate.writeKBs',
      'rate.cardinality',
      'bucket.maxBuckets',
      'bucket.maxRetentionDuration',
      'notificationRule.maxNotifications',
      'dashboard.maxDashboards',
      'task.maxTasks',
      'check.maxChecks',
      'notificationRule.blockedNotificationRules',
      'notificationEndpoint.blockedNotificationEndpoints',
    ]

    testIds.forEach(testId => {
      cy.getByTestID(`limits-${testId}--input`).should('not.exist')
      cy.getByTestID(`limits-${testId}--p`).should('exist')
    })
  })
})
