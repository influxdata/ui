import {makeQuartzUseIDPEOrgID} from 'cypress/support/Utils'
import {Organization} from 'src/client'

const deleteOrgsFeatureFlags = {
  createDeleteOrgs: true,
}

// This variable stores the current IDPE orgid and syncs it with the quartz-mock orgid.
let idpeOrgID: string

const spoofStorageType = (storageType: Organization['defaultStorageType']) => {
  cy.intercept('GET', 'api/v2/orgs', req => {
    req.continue(res => {
      res.body.orgs[0].defaultStorageType = storageType
      res.send(res)
    })
  })
}

const getOrgCreationAllowance = (allowanceFixture: string) => {
  cy.intercept('GET', 'api/v2/quartz/allowances/orgs/create', {
    fixture: allowanceFixture,
  }).as('getAllowancesOrgsCreate')
}

interface SetupParams {
  accountType: string
  canCreateOrgs: boolean
  orgHasOtherUsers: boolean
  orgCount?: number
  orgIsSuspendable?: boolean
}

const setupTest = (setupParams: SetupParams) => {
  cy.flush().then(() =>
    cy.signin().then(() => {
      cy.setFeatureFlags(deleteOrgsFeatureFlags)
      cy.request({
        method: 'GET',
        url: 'api/v2/orgs',
      }).then(res => {
        // Store the IDPE org ID so that it can be cloned when intercepting quartz.
        if (res.body.orgs) {
          idpeOrgID = res.body.orgs[0].id
        }
        const {
          accountType,
          canCreateOrgs,
          orgHasOtherUsers,
          orgCount,
          orgIsSuspendable,
        } = setupParams

        if (orgHasOtherUsers) {
          cy.intercept('GET', `api/v2/quartz/orgs/${idpeOrgID}/users`, {
            body: [
              {
                id: '234234324',
                firstName: 'User',
                lastName: 'McUserface',
                email: 'user@influxdata.com',
                role: 'owner',
              },
              {
                id: '234234234324',
                firstName: 'Josh',
                lastName: 'Ritter',
                email: 'josh@influxdata.com',
                role: 'owner',
              },
            ],
          })
        }

        makeQuartzUseIDPEOrgID(
          idpeOrgID,
          accountType,
          orgCount,
          orgIsSuspendable
        )

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

        getOrgCreationAllowance(fixtureName)

        cy.visit(`orgs/${idpeOrgID}/org-settings`)
      })
    })
  )
}

const createOrg = (accountType: string) => {
  cy.getByTestID('delete-org--button').should('be.visible').click()

  cy.getByTestID('popover--contents')
    .should('be.visible')
    .contains('cannot be deleted')

  cy.get('.delete-org-panel--create-org-link').should('be.visible').click()

  cy.getByTestID('create-org-overlay--createorg-input')
    .should('be.visible')
    .click()
    .type('New Test Org')

  if (accountType === 'pay_as_you_go') {
    cy.intercept('GET', 'api/v2/quartz/accounts/416/orgs', {
      fixture: 'createOrg/orgsUpdatedStatePAYG',
    }).as('getOrgs')

    cy.intercept('POST', 'api/v2/quartz/orgs', {
      fixture: 'createOrg/orgPAYG',
    }).as('postOrg')
  } else {
    cy.intercept('GET', 'api/v2/quartz/accounts/416/orgs', {
      fixture: 'createOrg/orgsUpdatedStateContract',
    }).as('getOrgs')

    cy.intercept('POST', 'api/v2/quartz/orgs', {
      fixture: 'createOrg/orgContract',
    }).as('postOrg')
  }

  cy.getByTestID('create-org-form--submit').should('be.visible').click()

  cy.wait('@getOrgs').then(() => {
    cy.getByTestID('notification-success')
      .should('be.visible')
      .contains('created')
    cy.url().should('contain', 'orglist')
  })
}

const deleteOrg = () => {
  cy.getByTestID('delete-org--button').should('be.visible').click()
  cy.get('.org-delete-overlay--conditions-instruction').within(() => {
    cy.get('.cf-input--checkbox').click()
  })

  cy.fixture('multiOrgOrgs1').then(orgResponse => {
    orgResponse = orgResponse[0]

    cy.intercept('DELETE', 'api/v2/quartz/orgs/**', orgResponse).as('deleteOrg')
  })

  cy.getByTestID('create-org-form-submit').click()
  cy.getByTestID('notification-success').contains('will be deleted')
}

const displayRemoveUsersWarning = () => {
  cy.getByTestID('delete-org--button').should('exist').click()

  cy.getByTestID('notification-warning')
    .should('exist')
    .contains('All additional users must be removed')

  cy.getByTestID('go-to-users--link').click()

  cy.url().should('include', `/members`)
}

const displayOtherUsersWarning = () => {
  cy.getByTestID('delete-org--button').should('be.visible').click()
  cy.get('.org-delete-overlay--warning-message').within(() => {
    cy.contains('a', 'users in this organization').click()
    cy.url().should('include', `/members`)
  })
}

