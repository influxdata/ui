const DELAY_FOR_LAZY_LOAD_EDITOR = 30000

describe('Script Builder -- scripts crud on cloud', () => {
  const writeData: string[] = []
  for (let i = 0; i < 30; i++) {
    writeData.push(`ndbc,air_temp_degc=70_degrees station_id_${i}=${i}`)
    writeData.push(`ndbc2,air_temp_degc=70_degrees station_id_${i}=${i}`)
  }

  const scriptName = 'foo'

  const attemptSaveScript = (scriptText: string, name = scriptName) => {
    cy.getByTestID('flux-editor')
      .monacoType(`{selectall}{del}{selectall}{rightArrow}{enter}
      ${scriptText}
      |> yield(name: "${name}")
    `)
    cy.getByTestID('flux-editor').contains(`|> yield(name: "${name}")`)
    cy.getByTestID('script-query-builder--save-script')
      .should('be.visible')
      .click()
    cy.getByTestID('overlay--container').within(() => {
      cy.getByTestID('save-script-name__input').should('be.visible').type(name)
      cy.getByTestID('script-query-builder--save').should('be.visible').click()
    })
  }

  const saveScript = (scriptText: string, name = scriptName) => {
    cy.intercept('POST', '/api/v2/scripts*').as('scripts')
    attemptSaveScript(scriptText, name)
    cy.wait('@scripts')
    cy.getByTestID('notification-success').should('be.visible').contains(name)
  }

  before(() => {
    cy.flush().then(() => {
      return cy.signin().then(() => {
        return cy.writeData(writeData, 'defbuck')
      })
    })
  })

  describe('saveAsScript', () => {
    beforeEach(() => {
      cy.scriptsLoginWithFlags({}).then(() => {
        cy.switchToDataExplorer('new')
        cy.clearFluxScriptSession()
        cy.getByTestID('flux-editor', {timeout: DELAY_FOR_LAZY_LOAD_EDITOR})
      })
    })

    it('will save a flux query', () => {
      saveScript(
        'from(bucket: "defbuck") |> range(start: v.timeRangeStart, stop: v.timeRangeStop)'
      )
      cy.log('should notify user of a success')
      cy.getByTestID('notification-success--dismiss').should('be.visible')
      cy.getByTestID('overlay--container').should('not.exist')
    })
  })

  describe('handling of existing scripts', () => {
    const DELAY_FOR_UPDATE = 1000
    const scriptName = 'bar'
    const anotherScriptName = 'baz'
    const scriptToDelete = 'toDelete'

    before(() => {
      cy.scriptsLoginWithFlags({}).then(() => {
        cy.createScript(
          scriptName,
          `from(bucket: "defbuck") |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
          |> yield(name: "${scriptName}")`
        )
        cy.createScript(
          anotherScriptName,
          `from(bucket: "defbuck") |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
          |> yield(name: "${anotherScriptName}")`
        )
        cy.createScript(
          scriptToDelete,
          `from(bucket: "defbuck") |> range(start: v.timeRangeStart, stop: v.timeRangeStop)
          |> yield(name: "${scriptToDelete}")`
        )
      })
    })

    beforeEach(() => {
      cy.scriptsLoginWithFlags({}).then(() => {
        cy.switchToDataExplorer('new')
        cy.clearFluxScriptSession()
        cy.getByTestID('flux-editor', {timeout: DELAY_FOR_LAZY_LOAD_EDITOR})
      })
    })

    it('can search existing scripts, and open new one', () => {
      cy.getByTestID('script-query-builder--open-script')
        .should('be.visible')
        .click()
      cy.getByTestID('overlay--container').within(() => {
        cy.log('should see both scripts')
        // may have other script from previous test, since we don't flush btwn each
        cy.get('.cf-dropdown-item').should('have.length.at.least', 2)

        cy.getByTestID('open-script__search')
          .should('be.visible')
          .type(anotherScriptName)
        cy.get('.cf-dropdown-item').should('have.length', 1).click()

        cy.getByTestID('open-script__open').should('be.visible').click()
      })

      cy.log('confirm is open')
      cy.wait(DELAY_FOR_UPDATE)
      cy.getByTestID('page-title').contains(anotherScriptName)
      cy.getByTestID('flux-editor').contains(
        `|> yield(name: "${anotherScriptName}")`
      )
    })

    // TODO: this fails only in cypress, not in manual QA
    it.skip('can delete a script', () => {
      cy.getByTestID('script-query-builder--open-script')
        .should('be.visible')
        .click()
      cy.getByTestID('overlay--container').within(() => {
        cy.getByTestID('open-script__search')
          .should('be.visible')
          .type(scriptToDelete)
        cy.get('.cf-dropdown-item').should('have.length', 1).click()
        cy.getByTestID('open-script__open').should('be.visible').click()
      })

      cy.log('confirm is open')
      cy.wait(DELAY_FOR_UPDATE)
      cy.getByTestID('page-title').contains(scriptToDelete)
      cy.getByTestID('flux-editor').contains(
        `|> yield(name: "${scriptToDelete}")`
      )

      cy.log('delete')
      cy.intercept('DELETE', '/api/v2/scripts/*').as('delete-script')
      cy.getByTestID('script-query-builder--edit-script')
        .should('be.visible')
        .click()
      cy.getByTestID('overlay--container').within(() => {
        cy.getByTestID('script-query-builder--delete-script')
          .should('be.visible')
          .click()
      })
      cy.getByTestID('overlay--container').within(() => {
        cy.getByTestID('script-query-builder--confirm-delete')
          .should('be.visible')
          .click()
      })
      cy.wait('@delete-script')
      cy.wait(DELAY_FOR_UPDATE)

      cy.log('confirm no longer in list')
      cy.getByTestID('script-query-builder--open-script')
        .should('be.visible')
        .click()
      cy.getByTestID('overlay--container').within(() => {
        cy.getByTestID('open-script__search')
          .should('be.visible')
          .type(scriptToDelete)
        cy.get('.cf-dropdown-item').should('have.length', 0)
      })
    })

    // TODO: test for editing a script. And editing the script metadata.
  })
})
