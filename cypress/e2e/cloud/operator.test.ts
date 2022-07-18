describe('Operator Page', () => {
  beforeEach(() =>
    cy.flush().then(() =>
      cy.signin().then(() => {
        cy.get('@org').then(() => {
          cy.getByTestID('home-page--header').should('be.visible')
          cy.setFeatureFlags({
            uiUnificationFlag: true,
          }).then(() => {
            cy.quartzProvision({
              isOperator: true,
              operatorRole: 'read-write',
            }).then(() => {
              cy.visit(`/operator`)
              cy.getByTestID('operator-page--title').contains('2.0 Resources')
            })
          })
        })
      })
    )
  )

  it('should render the Operator page and allow for RUD operations', () => {
    // validates that the default behavior is to open to the account tab
    cy.getByTestID('accountTab').should('have.class', 'cf-tabs--tab__active')
    cy.getByTestID('orgTab').should('not.have.class', 'cf-tabs--tab__active')

    cy.get('.cf-refless-popover--trigger').click()

    cy.getByTestID('refless-popover--contents').contains('test@influxdata.com')

    cy.getByTestID('logout-button').should('exist')

    // preloads 6 accounts
    cy.getByTestID('table-body').within(() => {
      cy.getByTestID('table-row').should('have.length', 6)
    })

    // placeholder says filter by email
    cy.getByTestID('operator-resource--searchbar')
      .invoke('attr', 'placeholder')
      .should('contain', 'Filter accounts by email')

    // get ready to search accounts
    cy.intercept('GET', '/api/v2/quartz/operator/accounts*').as(
      'quartzSearchAccounts'
    )

    // Search for a known user
    const knownUser = ['a', 's', 'a', 'l', 'e', 'm']
    for (let index = 0; index < knownUser.length; index += 1) {
      cy.getByTestID('operator-resource--searchbar').type(knownUser[index])
      cy.wait('@quartzSearchAccounts')
      cy.getByTestID('table-body').within(() => {
        cy.getByTestID('table-row').should('have.length', index === 0 ? 6 : 1)
      })
    }

    // Make sure that the popover closes when clicking out
    cy.getByTestID('refless-popover--contents').should('not.exist')

    // Search for an unknown user
    cy.getByTestID('operator-resource--searchbar').clear()
    const unknownUser = ['s', 'a', 'l', 't', '_', 'b', 'a', 'e']
    for (let index = 0; index < unknownUser.length; index += 1) {
      cy.getByTestID('operator-resource--searchbar').type(unknownUser[index])
      cy.wait('@quartzSearchAccounts')

      // all letters up to 'sal' will match, any more will not
      if (index > 2) {
        cy.getByTestID('empty-state--text').should('be.visible')
      } else {
        cy.getByTestID('empty-state--text').should('not.exist')
      }
    }

    cy.getByTestID('operator-resource--searchbar').clear()

    cy.getByTestID('orgTab').click()

    cy.location().should(loc => {
      expect(loc.pathname).to.eq('/operator/orgs')
    })

    cy.getByTestID('orgTab').should('have.class', 'cf-tabs--tab__active')
    cy.getByTestID('accountTab').should(
      'not.have.class',
      'cf-tabs--tab__active'
    )

    // preloads 6 organizations
    cy.getByTestID('table-body').within(() => {
      cy.getByTestID('table-row').should('have.length', 6)
    })

    // placeholder says filter by id
    cy.getByTestID('operator-resource--searchbar')
      .invoke('attr', 'placeholder')
      .should('contain', 'Filter organizations by id')

    // get ready to search orgs
    cy.intercept('GET', '/api/v2/quartz/operator/orgs*').as('quartzSearchOrgs')

    // search for a known org
    const knownOrg = ['6', '7', '8']
    for (let index = 0; index < knownOrg.length; index += 1) {
      cy.getByTestID('operator-resource--searchbar').type(knownOrg[index])
      cy.wait('@quartzSearchOrgs')
      cy.getByTestID('table-body').within(() => {
        cy.getByTestID('table-row').should('have.length', 1)
      })
    }

    cy.getByTestID('operator-resource--searchbar').clear()

    // search for an unknown org
    const unknownOrg = ['i', 'n', 'v', 'a', 'l', 'i', 'd']
    for (let index = 0; index < unknownOrg.length; index += 1) {
      cy.getByTestID('operator-resource--searchbar').type(unknownOrg[index])
      cy.wait('@quartzSearchOrgs')
      cy.getByTestID('empty-state--text').should('be.visible')
    }

    cy.getByTestID('operator-resource--searchbar').clear()

    cy.getByTestID('accountTab').click()

    cy.location().should(loc => {
      expect(loc.pathname).to.eq('/operator/accounts')
    })

    cy.getByTestID('accountTab').should('have.class', 'cf-tabs--tab__active')
    cy.getByTestID('orgTab').should('not.have.class', 'cf-tabs--tab__active')

    cy.getByTestID('account-id')
      .first()
      .within(() => {
        cy.get('a').click()
      })

    cy.location().should(loc => {
      expect(loc.pathname).to.eq('/operator/accounts/1')
    })

    cy.getByTestID('account-view--header').contains('operator1 (1)')
    // should not be able to delete undeletable accounts
    cy.getByTestID('account-delete--button').should('be.disabled')
    // should not be able to convert cancelled accounts to contract
    cy.getByTestID('account-convert-to-contract--button').should('be.disabled')

    // Associated Users Section
    cy.getByTestID('associated-users--title').contains('Associated Users')
    cy.getByTestID('account-type--header').should('exist')
    cy.getByTestID('account-balance--header').should('exist')
    cy.getByTestID('cloud-provider--header').should('exist')
    cy.getByTestID('billing-provider--header').should('exist')
    cy.getByTestID('billing-acctid--header').should('exist')
    cy.getByTestID('salesforce-id--header').should('exist')
    cy.getByTestID('subscription-status--header').should('exist')
    cy.getByTestID('billing-contact--header').should('exist')

    cy.getByTestID('associated-orgs--title').contains(
      'Associated Organizations'
    )

    cy.getByTestID('associated-orgs--table-body').within(() => {
      cy.getByTestID('table-row').should('have.length', 6)
    })

    // Renders the org overlay
    cy.getByTestID('org-id')
      .last()
      .within(() => {
        cy.get('a').click()
      })

    cy.location().should(loc => {
      expect(loc.pathname).to.eq('/operator/orgs/678')
    })

    cy.getByTestID('overlay--container').should('be.visible')
    cy.getByTestID('overlay--header').contains('678')

    cy.getByTestID('limits-rate.readKBs--input')
      .clear()
      .type('666')

    cy.getByTestID('org-overlay--submit-button').click()

    cy.getByTestID('account-view--back-button').click()

    cy.getByTestID('account-id')
      .last()
      .within(() => {
        cy.get('a').click()
      })

    cy.location().should(loc => {
      expect(loc.pathname).to.eq('/operator/accounts/678')
    })

    // should be able to delete deletable accounts
    cy.getByTestID('account-delete--button').should('not.be.disabled')
    // should be able to convert free accounts to contract
    cy.getByTestID('account-convert-to-contract--button').should(
      'not.be.disabled'
    )

    cy.getByTestID('account-view--back-button').click()

    cy.getByTestID('accountTab').should('have.class', 'cf-tabs--tab__active')
    cy.getByTestID('orgTab').should('not.have.class', 'cf-tabs--tab__active')

    cy.getByTestID('orgTab').click()
    cy.getByTestID('orgTab').should('have.class', 'cf-tabs--tab__active')
    cy.getByTestID('accountTab').should(
      'not.have.class',
      'cf-tabs--tab__active'
    )

    cy.getByTestID('org-id')
      .last()
      .within(() => {
        cy.get('a').click()
      })

    cy.location().should(loc => {
      expect(loc.pathname).to.eq('/operator/orgs/678')
    })

    cy.getByTestID('overlay--container').should('be.visible')
    cy.getByTestID('overlay--header').contains('678')

    cy.getByTestID('limits-rate.readKBs--input')
      .invoke('attr', 'value')
      .should('contain', '666')

    // should be able to view the operator link in the navbar
    cy.visit('/')
    cy.getByTestID('nav-item--operator').should('be.visible')
  })
})

describe('Operator Page should not be accessible for non-operator users', () => {
  beforeEach(() =>
    cy.flush().then(() =>
      cy.signin().then(() => {
        cy.get('@org').then(() => {
          cy.getByTestID('home-page--header').should('be.visible')
          cy.setFeatureFlags({
            uiUnificationFlag: true,
          }).then(() => {
            cy.quartzProvision({
              isOperator: false,
            }).then(() => {
              cy.visit(`/operator`)
            })
          })
        })
      })
    )
  )

  it('should render a 404', () => {
    cy.getByTestID('not-found').should('exist')
    cy.visit('/')
    cy.getByTestID('nav-item--operator').should('not.exist')
  })
})