const upgradeAccount = () => {
  cy.getByTestID('delete-org--button').should('be.visible').click()
  cy.getByTestID('popover--dialog')
    .should('be.visible')
    .contains(
      'cannot be deleted because it is your last accessible organization in this account.'
    )
  cy.get('.delete-org-panel--create-org-link').should('be.visible').click()

  // Do not remove this intercept unless the tests that use this function are removed in their entirety.
  // POST requests to this URL must remain blocked so that our e2e tests do not generate real Marketo leads.
  cy.intercept('POST', `https://get.influxdata.com/**`, {
    formID: '2826',
    followUpUrl: null,
    aliId: 'Fake ID',
  }).as('marketoResponse')

  // This wait is needed to provide a buffer in which third party marketo scripts can be loaded.
  // We can't wait on an aliased route since we don't know with certainty what URLs the third party script may use.
  cy.wait(2000)

  cy.getByTestID('marketo-upgrade-account-overlay--header')
    .should('be.visible')
    .contains('Upgrade Your Account')

  cy.getByTestID('marketo-account-upgrade-form--userinput')
    .should('be.visible')
    .type('Internal InfluxData End to End Test.')

  cy.getByTestID('create-org-form-submit').should('be.visible').click()

  // Disabling this temporarily - 8/14/23 - unblock CI while
  // tracking down issues with the third-party script.
  // cy.wait('@marketoResponse').then(res => {
  //   // If this fails, it likely indicates a need to update MarketoAccountUpgradeOverlay.tsx, or the Marketo form.
  //   expect(res?.response?.body.formID).to.equal('2826')
  // })

  cy.getByTestID('notification-success')
    .should('be.visible')
    .contains('Your account upgrade inquiry has been submitted.')
}

describe('Storage types', () => {
  it('identifies the storage type as iox in an iox org', () => {
    spoofStorageType('iox')
    setupTest({
      accountType: 'pay_as_you_go',
      canCreateOrgs: true,
      orgHasOtherUsers: false,
    })

    cy.getByTestID('org-profile--labeled-data').within(() => {
      cy.getByTestID('heading').contains('Storage Type')
      cy.contains('IOx')
    })
  })

  it('identifies the storage type as tsm in a tsm org', () => {
    spoofStorageType('tsm')
    setupTest({
      accountType: 'contract',
      canCreateOrgs: false,
      orgHasOtherUsers: true,
    })
    cy.getByTestID('org-profile--labeled-data').within(() => {
      cy.getByTestID('heading').contains('Storage Type')
      cy.contains('TSM')
    })
  })
})

describe('Free account', () => {
  it('displays a `must remove users` warning if trying to delete an org with multiple users in a multi-org free account', () => {
    setupTest({
      accountType: 'free',
      canCreateOrgs: false,
      orgHasOtherUsers: true,
      orgCount: 5,
      orgIsSuspendable: true,
    })

    displayRemoveUsersWarning()
  })

  it('allows the user to delete an org if there are other orgs in the free account, and they are the only user in the current org', () => {
    setupTest({
      accountType: 'free',
      canCreateOrgs: false,
      orgHasOtherUsers: false,
      orgCount: 5,
      orgIsSuspendable: true,
    })

    deleteOrg()
  })
})

describe('PAYG Account', () => {
  it('requests that the user upgrade their account if trying to delete the last org in the account, and no more orgs can be created', () => {
    setupTest({
      accountType: 'pay_as_you_go',
      canCreateOrgs: false,
      orgHasOtherUsers: false,
      orgIsSuspendable: false,
    })

    upgradeAccount()
  })

  it('requests that the user create a new org if trying to delete the last org in the account, but more orgs can be created', () => {
    setupTest({
      accountType: 'pay_as_you_go',
      canCreateOrgs: true,
      orgHasOtherUsers: false,
      orgIsSuspendable: false,
    })

    createOrg('pay_as_you_go')
  })

  it('when deleting an org with multiple users in a multi-org payg account, delete org overlay shows how many other users the org has and clicking it takes user to /members page', () => {
    setupTest({
      accountType: 'pay_as_you_go',
      canCreateOrgs: false,
      orgHasOtherUsers: true,
      orgIsSuspendable: true,
    })

    displayOtherUsersWarning()
  })

  it('allows the user to delete an org if there are other orgs in the account, and they are the only user in the current org', () => {
    setupTest({
      accountType: 'pay_as_you_go',
      canCreateOrgs: false,
      orgHasOtherUsers: false,
      orgIsSuspendable: true,
    })

    deleteOrg()
  })
})

describe('Contract Account', () => {
  it('requests that the user upgrade their account if trying to delete the last org in the account, and no more orgs can be created', () => {
    setupTest({
      accountType: 'contract',
      canCreateOrgs: false,
      orgHasOtherUsers: false,
      orgIsSuspendable: false,
    })

    upgradeAccount()
  })

  it('requests that the user create a new org if trying to delete the last org in the account, but more orgs can be created', () => {
    setupTest({
      accountType: 'contract',
      canCreateOrgs: true,
      orgHasOtherUsers: false,
      orgIsSuspendable: false,
    })

    createOrg('contract')
  })

  it('when deleting an org with multiple users in a multi-org contract account, delete org overlay shows how many other users the org has and clicking it takes user to /members page ', () => {
    setupTest({
      accountType: 'contract',
      canCreateOrgs: false,
      orgHasOtherUsers: true,
      orgIsSuspendable: true,
    })

    displayOtherUsersWarning()
  })

  it('allows the user to delete an org if there are other orgs in the account, and they are the only user in the current org', () => {
    setupTest({
      accountType: 'contract',
      canCreateOrgs: false,
      orgHasOtherUsers: false,
      orgIsSuspendable: true,
    })

    deleteOrg()
  })
})
