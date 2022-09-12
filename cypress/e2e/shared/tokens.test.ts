import {Organization} from '../../../src/types'
import {sortBy} from 'lodash'

// a generous commitment to delivering this page in a loaded state
const PAGE_LOAD_SLA = 10000
const all_access_token_name = 'the prince and the frog'

describe('tokens', () => {
  let authData: {description: string; status: boolean; id: string}[]

  beforeEach(() => {
    // this is bad
    // use a cypress alias instead
    // docs.cypress.io/guides/core-concepts/variables-and-aliases.html#Avoiding-the-use-of-this
    // docs.cypress.io/guides/core-concepts/variables-and-aliases.html#Aliases
    authData = []

    cy.flush()

    cy.signin()
    cy.get('@org').then(({id}: Organization) => {
      // check out array.reduce for the nested calls here
      cy.request('api/v2/authorizations').then(resp => {
        expect(resp.body).to.exist
        authData.push({
          description: resp.body.authorizations[0].description,
          status: resp.body.authorizations[0].status === 'active',
          id: resp.body.authorizations[0].id,
        })

        cy.fixture('tokens.json').then(({tokens}) => {
          tokens.forEach(token => {
            token.permissions.forEach(p => (p.resource.orgID = id))
            cy.createToken(
              id,
              token.description,
              token.status,
              token.permissions
            ).then(resp => {
              expect(resp.body).to.exist
              authData.push({
                description: resp.body.description,
                status: resp.body.status === 'active',
                id: resp.body.id,
              })
            })
          })
        })

        cy.fixture('routes').then(({orgs}) => {
          cy.visit(`${orgs}/${id}/load-data/tokens`)
          cy.getByTestID('tree-nav')
        })
        cy.get('[data-testid="resource-list"]', {timeout: PAGE_LOAD_SLA})
      })
    })
  })

  it('can list tokens', () => {
    cy.get('.cf-resource-card').should('have.length', 4)
    cy.getByTestID('token-list').then(rows => {
      authData = authData.sort((a, b) =>
        // eslint-disable-next-line
        a.description < b.description
          ? -1
          : a.description > b.description
          ? 1
          : 0
      )

      for (let i = 0; i < rows.length; i++) {
        cy.getByTestID(`token-name ${authData[i].description}`)
          .eq(i)
          .contains(authData[i].description)

        cy.getByTestID('context-delete-menu--button').eq(i).should('be.visible')
        cy.getByTestID('context-menu-token').eq(i).should('exist').click()
        cy.getByTestID('context-clone-token').eq(i).should('exist')
      }
    })
  })

  it('can filter tokens', () => {
    // basic filter
    cy.getByTestID('input-field--filter').type('test')
    cy.get('.cf-resource-card').should('have.length', 3)

    // clear filter
    cy.getByTestID('input-field--filter').clear()
    cy.get('.cf-resource-card').should('have.length', 4)

    // exotic filter
    cy.getByTestID('input-field--filter').type('\u0950')
    cy.get('.cf-resource-card').should('have.length', 1)
  })

  it('can delete a token', () => {
    cy.get('.cf-resource-card').should('have.length', 4)

    cy.getByTestID('token-card token test 03').within(() => {
      cy.getByTestID('context-delete-menu--button').click()
    })
    cy.getByTestID('context-delete-menu--confirm-button').click()

    cy.getByTestID('notification-success').should(
      'contain',
      'API token was deleted successfully'
    )

    cy.get('.cf-resource-card').should('have.length', 3)

    cy.getByTestID('resource-card token test 03').should('not.exist')

    // Delete remaining tokens
    cy.get('.cf-resource-card')
      .first()
      .within(() => {
        cy.getByTestID('context-delete-menu--button')
          .should('be.visible')
          .click()
      })
    cy.getByTestID('context-delete-menu--confirm-button')
      .should('be.visible')
      .click()

    cy.getByTestID('notification-success').should(
      'contain',
      'API token was deleted successfully'
    )

    cy.getByTestID('notification-success--dismiss').click()

    cy.get('.cf-resource-card')
      .first()
      .within(() => {
        cy.getByTestID('context-delete-menu--button')
          .should('be.visible')
          .click()
      })
    cy.getByTestID('context-delete-menu--confirm-button')
      .should('be.visible')
      .click()

    cy.getByTestID('notification-success').should(
      'contain',
      'API token was deleted successfully'
    )

    cy.get('.cf-resource-card')
      .first()
      .within(() => {
        cy.getByTestID('context-delete-menu--button')
          .should('be.visible')
          .click()
      })
    cy.getByTestID('context-delete-menu--confirm-button')
      .should('be.visible')
      .click()

    cy.getByTestID('notification-success').should(
      'contain',
      'API token was deleted successfully'
    )

    cy.getByTestID('notification-success--dismiss').click()

    // Assert empty state
    cy.getByTestID('empty-state').within(() => {
      cy.getByTestID('dropdown--gen-token').should('exist')
    })
  })

  it('can generate a all access token', () => {
    cy.get('.cf-resource-card').should('have.length', 4)

    // open overlay
    cy.getByTestID('dropdown-button--gen-token').click()
    cy.getByTestIDSubStr('dropdown-item').should('have.length', 2)
    cy.getByTestID('dropdown-item generate-token--all-access').click()
    cy.getByTestID('overlay--container').should('be.visible')

    // create token
    cy.getByTestID('all-access-token-input').type(all_access_token_name)
    cy.getByTestID('button--save').click()

    cy.getByTestID(`token-card ${all_access_token_name}`).should('be.visible')
  })

  it('can view a token', () => {
    cy.getByTestID('token-name token test 03').click()

    // header match
    cy.getByTestID('overlay--container').should('be.visible')
    cy.getByTestID('overlay--header').should('contain', 'API Token Summary')

    // status match
    cy.getByTestID('custom-api-token-toggle').should('be.visible')

    // description match
    cy.getByTestID('custom-api-token-input').should('be.visible')
    cy.getByTestID('custom-api-token-input').should(
      'have.value',
      'token test 03'
    )

    // filter exist
    cy.getByTestID('input-field--filter').should('be.visible')

    // close button
    cy.getByTestID('overlay--header').within(() => {
      cy.get('button').click()
    })
  })

  it('can edit the description', () => {
    cy.getByTestID('token-card token test 02').within(() => {
      cy.getByTestID('resource-editable-name--button').click()
      cy.getByTestID('resource-editable-name--input').type(
        'renamed-description{enter}'
      )
    })
    cy.getByTestID('token-card renamed-description').should('be.visible')
  })

  it('can do sorting', () => {
    cy.get<string>('@defaultUser').then((defaultUser: string) => {
      cy.getByTestID(`token-card ${defaultUser}'s Token`).within(() => {
        cy.getByTestID('context-delete-menu--button').click()
      })
      cy.getByTestID('context-delete-menu--confirm-button').click()
    })

    cy.log('sort by Description (Asc)')

    cy.getByTestID('resource-sorter--button')
      .click()
      .then(() => {
        cy.getByTestID('resource-sorter--description-asc').click()
      })
      .then(() => {
        cy.fixture('tokens.json').then(({tokens}) => {
          const sorted = sortBy(tokens, 'description')

          cy.get('[data-testid*="token-card"]').each((val, index) => {
            const testID = val.attr('data-testid')
            expect(testID).to.contain(sorted[index].description)
          })
        })
      })

    cy.log('sort by Description (Desc)')

    cy.getByTestID('resource-sorter--button')
      .click()
      .then(() => {
        cy.getByTestID('resource-sorter--description-desc').click()
      })
      .then(() => {
        cy.fixture('tokens.json').then(({tokens}) => {
          const sorted = sortBy(tokens, 'description').reverse()

          cy.get('[data-testid*="token-card"]').each((val, index) => {
            const testID = val.attr('data-testid')
            expect(testID).to.contain(sorted[index].description)
          })
        })
      })

    cy.log('sort by Status (Active)')

    cy.getByTestID('resource-sorter--button')
      .click()
      .then(() => {
        cy.getByTestID('resource-sorter--status-asc').click()
      })
      .then(() => {
        cy.fixture('tokens.json').then(({tokens}) => {
          cy.getByTestIDSubStr('token-card')
            .first()
            .should('contain', tokens[0].description)

          cy.getByTestIDSubStr('token-card')
            .last()
            .should('contain', tokens[2].description)

          cy.getByTestIDSubStr('token-card').should('have.length', 3)
        })
      })

    cy.log('sort by Status (Inactive)')

    cy.getByTestID('resource-sorter--button')
      .click()
      .then(() => {
        cy.getByTestID('resource-sorter--status-desc').click()
      })
      .then(() => {
        cy.fixture('tokens.json').then(({tokens}) => {
          cy.getByTestIDSubStr('token-card')
            .first()
            .should('contain', tokens[1].description)

          cy.getByTestIDSubStr('token-card')
            .last()
            .should('contain', tokens[0].description)

          cy.getByTestIDSubStr('token-card').should('have.length', 3)
        })
      })
  })
})
