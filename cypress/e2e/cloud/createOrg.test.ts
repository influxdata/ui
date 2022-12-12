import {makeQuartzUseIDPEOrgID} from 'cypress/support/Utils'

const createOrgsFeatureFlags = {
  createDeleteOrgs: true,
}

const newOrgName = 'A New Org'

// This variable stores the current IDPE orgid and syncs it with the quartz-mock orgid.
let idpeOrgID: string

const getOrgCreationAllowance = (allowanceFixture: string) => {
  cy.intercept('GET', 'api/v2/quartz/allowances/orgs/create', {
    fixture: allowanceFixture,
  }).as('getAllowancesOrgsCreate')
}

const clickCreateOrgButton = () => {
  cy.getByTestID('globalheader--org-dropdown').should('exist').click()

  cy.getByTestID('globalheader--org-dropdown-main').should('be.visible')
  cy.getByTestID('global-header--main-dropdown-item-Create Organization')
    .should('be.visible')
    .click()
  cy.getByTestID('create-org-overlay--header').contains(
    'Create an Organization'
  )
}

const clickUpgradeButton = () => {
  cy.getByTestID('globalheader--org-dropdown').should('exist').click()
  cy.getByTestID('globalheader--org-dropdown-main').should('be.visible')
  cy.getByTestID('globalheader--org-dropdown-main-Add More Organizations')
    .should('be.visible')
    .click()
}

const tryCreatingDuplicateOrg = () => {
  cy.getByTestID('create-org-overlay--createorg-input')
    .should('be.visible')
    .click()
    .type('E2E Test Organization')

  cy.getByTestID('form--element-error')
    .should('be.visible')
    .contains(
      'This organization name already exists. Please choose a different name'
    )

  cy.getByTestID('create-org-form--submit').should(
    'have.class',
    'cf-button--disabled'
  )
}

const testMarketoForm = () => {
  // This intercept is important to ensure we don't actually POST the form contents.
  cy.intercept('POST', `https://get.influxdata.com/**`, {
    formID: '2826',
    followUpUrl: null,
    aliId: 'Fake ID',
  }).as('marketoResponse')

  cy.wait(2000)

  cy.getByTestID('marketo-account-upgrade-form--userinput')
    .should('be.visible')
    .type('Internal InfluxData End to End Test.')

  cy.getByTestID('create-org-form-submit').should('be.visible').click()

  cy.wait('@marketoResponse').then(res => {
    expect(res?.response?.body.formID).to.equal('2826')
  })

  cy.getByTestID('notification-success')
    .should('be.visible')
    .contains('Your account upgrade inquiry has been submitted.')
}

const testProviderCards = () => {
  cy.getByTestID('create-org-overlay--select-Azure-card')
    .should('be.visible')
    .click()
  cy.getByTestID('create-org-overlay--select-Azure-card').should(
    'have.class',
    'selected'
  )

  cy.getByTestID('create-org-overlay--select-AWS-card')
    .should('be.visible')
    .click()
  cy.getByTestID('create-org-overlay--select-AWS-card').should(
    'have.class',
    'selected'
  )

  cy.getByTestID('create-org-overlay--select-GCP-card')
    .should('be.visible')
    .click()
  cy.getByTestID('create-org-overlay--select-GCP-card').should(
    'have.class',
    'selected'
  )
}

const setupTest = () => {
  cy.flush().then(() =>
    cy.signin().then(() => {
      cy.setFeatureFlags(createOrgsFeatureFlags)
      cy.request({
        method: 'GET',
        url: 'api/v2/orgs',
      }).then(res => {
        // Store the IDPE org ID so that it can be cloned when intercepting quartz.
        if (res.body.orgs) {
          idpeOrgID = res.body.orgs[0].id
        }

        cy.intercept('GET', 'api/v2/quartz/clusters', {
          fixture: 'createOrg/clusters',
        }).as('getClusters')
      })
    })
  )
}

beforeEach(() => {
  setupTest()
})

describe('Free account', () => {
  beforeEach(() => {
    makeQuartzUseIDPEOrgID(idpeOrgID, 'free')
    cy.visit('/')
  })

  it('by default, cant create orgs: displays the `add more organizations` upgrade button, which takes user to checkout', () => {
    getOrgCreationAllowance('createOrg/allowanceFreeFalse')
    cy.visit('/')

    clickUpgradeButton()

    cy.url().should('include', '/checkout')
  })

  it('can create new orgs, if the free account allowance is increased', () => {
    getOrgCreationAllowance('createOrg/allowanceFreeTrue')
    cy.visit('/')

    clickCreateOrgButton()

    cy.getByTestID('create-org-overlay--createorg-input')
      .should('be.visible')
      .click()
      .type(newOrgName)

    testProviderCards()

    cy.getByTestID('create-org-overlay--select-GCP-card')
      .should('be.visible')
      .click()
    cy.getByTestID('create-org-overlay--select-GCP-card').should(
      'have.class',
      'selected'
    )
    cy.getByTestID('region-list-dropdown--button').should('be.visible').click()

    cy.getByTestID('region-list-dropdown')
      .should('be.visible')
      .contains('Iowa')
      .click()

    cy.intercept('GET', 'api/v2/quartz/accounts/416/orgs', {
      fixture: 'createOrg/orgsUpdatedStateFree',
    }).as('getOrgs')

    cy.intercept('POST', 'api/v2/quartz/orgs', {
      fixture: 'createOrg/orgFree',
    }).as('postOrg')

    cy.getByTestID('create-org-form--submit').should('be.visible').click()

    cy.wait('@getOrgs').then(() => {
      cy.getByTestID('notification-success')
        .should('be.visible')
        .contains('created')
      cy.url().should('contain', 'orglist')
      cy.getByTestID('account--organizations-tab-orgs-card').within(() => {
        cy.contains(newOrgName)
      })
    })
  })
})

