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

interface SetupParams {
  accountType: string
  canCreateOrgs: boolean
  urlToVisit?: string
}

const setupTest = (setupParams: SetupParams) => {
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
        const {accountType, canCreateOrgs, urlToVisit} = setupParams

        makeQuartzUseIDPEOrgID(idpeOrgID, accountType)

        // Intercept requests to /clusters and /accounts/:accountId/orgs and replace with a fixture.
        cy.intercept('GET', 'api/v2/quartz/clusters', {
          fixture: 'createOrg/clusters',
        }).as('getClusters')

        cy.intercept('GET', 'api/v2/quartz/accounts/416/orgs', {
          fixture: 'createOrg/orgsBaseState',
        }).as('getOrgs')

        let fixtureName: string
        if (accountType === 'free') {
          fixtureName = canCreateOrgs
            ? 'createOrg/allowanceFreeTrue'
            : 'createOrg/allowanceFreeFalse'
        } else if (accountType === 'pay_as_you_go') {
          fixtureName = canCreateOrgs
            ? 'createOrg/allowancePAYGTrue'
            : 'createOrg/allowancePAYGFalse'
        } else {
          fixtureName = canCreateOrgs
            ? 'createOrg/allowanceContractTrue'
            : 'createOrg/allowanceContractFalse'
        }

        // Replace the current org creation allowance with a fixture.
        getOrgCreationAllowance(fixtureName)

        // If a url is specified, start the test at that url.
        if (urlToVisit) {
          cy.visit(`orgs/${idpeOrgID}/` + urlToVisit)
        } else {
          cy.visit('/')
        }
      })
    })
  )
}

describe('Free account', () => {
  it('by default, cant create orgs: displays the `add more organizations` upgrade button, which takes user to checkout', () => {
    setupTest({accountType: 'free', canCreateOrgs: false})

    clickUpgradeButton()

    cy.url().should('include', '/checkout')
  })

  it('can create new orgs, if the free account allowance is increased', () => {
    setupTest({accountType: 'free', canCreateOrgs: true})

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
      cy.getByTestID('account--organizations-tab-orgs-card')
        .contains(newOrgName)
        .parents('[data-testid=account--organizations-tab-orgs-card]')
        .within(() => {
          cy.contains('GCP')
          cy.contains('iowa-local')
          cy.contains('Iowa')
        })
    })
  })
})

describe('PAYG account', () => {
  it('can create new orgs, if there are orgs left in the quota', () => {
    setupTest({accountType: 'pay_as_you_go', canCreateOrgs: true})

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
      cy.getByTestID('account--organizations-tab-orgs-card')
        .contains(newOrgName)
        .parents('[data-testid=account--organizations-tab-orgs-card]')
        .within(() => {
          cy.contains('Azure')
          cy.contains('azure-local')
          cy.contains('azure-local region')
        })
    })
  })

  it('cant create an org with the same name as another org in the account', () => {
    setupTest({accountType: 'pay_as_you_go', canCreateOrgs: true})

    clickCreateOrgButton()

    tryCreatingDuplicateOrg()
  })

  it('must upgrade the account using the marketo form, if there are no orgs left in the quota', () => {
    setupTest({accountType: 'pay_as_you_go', canCreateOrgs: false})

    clickUpgradeButton()

    testMarketoForm()
  })
})

describe('CONTRACT account: org creation', () => {
  it('can create new orgs, if orgs in quota', () => {
    setupTest({accountType: 'contract', canCreateOrgs: true})
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
      cy.getByTestID('account--organizations-tab-orgs-card')
        .contains(newOrgName)
        .parents('[data-testid=account--organizations-tab-orgs-card]')
        .within(() => {
          cy.contains('AWS')
          cy.contains('aws-local')
          cy.contains('aws-local region')
        })
    })
  })

  it('cant create an org with the same name as another org in the account', () => {
    setupTest({accountType: 'contract', canCreateOrgs: true})
    clickCreateOrgButton()

    tryCreatingDuplicateOrg()
  })

  it('must upgrade using marketo form, if no more orgs in quota, which is  accessible only from the organization list page in contract accounts', () => {
    setupTest({
      accountType: 'contract',
      canCreateOrgs: false,
      urlToVisit: 'accounts/orglist',
    })

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
