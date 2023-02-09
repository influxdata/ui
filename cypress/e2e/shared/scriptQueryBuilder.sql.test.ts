import {Organization} from '../../../src/types'

const DEFAULT_SQL_EDITOR_TEXT = '/* Start by typing SQL here */'

const DELAY_FOR_LAZY_LOAD_EDITOR = 30000

describe('Script Builder', () => {
  const bucketName = 'defbuck'
  const measurement = 'ndbc'

  const selectSchema = () => {
    cy.log('select bucket')
    cy.selectScriptBucket(bucketName)
    cy.confirmSyncIsOn() // SQL composition is dumb. On bucket selection, it will occasionally drop the sync.
    cy.log('writes empty query statement with only the timerange')
    cy.getByTestID('sql-editor', {
      timeout: DELAY_FOR_LAZY_LOAD_EDITOR,
    }).contains(`SELECT *`)
    cy.getByTestID('sql-editor').contains(`WHERE`)
    cy.getByTestID('sql-editor').contains(`time >= now() - interval '1 hour'`)

    cy.log('select measurement')
    cy.selectScriptMeasurement(measurement)
  }

  const confirmSchemaComposition = () => {
    cy.log('has basic query')
    cy.getByTestID('sql-editor', {
      timeout: DELAY_FOR_LAZY_LOAD_EDITOR,
    }).contains(`SELECT *`)
    cy.getByTestID('sql-editor').contains(`WHERE`)
    cy.getByTestID('sql-editor').contains(`time >= now() - interval '1 hour'`)

    cy.log('has measurement chosen as a table')
    cy.getByTestID('sql-editor').contains(`FROM "${measurement}"`)
    cy.getByTestID('sql-editor').within(() => {
      cy.get('.composition-sync--on').should('have.length', 4)
    })

    cy.log('does not have other fields or tag filters')
    cy.getByTestID('sql-editor').should('not.contain', 'AND')
  }

  before(() => {
    const writeData: string[] = []
    for (let i = 0; i < 30; i++) {
      writeData.push(`ndbc,air_temp_degc=70_degrees station_id_${i}=${i}`)
      writeData.push(`ndbc2,air_temp_degc=70_degrees station_id_${i}=${i}`)
    }

    cy.flush().then(() => {
      return cy.signin().then(() => {
        return cy.get('@org').then(({id, name}: Organization) => {
          cy.log('add mock data')
          cy.createBucket(id, name, 'defbuck2')
          cy.writeData(writeData, 'defbuck')
          cy.writeData(writeData, 'defbuck2')
        })
      })
    })
  })

  describe('Schema Composition', () => {
    beforeEach(() => {
      cy.scriptsLoginWithFlags({
        enableFluxInScriptBuilder: false,
      }).then(() => {
        cy.clearSqlScriptSession()
        cy.getByTestID('editor-sync--toggle')
        cy.getByTestID('sql-editor', {timeout: DELAY_FOR_LAZY_LOAD_EDITOR})
      })
    })

    describe('basic functionality', () => {
      it('can construct a composition with fields', () => {
        cy.log('empty editor text')
        cy.getByTestID('sql-editor').monacoType('{selectAll}{del}')

        cy.log('select bucket and measurement')
        selectSchema()
        cy.confirmSyncIsOn() // SQL composition is dumb. On bucket selection, it will occasionally drop the sync.
        confirmSchemaComposition()

        cy.log('select field --> adds to composition')
        const fieldName0 = 'station_id_0'
        const fieldName10 = 'station_id_10'
        cy.selectScriptFieldOrTag(fieldName0, true)
        cy.getByTestID('sql-editor').contains(`("${fieldName0}" IS NOT NULL)`)
        cy.selectScriptFieldOrTag(fieldName10, true)
        cy.getByTestID('sql-editor').contains(
          `("${fieldName0}" IS NOT NULL OR "${fieldName10}" IS NOT NULL)`
        )

        cy.log('select field --> removes from composition')
        cy.selectScriptFieldOrTag(fieldName10, false)
        cy.wait(1000)
        cy.getByTestID('sql-editor').contains(`("${fieldName0}" IS NOT NULL)`)
        cy.getByTestID('sql-editor').within(() => {
          cy.get('textarea.inputarea').should('not.contain', fieldName10)
        })
      })

      it('can construct a composition with tagValues', () => {
        cy.log('empty editor text')
        cy.getByTestID('sql-editor').monacoType('{selectAll}{del}')

        cy.log('select bucket and measurement')
        selectSchema()
        cy.confirmSyncIsOn() // SQL composition is dumb. On bucket selection, it will occasionally drop the sync.
        confirmSchemaComposition()

        cy.log('select tagValue --> adds to composition')
        cy.getByTestID('container-side-bar--tag-keys').within(() => {
          cy.getByTestID('accordion-header').should('be.visible').click()
        })
        const tagKey = 'air_temp_degc'
        const tagValue = '70_degrees'
        cy.selectScriptFieldOrTag(tagValue, true)
        cy.getByTestID('sql-editor').contains(`"${tagKey}" IN ('${tagValue}')`)

        cy.log('select tagValue --> removes from composition')
        cy.selectScriptFieldOrTag(tagValue, false)
        cy.wait(1000)
        cy.getByTestID('sql-editor').within(() => {
          cy.get('textarea.inputarea').should('not.contain', tagKey)
        })
      })

      it('will empty the default text on first bucket selection', () => {
        cy.log('start with default text')
        cy.getByTestID('sql-editor').within(() => {
          cy.get('textarea.inputarea').should(
            'have.value',
            DEFAULT_SQL_EDITOR_TEXT
          )
        })

        cy.log('select bucket')
        cy.selectScriptBucket(bucketName)
        cy.confirmSyncIsOn() // SQL composition is dumb. On bucket selection, it will occasionally drop the sync.
        cy.log('writes empty query statement with only the timerange')
        cy.getByTestID('sql-editor').contains(`SELECT *`)
        cy.getByTestID('sql-editor').contains(`WHERE`)
        cy.getByTestID('sql-editor').contains(
          `time >= now() - interval '1 hour'`
        )

        cy.getByTestID('sql-editor').should(
          'not.contain',
          DEFAULT_SQL_EDITOR_TEXT
        )
      })
    })

    describe('sync and resetting behavior:', () => {
      it('sync defaults to on. Can be toggled on/off. And can diverge (be disabled).', () => {
        cy.log('starts as synced')
        cy.getByTestID('editor-sync--toggle').should('have.class', 'active')

        cy.log('empty editor text')
        cy.getByTestID('sql-editor').monacoType('{selectAll}{del}')

        cy.log('make a composition')
        selectSchema()
        cy.confirmSyncIsOn() // SQL composition is dumb. On bucket selection, it will occasionally drop the sync.
        confirmSchemaComposition()

        cy.log('sync toggles on and off, with matching styles')
        cy.get('.composition-sync--on').should('have.length', 4)
        cy.get('.composition-sync--off').should('have.length', 0)
        cy.getByTestID('editor-sync--toggle')
          .should('have.class', 'active')
          .click()
          .should('not.have.class', 'active')
        cy.get('.composition-sync--on').should('have.length', 0)
        cy.get('.composition-sync--off').should('have.length', 4)
        cy.getByTestID('editor-sync--toggle')
          .click()
          .should('have.class', 'active')
        cy.get('.composition-sync--on').should('have.length', 4)
        cy.get('.composition-sync--off').should('have.length', 0)

        cy.log('turn off editor sync')
        cy.getByTestID('editor-sync--toggle')
          .click()
          .should('not.have.class', 'active')

        cy.log('can still browse schema while not synced')
        cy.selectScriptBucket('defbuck2')
      })

      it('should clear the editor text and schema browser, with a new script', () => {
        cy.getByTestID('sql-editor', {timeout: DELAY_FOR_LAZY_LOAD_EDITOR})

        cy.log('modify schema browser')
        selectSchema()

        cy.log('editor text contains the composition')
        confirmSchemaComposition()

        cy.log('click new script, and choose to delete current script')
        cy.clearSqlScriptSession()
      })

      it('should not be able to modify the composition when unsynced, yet still modify the session -- which updates the composition when re-synced', () => {
        cy.log('empty editor text')
        cy.getByTestID('sql-editor').monacoType('{selectall}{enter}')

        cy.log('turn off sync')
        cy.getByTestID('editor-sync--toggle')
          .should('have.class', 'active')
          .click()
        cy.getByTestID('editor-sync--toggle').should('not.have.class', 'active')

        cy.log('modify schema browser')
        cy.selectScriptBucket(bucketName)
        cy.selectScriptMeasurement(measurement)

        cy.log('editor text is still empty')
        cy.getByTestID('sql-editor').within(() => {
          // selecting bucket will empty the editor text
          cy.get('textarea.inputarea').should('have.value', '\n')
        })

        cy.log('turn on sync')
        cy.getByTestID('editor-sync--toggle')
          .should('not.have.class', 'active')
          .click()
        cy.getByTestID('editor-sync--toggle').should('have.class', 'active')

        cy.log('editor text contains the composition')
        confirmSchemaComposition()
      })
    })
  })
})
