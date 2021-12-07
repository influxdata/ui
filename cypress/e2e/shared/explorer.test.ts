import {Organization} from '../../../src/types'
import {points, makeGraphSnapshot} from '../../support/commands'

describe('DataExplorer', () => {
  beforeEach(() => {
    cy.flush()
    cy.signin()
    cy.get('@org').then(({id}: Organization) => {
      cy.createMapVariable(id)
      cy.fixture('routes').then(({orgs, explorer}) => {
        cy.visit(`${orgs}/${id}${explorer}`)
        cy.getByTestID('tree-nav')
      })
    })
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
      // Can't use the testID to select this nav item because Clockface is silly and uses the same testID twice
      // Issue: https://github.com/influxdata/clockface/issues/539
      cy.get('.cf-tree-nav--sub-item-label')
        .contains('Buckets')
        .click()
      cy.getByTestID('bucket--card--name _tasks').click()
      cy.getByTestID('query-builder').should('exist')
    })
  })

  describe('numeric input using custom bin sizes in Histograms', () => {
    beforeEach(() => {
      cy.getByTestID('view-type--dropdown').click()
      cy.getByTestID(`view-type--histogram`).click()
      cy.getByTestID('cog-cell--button').click()
    })

    it('should put input field in error status and stay in error status when input is invalid or empty', () => {
      cy.get('.view-options').within(() => {
        cy.getByTestID('auto-input').within(() => {
          cy.getByTestID('input-field').clear()
          cy.getByTestID('auto-input--custom').should(
            'have.class',
            'cf-select-group--option__active'
          )
          cy.getByTestID('input-field--error').should('have.length', 1)
          cy.getByTestID('input-field').type('adfuiopbvmc')
          cy.getByTestID('input-field--error').should('have.length', 1)
        })
      })
    })

    it('should not have the input field in error status when input becomes valid', () => {
      cy.get('.view-options').within(() => {
        cy.getByTestID('auto-input').within(() => {
          cy.getByTestID('input-field')
            .clear()
            .type('3')
          cy.getByTestID('input-field--error').should('have.length', 0)
        })
      })
    })
  })

  describe('numeric input validation when changing bin sizes in Heat Maps', () => {
    beforeEach(() => {
      cy.getByTestID('view-type--dropdown').click()
      cy.getByTestID(`view-type--heatmap`).click()
      cy.getByTestID('cog-cell--button').click()
    })

    it('should put input field in error status and stay in error status when input is invalid or empty', () => {
      cy.get('.view-options').within(() => {
        cy.getByTestID('grid--column').within(() => {
          cy.getByTestID('bin-size-input')
            .clear()
            .getByTestID('bin-size-input--error')
            .should('have.length', 1)
          cy.getByTestID('bin-size-input')
            .type('{backspace}')
            .getByTestID('bin-size-input--error')
            .should('have.length', 1)
          cy.getByTestID('bin-size-input')
            .type('4')
            .getByTestID('bin-size-input--error')
            .should('have.length', 1)
          cy.getByTestID('bin-size-input')
            .type('{backspace}abcdefg')
            .getByTestID('bin-size-input--error')
            .should('have.length', 1)
        })
      })
    })

    it('should not have input field in error status when "10" becomes valid input such as "5"', () => {
      cy.get('.view-options').within(() => {
        cy.getByTestID('grid--column').within(() => {
          cy.getByTestID('bin-size-input')
            .clear()
            .type('5')
            .getByTestID('bin-size-input--error')
            .should('have.length', 0)
        })
      })
    })
  })

  describe('numeric input validation when changing number of decimal places in Single Stat', () => {
    beforeEach(() => {
      cy.getByTestID('view-type--dropdown').click()
      cy.getByTestID(`view-type--single-stat`).click()
      cy.getByTestID('cog-cell--button').click()
    })

    it('should put input field in error status and stay in error status when input is invalid or empty', () => {
      cy.get('.view-options').within(() => {
        cy.getByTestID('auto-input--input').within(() => {
          cy.getByTestID('input-field')
            .click()
            .type('{backspace}')
            .invoke('attr', 'type')
            .should('equal', 'text')
            .getByTestID('input-field--error')
            .should('have.length', 1)
          cy.getByTestID('input-field')
            .click()
            .type('{backspace}')
            .invoke('val')
            .should('equal', '')
            .getByTestID('input-field--error')
            .should('have.length', 1)
          cy.getByTestID('input-field')
            .click()
            .type('abcdefg')
            .invoke('val')
            .should('equal', '')
            .getByTestID('input-field--error')
            .should('have.length', 1)
        })
      })
    })

    it('should not have input field in error status when "2" becomes valid input such as "11"', () => {
      cy.get('.view-options').within(() => {
        cy.getByTestID('auto-input--input').within(() => {
          cy.getByTestID('input-field')
            .click()
            .type('{backspace}11')
            .invoke('val')
            .should('equal', '11')
            .getByTestID('input-field--error')
            .should('have.length', 0)
        })
      })
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
          cy.getByTestID('selector-list m').clickAttached()

          cy.getByTestID('selector-list v').should('be.visible')
          cy.getByTestID('selector-list v').clickAttached()

          cy.getByTestID('selector-list tv1').clickAttached()

          cy.getByTestID('selector-list mean')
            .scrollIntoView()
            .should('be.visible')
            .click({force: true})

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
          cy.getByTestID('selector-list m').clickAttached()

          cy.getByTestID('selector-list v').should('be.visible')
          cy.getByTestID('selector-list v').clickAttached()

          cy.getByTestID('selector-list tv1').clickAttached()

          cy.getByTestID('selector-list mean')
            .scrollIntoView()
            .should('be.visible')
            .click({force: true})

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

  describe('select time range to query', () => {
    it('can set a custom time range and restricts start & stop selections relative to start & stop dates', () => {
      // find initial value
      cy.get('.cf-dropdown--selected')
        .contains('Past 1')
        .should('have.length', 1)
      cy.getByTestID('timerange-popover--dialog').should('not.exist')
      cy.getByTestID('timerange-dropdown').click()

      cy.getByTestID('dropdown-item-past15m').click()
      cy.get('.cf-dropdown--selected')
        .contains('Past 15m')
        .should('have.length', 1)

      cy.getByTestID('timerange-dropdown').click()

      cy.getByTestID('timerange-popover--dialog').should('not.exist')

      cy.getByTestID('dropdown-item-customtimerange').click()
      cy.getByTestID('timerange-popover--dialog').should('have.length', 1)

      cy.getByTestID('timerange--input')
        .first()
        .clear()
        .type('2019-10-29 08:00:00.000')

      // Set the stop date to Oct 29, 2019
      cy.getByTestID('timerange--input')
        .last()
        .clear()
        .type('2019-10-29 09:00:00.000')

      // click button and see if time range has been selected
      cy.getByTestID('daterange--apply-btn').click()

      cy.getByTestID('timerange-dropdown').click()
      cy.getByTestID('dropdown-item-customtimerange').click()
    })

    describe('should allow for custom time range selection', () => {
      beforeEach(() => {
        cy.getByTestID('timerange-dropdown').click()
        cy.getByTestID('dropdown-item-customtimerange').click()
        cy.getByTestID('timerange-popover--dialog').should('have.length', 1)
      })

      it('should error when submitting stop dates that are before start dates and should error when invalid dates are input', () => {
        cy.get('input[title="Start"]')
          .should('have.length', 1)
          .clear()
          .type('2019-10-31')

        cy.get('input[title="Stop"]')
          .should('have.length', 1)
          .clear()
          .type('2019-10-29')

        // button should be disabled
        cy.getByTestID('daterange--apply-btn').should('be.disabled')

        // default inputs should be valid
        cy.getByTestID('input-error').should('not.exist')

        // type incomplete input
        cy.get('input[title="Start"]')
          .clear()
          .type('2019-10')

        // invalid date errors
        cy.getByTestID('form--element-error').should('exist')

        // modifies the input to be valid
        cy.get('input[title="Start"]').type('-01')

        // warnings should not appear
        cy.getByTestID('input-error').should('not.exist')

        // type invalid stop date
        cy.get('input[title="Stop"]')
          .clear()
          .type('2019-10-')

        // invalid date errors
        cy.getByTestID('form--element-error').should('exist')

        // button should be disabled
        cy.getByTestID('daterange--apply-btn').should('be.disabled')

        // Validate that ISO String formatted texts are valid
        cy.get('input[title="Stop"]')
          .clear()
          .type('2019-10-29T08:00:00.000Z')

        // button should not be disabled
        cy.getByTestID('daterange--apply-btn').should('not.be.disabled')
      })
    })
  })

  describe('refresh', () => {
    beforeEach(() => {
      cy.writeData(points(10))

      cy.getByTestID(`selector-list m`).click()
      cy.getByTestID('time-machine-submit-button').click()

      // select short time period to ensure graph changes after short time
      cy.getByTestID('timerange-dropdown').click()
      cy.getByTestID('dropdown-item-past5m').click()
    })

    it('manual refresh', () => {
      const snapshot = makeGraphSnapshot()

      // graph will slightly move
      cy.wait(200)
      cy.get('.autorefresh-dropdown--pause').click()
      makeGraphSnapshot().shouldBeSameAs(snapshot, false)
    })
  })
})
