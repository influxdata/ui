describe('Home Page Tests', () => {
  // Create tests for the home page. Issue: https://github.com/influxdata/ui/issues/939
  beforeEach(() => {
    cy.flush()
    cy.signin()
  })

  it('loads home page', () => {
    cy.getByTestID('home-page--header').should('exist')
  })

  it('should verify the load data elements when page is loaded', () => {
    // confirm navigation is open with retries due to flakiness
    const retries = 5
    for (let i = 0; i < retries; i++) {
      cy.get('[data-testid="tree-nav"]').then($el => {
        // expand the navigation so we don't deal with hover menus
        if ($el[0].className.includes('cf-tree-nav__collapsed')) {
          // still collapsed, click the expand button again
          cy.log(
            `tree-nav is still collapsed, trying to expand again with ${
              retries - i
            } attempts remaining...`
          )
          cy.get('.cf-tree-nav--toggle').should('be.visible')
          cy.get('.cf-tree-nav--toggle').click()
        } else {
          // navigation is expanded, exit loop.
          // we can't use 'break' here because we're inside a callback function.
          i = retries
          cy.log('tree-nav is expanded, continuing...')
        }
      })
    }

    // open the Load Data submenu inline
    cy.get('[data-testid="nav-item-load-data"]').should('be.visible')
    cy.get('[data-testid="nav-item-load-data"]').click()

    // go to the buckets page
    cy.get('[data-testid="nav-subitem-buckets"]').should('be.visible')
    cy.get('[data-testid="nav-subitem-buckets"]').click()
    cy.url().then(url => {
      // let the page load before asserting
      cy.get('.cf-tree-nav--toggle').should('be.visible')
      expect(url).to.include('/load-data/buckets')
    })

    // tabs
    cy.get('[id="sources"]').should('be.visible')
    cy.get('[id="buckets"]').should('be.visible')
    cy.get('[id="telegrafs"]').should('be.visible')
    cy.get('[id="tokens"]').should('be.visible')

    // go to the buckets tab
    cy.get('[data-testid="buckets--tab"]').should('be.visible')
    cy.get('[data-testid="buckets--tab"]').click()

    // buckets tab - actions
    cy.get('[data-testid="search-widget"]').should('be.visible')
    cy.get('[data-testid="resource-sorter--button"]').should('be.visible')
    // this text is contained within the <bucket> element, meaning the button exists and is visible
    cy.contains('Create Bucket')

    // system buckets
    cy.get('[data-testid="search-widget"]').type('_') // system buckets start with '_' so we can filter it
    cy.get('[data-testid="bucket--card--name _monitoring"]')
      .scrollIntoView()
      .should('be.visible')
    cy.get('[data-testid="bucket--card--name _tasks"]')
      .scrollIntoView()
      .should('be.visible')

    // The Walkme overlay has three buttons on it, and the last one queried is the close button.
    // Close the overlay if it's there.
    cy.get('body').then($body => {
      if ($body.find('.wm-visual-design-button').length) {
        cy.get('.wm-visual-design-button').last().click()
      }
    })
  })
})
