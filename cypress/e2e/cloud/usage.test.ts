import {Organization} from '../../../src/types'

const statHeaders = [
  'Data In (MB)',
  'Query Count',
  'Storage (GB-hr)',
  'Data Out (GB)',
]

describe('Usage Page Free User No Data', () => {
  beforeEach(() => {
    cy.flush().then(() =>
      cy.signin().then(() => {
        cy.get('@org').then(({id}: Organization) => {
          cy.quartzProvision({
            hasData: false,
            accountType: 'free',
          }).then(() => {
            cy.visit(`/orgs/${id}/usage`)
            cy.getByTestID('usage-page--header').should('be.visible')
          })
        })
      })
    )
  })

  it('should display the usage page common features', () => {
    // Display the upgrade button when the user is a free user
    cy.get('.cf-page-header--fixed')
      .children()
      .should('have.length', 2)
    cy.getByTestID('cloud-upgrade--button').should('be.visible')

    // Check that the stat headers render correctly
    cy.getByTestID('usage-single-stat--header').each((child, index) => {
      expect(child.text().trim()).to.equal(statHeaders[index])
    })

    cy.getByTestID('usage-header--timerange').contains('Usage Past 24h')

    // Checks the daterange picker updates the usage graph title
    cy.getByTestID('usage-timerange--selected').within(() => {
      cy.contains('Past 24h')
    })

    // Check that no data is returned for the existing data set with the current time range for either graph
    cy.getByTestID('empty-graph--no-results')
      .should('have.length', 6)
      .each(child => {
        expect(child.text().trim()).to.equal('No Results')
      })

    cy.getByTestID('usage-timerange--dropdown').click()
    cy.getByTestID('dropdown-item-past7d').click()
    cy.getByTestID('usage-timerange--selected').within(() => {
      cy.contains('Past 7d')
    })
    cy.getByTestID('usage-header--timerange').contains('Usage Past 7d')

    cy.getByTestID('usage-timerange--dropdown').click()
    cy.getByTestID('dropdown-item-past30d').click()
    cy.getByTestID('usage-timerange--selected').within(() => {
      cy.contains('Past 30d')
    })
    cy.getByTestID('usage-header--timerange').contains('Usage Past 30d')

    // Check that no data is returned for the existing data set with the current time range for either graph
    cy.getByTestID('empty-graph--no-results')
      .should('have.length', 6)
      .each(child => {
        expect(child.text().trim()).to.equal('No Results')
      })

    // Usage Stats Graph Header
    cy.getByTestID('usage-xy-graph--header')
      .first()
      .contains(statHeaders[0])

    // Rate Limit Graph Header
    cy.getByTestID('usage-xy-graph--header')
      .last()
      .contains('Limit Events')

    // The usage page dropdown
    cy.getByTestID('usage-page--dropdown')
      .contains('Data In')
      .click()
    cy.getByTestID('dropdown-item')
      .should('have.length', 4)
      .last()
      .contains('Data Out')
      .click({force: true})

    cy.getByTestID('usage-page--dropdown').contains('Data Out')
    // Make sure that the Usage Stats Header changed
    cy.getByTestID('usage-xy-graph--header')
      .first()
      .contains(statHeaders[3])

    // Make sure the Rate Limit Graph Header stays the same
    cy.getByTestID('usage-xy-graph--header')
      .last()
      .contains('Limit Events')

    // Check that the rate limits header also reflects the selected timerange
    cy.getByTestID('rate-limits-header--timerange')
      .scrollIntoView()
      .contains('Rate Limits Past 30d')
  })
})

describe('Usage Page PAYG With Data', () => {
  beforeEach(() => {
    cy.flush().then(() =>
      cy.signin().then(() => {
        cy.get('@org').then(({id}: Organization) => {
          cy.quartzProvision({
            hasData: true,
            accountType: 'pay_as_you_go',
          }).then(() => {
            cy.visit(`/orgs/${id}/usage`)
            cy.getByTestID('usage-page--header').should('be.visible')
          })
        })
      })
    )
  })

  it('should display the usage page with data for a PAYG user', () => {
    // The implication here is that there is no Upgrade Now button
    cy.get('.cf-page-header--fixed')
      .children()
      .should('have.length', 1)

    const stats = ['0.78 MB', '32,424', '2.06 GB-hr', '0.01 GB']

    // Check that the stats are returned and rendered for a user with data
    cy.getByTestID('giraffe-layer-single-stat')
      .should('have.length', 4)
      .each((child, index) => {
        expect(child.text().trim()).to.be.oneOf([
          stats[index],
          stats[index].replace(',', ''),
        ])
      })

    // Check that no data is returned for the existing data set with the current time range for either graph
    cy.getByTestID('empty-graph--no-results')
      .should('have.length', 2)
      .each(child => {
        expect(child.text().trim()).to.equal('No Results')
      })

    // Select the past 30d to render data for the usage stats and the rate limits
    cy.getByTestID('usage-timerange--dropdown').click()
    cy.getByTestID('dropdown-item-past30d').click()
    cy.getByTestID('usage-timerange--selected').within(() => {
      cy.contains('Past 30d')
    })

    // Check to see that data is being mapped for rate limits and usage based on the new time range
    cy.getByTestID('giraffe-layer-line').should('have.length', 2)
  })
})
