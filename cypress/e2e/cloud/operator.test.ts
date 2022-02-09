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

    // filter the results by email
    cy.getByTestID('operator-resource--searchbar')
      .invoke('attr', 'placeholder')
      .should('contain', 'Filter accounts by email')

    cy.getByTestID('operator-resource--searchbar').type('asalem', {
      force: true,
      delay: 50,
    })

    cy.getByTestID('table-body').within(() => {
      cy.getByTestID('table-row').should('have.length', 1)
    })

    // Make sure that the popover closes when clicking out
    cy.getByTestID('refless-popover--contents').should('not.exist')

    cy.getByTestID('operator-resource--searchbar')
      .clear()
      .type('salt_bae', {force: true, delay: 50})

    cy.getByTestID('empty-state--text').contains(
      'Looks like there were no accounts that matched your search'
    )
    cy.getByTestID('operator-resource--searchbar').clear()

    cy.getByTestID('orgTab').click()

    cy.location().should(loc => {
      expect(loc.pathname).to.eq('/operator/orgs')
    })

    // Expect the org tab to be active
    cy.getByTestID('orgTab').should('satisfy', element => {
      const classList = Array.from(element[0].classList)
      return classList.includes('cf-tabs--tab__active')
    })

    // Expect the account tab to be inactive
    cy.getByTestID('accountTab').should('satisfy', element => {
      const classList = Array.from(element[0].classList)
      return classList.includes('cf-tabs--tab__active') === false
    })

    // preloads 6 organizations
    cy.getByTestID('table-body').within(() => {
      cy.getByTestID('table-row').should('have.length', 6)
    })

    // filter the results by email
    cy.getByTestID('operator-resource--searchbar')
      .invoke('attr', 'placeholder')
      .should('contain', 'Filter organizations by id')

    cy.getByTestID('operator-resource--searchbar').type('678', {
      force: true,
      delay: 50,
    })
    cy.getByTestID('table-body').within(() => {
      cy.getByTestID('table-row').should('have.length', 1)
    })

    cy.getByTestID('operator-resource--searchbar')
      .clear()
      .type('invalid', {force: true, delay: 50})

    cy.getByTestID('empty-state--text').contains(
      'Looks like there were no organizations that matched your search'
    )
    cy.getByTestID('operator-resource--searchbar').clear()

    cy.getByTestID('accountTab').click()

    cy.location().should(loc => {
      expect(loc.pathname).to.eq('/operator/accounts')
    })

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

    // Validate that associated users appear
    // TODO(ariel): reenable this. Deleting the user seems to be causing issues with the data
    // cy.getByTestID('associated-users--table-body').within(() => {
    //   cy.getByTestID('table-row').should('have.length', 1)
    //   cy.getByTestID('remove-user--button').click()
    // })

    // // Remove the associated user
    // cy.getByTestID('remove-user--confirm-button').click()

    // // Confirm that the associated user was deleted
    // cy.getByTestID('empty-state').should('exist')

    cy.getByTestID('associated-orgs--title')
      .contains('Associated Organizations')
      .scrollIntoView()

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

    cy.getByTestID('overlay--header').contains('678')

    cy.getByTestID('limits-rate.readKBs--input')
      .clear()
      .type('666', {delay: 50})

    cy.getByTestID('org-overlay--submit-button').click()

    cy.getByTestID('account-view--back-button').click()

    // cy.getByTestID('operator-resource--searchbar').type('ariel', {
    //   force: true,
    //   delay: 50,
    // })

    // cy.getByTestID('account-id')
    //   .last()
    //   .within(() => {
    //     cy.get('a').click()
    //   })

    // cy.location().should(loc => {
    //   expect(loc.pathname).to.eq('/operator/accounts/3')
    // })

    // cy.getByTestID('account-delete--button').click()

    // cy.getByTestID('cf-icon alert-triangle cf-alert--icon').should('exist')

    // cy.getByTestID('delete-account--confirmation-button').click()

    // redirect the operator back to the operator page once deleting an account
    // cy.location().should(loc => {
    //   expect(loc.pathname).to.eq('/operator')
    // })

    // cy.getByTestID('operator-resource--searchbar').type('ariel', {
    //   force: true,
    //   delay: 50,
    // })

    // // confirm that the account has been deleted
    // cy.getByTestID('empty-state').should('exist')

    cy.getByTestID('orgTab').click()

    cy.getByTestID('org-id')
      .last()
      .within(() => {
        cy.get('a').click()
      })

    cy.location().should(loc => {
      expect(loc.pathname).to.eq('/operator/orgs/678')
    })

    cy.getByTestID('overlay--header').contains('678')

    cy.getByTestID('limits-rate.readKBs--input')
      .invoke('attr', 'value')
      .should('contain', '666')

    // should be able to view the operator link in the navbar
    cy.visit('/')
    cy.getByTestID('nav-item--operator').should('exist')
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
