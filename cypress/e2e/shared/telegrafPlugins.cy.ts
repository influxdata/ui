import {Organization} from '../../../src/types'

describe('Sources > Telegraf Plugins', () => {
  beforeEach(() => {
    cy.flush()
    cy.signin()
    cy.get('@org').then(({id}: Organization) =>
      cy.fixture('routes').then(({orgs, sources}) => {
        cy.visit(`${orgs}/${id}${sources}`)
        cy.getByTestID('tree-nav')
      })
    )
  })

  it('can create a new telegraf configuration and a new bucket from a plugin', () => {
    const examplePlugin = 'aerospike'
    const configurationName = 'test configuration name'
    const bucketName = 'test configuration create new bucket'

    cy.getByTestID('sources-telegraf-plugins').should('exist')
    cy.getByTestID(`load-data-item ${examplePlugin}`).click()
    cy.getByTestID('add-plugin-to-configuration--dropdown')
      .should('be.visible')
      .click()
    cy.getByTestID('create-new-configuration-from-plugin--dropdown-item')
      .should('be.visible')
      .click()
    cy.getByTestID('plugin-create-configuration-options-input--name')
      .should('be.visible')
      .click()
      .clear()
      .type(configurationName)
    cy.getByTestID('plugin-create-configuration-options--select-bucket').click()
    cy.get('#create-a-bucket').click()
    cy.getByTestID('plugin-create-configuration-add-bucket--form').should(
      'be.visible'
    )
    cy.getByTestID('bucket-form-submit').should('be.disabled')
    cy.getByTestID('bucket-form-name').click().clear().type(bucketName)
    cy.getByTestID('bucket-form-submit').should('not.be.disabled').click()
    cy.getByTestID('plugin-create-configuration-options--select-bucket').within(
      () => {
        cy.get('span.cf-dropdown--selected').contains(bucketName)
      }
    )
    cy.getByTestID('plugin-create-configuration-continue-configuring').click()
    cy.getByTestID('plugin-create-configuration-customize').should('be.visible')
    cy.getByTestID('toml-editor').should('be.visible')
    cy.getByTestID('plugin-create-configuration-customize-input--name')
      .invoke('val')
      .should('equal', configurationName)
    cy.getByTestID('plugin-create-configuration-customize-input--description')
      .click()
      .clear()
      .type('this is a test description')
    cy.getByTestID('plugin-create-configuration-save-and-test').click()
    cy.getByTestID('notification-success').should(
      'contain',
      'Your configurations have been saved'
    )

    cy.getByTestID('next').click()
    cy.getByTestID('overlay--mask').should('not.exist')
  })

  it('can add the same plugin again to the same configuration', () => {
    const examplePlugin = 'aerospike'
    const configurationName = `configuration with two ${examplePlugin}`
    const configurationDescription =
      'an example with the same plugin twice in one config'

    // Create the config
    cy.getByTestID('sources-telegraf-plugins').should('exist')
    cy.getByTestID(`load-data-item ${examplePlugin}`).click()
    cy.getByTestID('add-plugin-to-configuration--dropdown')
      .scrollIntoView()
      .should('be.visible')
      .click()
    cy.getByTestID('create-new-configuration-from-plugin--dropdown-item')
      .should('be.visible')
      .click()
    cy.getByTestID('plugin-create-configuration-options-input--name')
      .should('be.visible')
      .click()
      .clear()
      .type(configurationName)
    cy.getByTestID('plugin-create-configuration-options--select-bucket')
      .should('be.visible')
      .click()
    cy.getByTestID('dropdown-item')
      .eq(1) // "+ Create a Bucket" is 0 then existing buckets start at 1
      .click()

    cy.getByTestID('plugin-create-configuration-continue-configuring').click()
    cy.getByTestID('plugin-create-configuration-customize').should('be.visible')
    cy.getByTestID('toml-editor').should('be.visible')
    cy.getByTestID('plugin-create-configuration-customize-input--name')
      .invoke('val')
      .should('equal', configurationName)
    cy.getByTestID('plugin-create-configuration-customize-input--description')
      .click()
      .clear()
      .type(configurationDescription)
    cy.getByTestID('plugin-create-configuration-save-and-test').click()
    cy.getByTestID('notification-success').should(
      'contain',
      'Your configurations have been saved'
    )
    cy.getByTestID('next').click()
    cy.getByTestID('overlay--mask').should('not.exist')

    // go back to the sources page
    cy.getByTestID('tree-nav').within(() => {
      cy.clickNavBarItem('nav-item-load-data')
    })
    cy.getByTestID('sources-telegraf-plugins').should('exist')
    cy.getByTestID(`load-data-item ${examplePlugin}`).click()

    // Add to the existing config with the same plugin
    cy.getByTestID('add-plugin-to-configuration--dropdown')
      .scrollIntoView()
      .should('be.visible')
      .click()
    cy.getByTestID('add-to-existing-configuration-from-plugin--dropdown-item')
      .should('be.visible')
      .click()
    cy.getByTestID('plugin-add-to-configuration--select-telegraf')
      .should('be.visible')
      .click()
    cy.getByTestID(`telegraf-configuration--${configurationName}`)
      .should('be.visible')
      .click()
    cy.getByTestID('plugin-add-to-configuration--button')
      .should('be.visible')
      .click()
    cy.getByTestID('plugin-add-to-configuration--popover--contents').should(
      'be.visible'
    )
    cy.getByTestID('plugin-add-to-configuration--confirm-button')
      .should('be.visible')
      .click()
    cy.getByTestID('toml-editor').should('be.visible')
    cy.getByTestID('plugin-edit-configuration-customize-input--name')
      .invoke('val')
      .should('equal', configurationName)
    cy.getByTestID('plugin-edit-configuration-customize-input--description')
      .invoke('val')
      .should('equal', configurationDescription)
    cy.getByTestID('plugin-add-to-configuration-save-and-test--button').click()
    cy.getByTestID(
      'plugin-add-to-configuration-save-and-test--popover--contents'
    ).should('be.visible')
    cy.getByTestID('plugin-add-to-configuration-save-and-test--confirm-button')
      .should('be.visible')
      .click()
    cy.getByTestID('next').click()
    cy.getByTestID('overlay--mask').should('not.exist')
  })

  it('can add two different plugins to the same configuration', () => {
    const plugin1 = 'aerospike'
    const plugin2 = 'activemq'
    const configurationName = `configuration with ${plugin1} and ${plugin2}`
    const configurationDescription =
      'an example with the two plugins in one config'

    // Create the config with plugin1
    cy.getByTestID('sources-telegraf-plugins').should('exist')
    cy.getByTestID(`load-data-item ${plugin1}`).click()
    cy.getByTestID('add-plugin-to-configuration--dropdown')
      .should('be.visible')
      .click()
    cy.getByTestID('create-new-configuration-from-plugin--dropdown-item')
      .should('be.visible')
      .click()
    cy.getByTestID('plugin-create-configuration-options-input--name')
      .should('be.visible')
      .click()
      .clear()
      .type(configurationName)
    cy.getByTestID('plugin-create-configuration-options--select-bucket')
      .should('be.visible')
      .click()
    cy.getByTestID('dropdown-item')
      .eq(1) // "+ Create a Bucket" is 0 then existing buckets start at 1
      .click()

    cy.getByTestID('plugin-create-configuration-continue-configuring').click()
    cy.getByTestID('plugin-create-configuration-customize').should('be.visible')
    cy.getByTestID('toml-editor').should('be.visible')
    cy.getByTestID('plugin-create-configuration-customize-input--name')
      .invoke('val')
      .should('equal', configurationName)
    cy.getByTestID('plugin-create-configuration-customize-input--description')
      .click()
      .clear()
      .type(configurationDescription)
    cy.getByTestID('plugin-create-configuration-save-and-test').click()
    cy.getByTestID('notification-success').should(
      'contain',
      'Your configurations have been saved'
    )
    cy.getByTestID('next').click()
    cy.getByTestID('overlay--mask').should('not.exist')

    // Navigate back to Data > Sources to select another plugin
    cy.clickNavBarItem('nav-item-load-data')

    cy.getByTestID(`load-data-item ${plugin2}`).should('exist').click()

    // Add plugin2 to the config that was created
    cy.getByTestID('add-plugin-to-configuration--dropdown')
      .should('be.visible')
      .click()
    cy.getByTestID('add-to-existing-configuration-from-plugin--dropdown-item')
      .should('be.visible')
      .click()
    cy.getByTestID('plugin-add-to-configuration--select-telegraf')
      .should('be.visible')
      .click()
    cy.getByTestID(`telegraf-configuration--${configurationName}`)
      .should('be.visible')
      .click()
    cy.getByTestID('plugin-add-to-configuration--button')
      .should('be.visible')
      .click()
    cy.getByTestID('plugin-add-to-configuration--popover--contents').should(
      'not.exist'
    )
    cy.getByTestID('toml-editor').should('be.visible')
    cy.getByTestID('plugin-edit-configuration-customize-input--name')
      .invoke('val')
      .should('equal', configurationName)
    cy.getByTestID('plugin-edit-configuration-customize-input--description')
      .invoke('val')
      .should('equal', configurationDescription)
    cy.getByTestID('plugin-add-to-configuration-save-and-test--button')
      .should('be.enabled')
      .click()
    cy.getByTestID(
      'plugin-add-to-configuration-save-and-test--popover--contents'
    ).should('be.visible')
    cy.getByTestID('plugin-add-to-configuration-save-and-test--confirm-button')
      .should('be.visible')
      .click()
    cy.getByTestID('next').click()
    cy.getByTestID('overlay--mask').should('not.exist')
  })
})