describe('PAYG account', () => {
  beforeEach(() => {
    makeQuartzUseIDPEOrgID(idpeOrgID, 'pay_as_you_go')

    cy.intercept('GET', 'api/v2/quartz/accounts/416/orgs', {
      fixture: 'createOrg/orgsBaseState',
    }).as('getOrgs')

    cy.visit('/')
  })

  it('can create new orgs, if there are orgs left in the quota', () => {
    getOrgCreationAllowance('createOrg/allowancePAYGTrue')
    cy.visit('/')

    clickCreateOrgButton()

    cy.getByTestID('create-org-overlay--createorg-input')
      .should('be.visible')
      .click()
      .type(newOrgName)

    testProviderCards()

    cy.getByTestID('create-org-overlay--select-Azure-card')
      .should('be.visible')
      .click()
    cy.getByTestID('create-org-overlay--select-Azure-card').should(
      'have.class',
      'selected'
    )
    cy.getByTestID('region-list-dropdown--button').should('be.visible').click()

    cy.getByTestID('region-list-dropdown')
      .should('be.visible')
      .contains('Amsterdam')
      .click()

    cy.intercept('GET', 'api/v2/quartz/accounts/416/orgs', {
      fixture: 'createOrg/orgsUpdatedStatePAYG',
    }).as('getOrgs')

    cy.intercept('POST', 'api/v2/quartz/orgs', {
      fixture: 'createOrg/orgPAYG',
    }).as('postOrg')

    cy.getByTestID('create-org-form--submit').should('be.visible').click()

    cy.wait('@getOrgs').then(() => {
      cy.getByTestID('notification-success')
        .should('be.visible')
        .contains('created')
      cy.url().should('contain', 'orglist')
      cy.getByTestID('account--organizations-tab-orgs-card').within(() => {
        cy.contains(newOrgName)
      })
    })
  })

  it('cant create an org with the same name as another org in the account', () => {
    getOrgCreationAllowance('createOrg/allowancePAYGTrue')
    cy.visit('/')

    clickCreateOrgButton()

    tryCreatingDuplicateOrg()
  })

  it('must upgrade the account using the marketo form, if there are no orgs left in the quota', () => {
    getOrgCreationAllowance('createOrg/allowancePAYGFalse')
    cy.visit('/')

    clickUpgradeButton()

    testMarketoForm()
  })
})

describe('CONTRACT account: org creation', () => {
  beforeEach(() => {
    makeQuartzUseIDPEOrgID(idpeOrgID, 'contract')

    cy.intercept('GET', 'api/v2/quartz/accounts/416/orgs', {
      fixture: 'createOrg/orgsBaseState',
    }).as('getOrgs')

    cy.visit('/')
  })

  it('can create new orgs, if orgs in quota', () => {
    getOrgCreationAllowance('createOrg/allowanceContractTrue')
    cy.visit('/')

    clickCreateOrgButton()

    cy.getByTestID('create-org-overlay--createorg-input')
      .should('be.visible')
      .click()
      .type(newOrgName)

    testProviderCards()

    cy.getByTestID('create-org-overlay--select-AWS-card')
      .should('be.visible')
      .click()
    cy.getByTestID('create-org-overlay--select-AWS-card').should(
      'have.class',
      'selected'
    )

    cy.getByTestID('region-list-dropdown--button').should('be.visible').click()
    cy.getByTestID('region-list-dropdown').contains('US West (Oregon)').click()

    cy.intercept('POST', 'api/v2/quartz/orgs', {
      fixture: 'createOrg/orgContract',
    }).as('orgContract')

    cy.intercept('GET', 'api/v2/quartz/accounts/416/orgs', {
      fixture: 'createOrg/orgsUpdatedStateContract',
    }).as('getOrgs')

    cy.getByTestID('create-org-form--submit').should('be.visible').click()

    cy.wait('@orgContract').then(() => {
      cy.getByTestID('notification-success')
        .should('be.visible')
        .contains('created')
      cy.url().should('contain', 'orglist')
      cy.getByTestID('account--organizations-tab-orgs-card').within(() => {
        cy.contains(newOrgName)
      })
    })
  })

  it('cant create an org with the same name as another org in the account', () => {
    getOrgCreationAllowance('createOrg/allowanceContractTrue')
    cy.visit('/')

    clickCreateOrgButton()

    tryCreatingDuplicateOrg()
  })

  it('must upgrade using marketo form, if no more orgs in quota, which is  accessible only from the organization list page in contract accounts', () => {
    getOrgCreationAllowance('createOrg/allowanceContractFalse')
    cy.visit('/')

    cy.visit(`/orgs/${idpeOrgID}/accounts/orglist`)

    cy.getByTestID('globalheader--org-dropdown').should('exist').click()
    cy.getByTestID('globalheader--org-dropdown-main').should('be.visible')
    /* 'Upgrade' button in the dropdown doesn't show in contract accounts
     at their org limit, to avoid annoying a customer that has already upgraded.
     In contract orgs, the upgrade link appears only on the organization list page. */

    cy.getByTestID(
      'globalheader--org-dropdown-main-Add More Organizations'
    ).should('not.exist')

    cy.getByTestID('globalheader--org-dropdown').should('be.visible').click()

    cy.getByTestID('account-settings-page-org-tab--upgrade-banner-text')
      .should('be.visible')
      .click()

    // Not targeting by testID because standard anchor tags don't have that property.
    cy.get('.account-settings-page-org-tab--quota-limit-link')
      .should('be.visible')
      .click()

    testMarketoForm()
  })
})
