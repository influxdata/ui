import {Organization} from '../../../src/types'
import {points} from '../../support/commands'

const isTSMOrg = !Boolean(Cypress.env('useIox'))

describe('Data Explorer - general functionality - TSM', () => {
  let route: string

  beforeEach(() => {
    cy.flush().then(() =>
      cy.signin().then(() =>
        cy
          .setFeatureFlags({
            showOldDataExplorerInNewIOx: true,
            showTasksInNewIOx: true,
            schemaComposition: true, // Double check that the new schemaComposition flag does not interfere.
          })
          .then(() => {
            cy.get('@org').then(({id}: Organization) => {
              cy.fixture('routes').then(({orgs, explorer}) => {
                route = `${orgs}/${id}${explorer}`
                cy.visit(route)
                cy.getByTestID('tree-nav').should('be.visible')
                cy.switchToDataExplorer('old')
              })
            })
          })
      )
    )
  })

  describe('data-explorer state', () => {
    it('should persist and display last submitted script editor script ', () => {
      const fluxCode = 'from(bucket: "_monitoring")'
      cy.getByTestID('switch-to-script-editor').click()
      cy.getByTestID('flux-editor').monacoType(fluxCode)
      cy.contains('Submit').click()
      cy.getByTestID('nav-item-tasks').click()
      cy.getByTestID('nav-item-data-explorer').click()
      cy.contains(fluxCode)
    })

    it('can navigate to data explorer from buckets list and override state', () => {
      const fluxCode = 'from(bucket: "_monitoring")'
      cy.getByTestID('switch-to-script-editor').click()
      cy.getByTestID('flux-editor').monacoType(fluxCode)
      cy.contains('Submit').click()
      cy.get('.cf-tree-nav--toggle').click()
      cy.getByTestID('nav-item-load-data').click()
      cy.getByTestID('nav-subitem-buckets').click()
      cy.getByTestID('bucket--card--name _tasks').click()
      cy.getByTestID('query-builder').should('be.visible')
    })
  })

  describe('optional prefix and suffix in gauge', () => {
    const prefix = 'speed: '
    const suffix = ' mph'
    it('can add prefix and suffix labels when using Giraffe gauge', () => {
      cy.writeData(points(10))
      cy.get<string>('@defaultBucketListSelector').then(
        (defaultBucketListSelector: string) => {
          cy.getByTestID('view-type--dropdown').click()
          cy.getByTestID(`view-type--gauge`).click()

          cy.getByTestID('query-builder').should('exist')
          cy.getByTestID('selector-list _monitoring').should('be.visible')
          cy.getByTestID('selector-list _monitoring').click()

          cy.getByTestID(defaultBucketListSelector).should('be.visible')
          cy.getByTestID(defaultBucketListSelector).click()

          cy.getByTestID('selector-list m').should('be.visible')
          cy.getByTestID('selector-list m').click()

          cy.getByTestID('selector-list v').should('be.visible')
          cy.getByTestID('selector-list v').click()

          cy.getByTestID('selector-list tv1').should('be.visible')
          cy.getByTestID('selector-list tv1').click()

          cy.getByTestID('selector-list mean')
            .scrollIntoView()
            .should('be.visible')
            .click()

          cy.getByTestID('time-machine-submit-button').click()
          cy.get('canvas.giraffe-gauge').should('be.visible')

          cy.getByTestID('cog-cell--button').click()
          cy.get('.view-options').within(() => {
            cy.getByTestID('prefix-input')
              .click()
              .type(`${prefix}`)
              .invoke('val')
              .should('equal', prefix)
              .getByTestID('input-field--error')
              .should('have.length', 0)
            cy.getByTestID('suffix-input')
              .click()
              .type(`${suffix}`)
              .invoke('val')
              .should('equal', suffix)
              .getByTestID('input-field--error')
              .should('have.length', 0)
            cy.getByTestID('tick-prefix-input')
              .click()
              .type(`${prefix}`)
              .invoke('val')
              .should('equal', prefix)
              .getByTestID('input-field--error')
              .should('have.length', 0)
            cy.getByTestID('tick-suffix-input')
              .click()
              .type(`${suffix}`)
              .invoke('val')
              .should('equal', suffix)
              .getByTestID('input-field--error')
              .should('have.length', 0)
          })
        }
      )
    })

    it('can add prefix and suffix labels when using original built-in gauge', () => {
      cy.writeData(points(10))
      cy.get<string>('@defaultBucketListSelector').then(
        (defaultBucketListSelector: string) => {
          cy.getByTestID('view-type--dropdown').click()
          cy.getByTestID(`view-type--gauge`).click()

          cy.getByTestID('query-builder').should('exist')
          cy.getByTestID('selector-list _monitoring').should('be.visible')
          cy.getByTestID('selector-list _monitoring').click()

          cy.getByTestID(defaultBucketListSelector).should('be.visible')
          cy.getByTestID(defaultBucketListSelector).click()

          cy.getByTestID('selector-list m').should('be.visible')
          cy.getByTestID('selector-list m').click()

          cy.getByTestID('selector-list v').should('be.visible')
          cy.getByTestID('selector-list v').click()

          cy.getByTestID('selector-list tv1').should('be.visible')
          cy.getByTestID('selector-list tv1').click()

          cy.getByTestID('selector-list mean')
            .scrollIntoView()
            .should('be.visible')
            .click()

          cy.getByTestID('time-machine-submit-button').click()
          cy.get('.giraffe-gauge').should('be.visible')

          cy.getByTestID('cog-cell--button').click()
          cy.get('.view-options').within(() => {
            cy.getByTestID('prefix-input')
              .click()
              .type(`${prefix}`)
              .invoke('val')
              .should('equal', prefix)
              .getByTestID('input-field--error')
              .should('have.length', 0)
            cy.getByTestID('suffix-input')
              .click()
              .type(`${suffix}`)
              .invoke('val')
              .should('equal', suffix)
              .getByTestID('input-field--error')
              .should('have.length', 0)
            cy.getByTestID('tick-prefix-input')
              .click()
              .type(`${prefix}`)
              .invoke('val')
              .should('equal', prefix)
              .getByTestID('input-field--error')
              .should('have.length', 0)
            cy.getByTestID('tick-suffix-input')
              .click()
              .type(`${suffix}`)
              .invoke('val')
              .should('equal', suffix)
              .getByTestID('input-field--error')
              .should('have.length', 0)
          })
        }
      )
    })
  })

  describe('refresh', () => {
    it('can refresh the graph only after submitting the query', () => {
      cy.writeData(points(20))

      // hitting refresh before a query is built gives nothing
      cy.getByTestID(`selector-list m`).should('be.visible')
      cy.getByTestID('time-machine-submit-button').should(
        'have.class',
        'cf-button--disabled'
      )
      cy.getByTestID('autorefresh-dropdown-refresh').click()
      cy.getByTestID('empty-graph--no-results').should('be.visible')
      cy.get('.giraffe-plot').should('not.exist')

      // build the query and submit
      cy.getByTestID(`selector-list m`).click()
      cy.getByTestID('time-machine-submit-button').click()
      cy.get('.giraffe-plot').should('be.visible')
      cy.getByTestID('empty-graph--no-results').should('not.exist')

      // check that refresh works
      cy.intercept('**/query**').as('refresh')
      cy.getByTestID('autorefresh-dropdown-refresh').click()

      cy.wait('@refresh')
      cy.get('.query-tab--timer__visible').should('be.visible')
      cy.get('.giraffe-plot').should('be.visible')
      cy.getByTestID('empty-graph--no-results').should('not.exist')
    })
  })

  describe.skip('download csv', () => {
    // docs for how to test form submission as file download:
    // https://github.com/cypress-io/cypress-example-recipes/blob/cc13866e55bd28e1d1323ba6d498d85204f292b5/examples/testing-dom__download/cypress/e2e/form-submission-spec.cy.js
    const downloadsDirectory = Cypress.config('downloadsFolder')

    const validateCsv = (csv: string, rowCnt: number) => {
      const numHeaderRows = 4
      cy.wrap(csv)
        .then(doc => doc.trim().split('\n'))
        .then(list => {
          expect(list.length).to.equal(rowCnt + numHeaderRows)
        })
    }

    beforeEach(() => {
      cy.writeData(points(20))
      cy.task('deleteDownloads', {dirPath: downloadsDirectory})
      cy.getByTestID('switch-to-script-editor').should('be.visible').click()
    })

    it('can download a file', () => {
      cy.intercept('POST', '/api/v2/query?*', req => {
        req.redirect(route)
      }).as('query')

      cy.getByTestID('time-machine--bottom').within(() => {
        cy.getByTestID('flux-editor', {timeout: 30000}).should('be.visible')
          .monacoType(`from(bucket: "defbuck")
  |> range(start: -10h)`)
        cy.getByTestID('csv-download-button').should('be.visible').click()
      })

      cy.wait('@query', {timeout: 5000})
        .its('request', {timeout: 5000})
        .then(req => {
          cy.request(req)
            .then(({body, headers}) => {
              expect(headers).to.have.property(
                'content-type',
                'text/csv; charset=utf-8'
              )
              return Promise.resolve(body)
            })
            .then(csv => validateCsv(csv, 1))
        })
    })
  })
})

describe('Data Explorer - IOx', () => {
  it('does not show the old data explorer page but show the script query builder page', () => {
    cy.skipOn(isTSMOrg)

    cy.flush().then(() =>
      cy.signin().then(() =>
        cy.get('@org').then(({id}: Organization) => {
          cy.fixture('routes').then(({orgs}) => {
            cy.visit(`${orgs}/${id}/data-explorer`)
            cy.getByTestID('tree-nav').should('be.visible')
          })
        })
      )
    )

    cy.get('.time-machine').should('not.exist')
    cy.getByTestID('script-query-builder--menu').should('be.visible')
  })
})
