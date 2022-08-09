import {Organization} from '../../../src/types'

describe('Home Page Tests', () => {
  beforeEach(() =>
    cy.flush().then(() =>
      cy.signin().then(() => {
        cy.get('@org').then(() => {
          cy.getByTestID('home-page--header').should('be.visible')
          cy.setFeatureFlags({
            alertsActivity: true,
          }).then(() => cy.getByTestID('nav-item-flows').should('be.visible'))
        })
      })
    )
  )

  // this test isn't compatible with remocal because dex is hosted at a different domain and Cypress complains.
  // skipping for now until we can find an alternative way to test this functionality (or change where dex is hosted)
  it.skip('should redirect the user back home when trying to access the /login route directly with a valid session', () => {
    cy.visit('/login')
    cy.location().should(loc => {
      expect(loc.pathname).to.not.eq('/login')
    })
  })

  it('should load empty Alerts Activity dashboard', () => {
    cy.getByTestID('alerts-activity')
      .scrollIntoView()
      .should('be.visible')
    cy.getByTestID('alerts-activity-table-container')
      .find('.event-row')
      .should('have.length', 0)
  })

  it('should populate and load populated Alerts Activity dashboard', () => {
    const mockResponse = `#group,false,false,false,false,false,false,false
#datatype,string,long,dateTime:RFC3339,string,string,string,string
#default,_result,,,,,,
,result,table,time,checkMessage,checkID,checkName,level
,,0,2021-08-05T20:54:31.642101603Z,Beta,07f2055f7cb8f000,Beta,crit
,,0,2021-08-05T20:54:31.642101603Z,Alpha,07f205512a38f000,Alpha,ok
,,0,2021-08-05T20:54:00Z,Check: Beta is: ok,07f2055f7a12d000,Beta,ok`

    cy.get('@org').then(({id}: Organization) => {
      cy.intercept('POST', `/api/v2/query?orgID=${id}`, req => {
        if (req.body.query.includes('r._measurement == "statuses"')) {
          req.alias = 'statusesQuery'

          req.reply(mockResponse)
        }
      })
      cy.getByTestID('tree-nav--header').click()
      cy.wait('@statusesQuery')

      cy.getByTestID('alerts-activity')
        .scrollIntoView()
        .should('be.visible')
      cy.getByTestID('alerts-activity-table-container')
        .find('.event-row')
        .should('have.length.gte', 3)
    })
  })
})
