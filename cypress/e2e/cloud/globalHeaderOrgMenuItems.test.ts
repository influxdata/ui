import {makeQuartzUseIDPEOrgID} from 'cypress/support/Utils'

const createOrgsFeatureFlags = {
  multiOrg: true,
  createDeleteOrgs: true,
}

describe('FREE: global header menu items test', () => {
  let idpeOrgID: string

  before(() => {
    cy.flush().then(() =>
      cy.signin().then(() => {
        cy.request({
          method: 'GET',
          url: 'api/v2/orgs',
        }).then(res => {
          // Store the IDPE org ID so that it can be cloned when intercepting quartz.
          if (res.body.orgs) {
            idpeOrgID = res.body.orgs[0].id
          }

          cy.setFeatureFlags(createOrgsFeatureFlags)
        })
      })
    )
  })

  beforeEach(() => {
    // Preserve one session throughout.
    Cypress.Cookies.preserveOnce('sid')

    makeQuartzUseIDPEOrgID(idpeOrgID)
    cy.visit('/').then(() => {
      cy.setFeatureFlags(createOrgsFeatureFlags)
    })
  })

  it('has add more organizations in menu items', () => {
    cy.getByTestID('globalheader--org-dropdown').should('exist').click()

    cy.getByTestID('globalheader--org-dropdown-main').should('be.visible')
    cy.getByTestID(
      'globalheader--org-dropdown-main-Add More Organizations'
    ).should('be.visible')
  })
})

describe('PAYG: global header menu items test', () => {
  let idpeOrgID: string

  before(() => {
    cy.flush().then(() =>
      cy.signin().then(() => {
        cy.request({
          method: 'GET',
          url: 'api/v2/orgs',
        }).then(res => {
          // Store the IDPE org ID so that it can be cloned when intercepting quartz.
          if (res.body.orgs) {
            idpeOrgID = res.body.orgs[0].id
          }

          Cypress.Cookies.preserveOnce('sid')
          cy.setFeatureFlags(createOrgsFeatureFlags)
        })
      })
    )
  })

  beforeEach(() => {
    makeQuartzUseIDPEOrgID(idpeOrgID, 'pay_as_you_go')
    cy.visit('/').then(() => {
      cy.setFeatureFlags(createOrgsFeatureFlags)
    })
  })

  it('PAYG: can check create organization menu item exists', () => {
    cy.getByTestID('globalheader--org-dropdown').should('exist').click()

    cy.getByTestID('globalheader--org-dropdown-main').should('be.visible')
    cy.getByTestID(
      'global-header--main-dropdown-item-Create Organization'
    ).should('be.visible')
  })
})

describe('Contract: global header menu items test', () => {
  let idpeOrgID: string

  before(() => {
    cy.flush().then(() =>
      cy.signin().then(() => {
        cy.request({
          method: 'GET',
          url: 'api/v2/orgs',
        }).then(res => {
          // Store the IDPE org ID so that it can be cloned when intercepting quartz.
          if (res.body.orgs) {
            idpeOrgID = res.body.orgs[0].id
          }

          Cypress.Cookies.preserveOnce('sid')
          cy.setFeatureFlags(createOrgsFeatureFlags)
        })
      })
    )
  })

  beforeEach(() => {
    makeQuartzUseIDPEOrgID(idpeOrgID, 'contract')
    cy.visit('/').then(() => {
      cy.setFeatureFlags(createOrgsFeatureFlags)
    })
  })

  it('Contract: can check create organization menu item exists', () => {
    cy.getByTestID('globalheader--org-dropdown').should('exist').click()

    cy.getByTestID('globalheader--org-dropdown-main').should('be.visible')
    cy.getByTestID(
      'global-header--main-dropdown-item-Create Organization'
    ).should('be.visible')
  })
})
