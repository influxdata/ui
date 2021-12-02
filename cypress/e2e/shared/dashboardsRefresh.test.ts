import {Organization} from '../../../src/types'
import * as moment from 'moment'

describe('Dashboard refresh', () => {
  beforeEach(() =>
    cy.flush().then(() =>
      cy.signin().then(() =>
        cy.fixture('routes').then(({orgs}) => {
          cy.get('@org').then(({id: orgID}: Organization) => {
            cy.visit(`${orgs}/${orgID}/dashboards-list`)
            cy.getByTestID('tree-nav')
          })
        })
      )
    )
  )
  describe('Dashboard auto refresh', () => {
    let routeToReturnTo = ''
    const jumpAheadTime = (timeAhead = '00:00:00') => {
      return moment()
        .add(moment.duration(timeAhead))
        .format('YYYY-MM-DD HH:mm:ss')
    }

    beforeEach(() => {
      cy.get('@org').then(({id: orgID, name}: Organization) => {
        cy.createDashboard(orgID).then(({body}) => {
          cy.fixture('routes').then(({orgs}) => {
            routeToReturnTo = `${orgs}/${orgID}/dashboards/${body.id}`
            cy.visit(routeToReturnTo)
            cy.getByTestID('tree-nav')
          })
        })
        // TODO: remove when feature flag is removed
        cy.setFeatureFlags({newAutoRefresh: true})
        cy.createBucket(orgID, name, 'schmucket')
        const now = Date.now()
        cy.writeData(
          [
            `test,container_name=cool dopeness=12 ${now - 1000}000000`,
            `test,container_name=beans dopeness=18 ${now - 1200}000000`,
            `test,container_name=cool dopeness=14 ${now - 1400}000000`,
            `test,container_name=beans dopeness=10 ${now - 1600}000000`,
          ],
          'schmucket'
        )
      })
      cy.getByTestID('button').click()
      cy.getByTestID('switch-to-script-editor').should('be.visible')
      cy.getByTestID('switch-to-script-editor').click()
      cy.getByTestID('toolbar-tab').click()
      const query1 = `from(bucket: "schmucket")
|> range(start: v.timeRangeStart, stop: v.timeRangeStop)
|> filter(fn: (r) => r["container_name"] == "cool")`
      cy.getByTestID('flux-editor').within(() => {
        cy.get('.monaco-editor .view-line:last')
          .click({force: true})
          .focused()
          .type(query1, {force: true})
      })
      cy.getByTestID('overlay').within(() => {
        cy.getByTestID('page-title').click()
        cy.getByTestID('renamable-page-title--input')
          .clear()
          .type('blah{enter}', {force: true})
        cy.getByTestID('save-cell--button').click()
      })
    })

    it('can enable the auto refresh process, then manually stop the process via the dropdown', done => {
      cy.intercept('POST', '/api/v2/query?*', req => {
        req.alias = 'refreshQuery'
      })
      cy.getByTestID('enable-auto-refresh-button').click()
      cy.getByTestID('auto-refresh-input')
        .clear()
        .type('2s', {force: true})
      cy.getByTestID('refresh-form-activate-button').click({force: true})
      cy.wait('@refreshQuery')
      cy.getByTestID('enable-auto-refresh-button').click()
      // Wait the duration we'd expect on the next query to ensure stopping via the button actually stops the process. The fail means the request didn't run, which is what we want
      cy.wait('@refreshQuery')
      cy.on('fail', err => {
        expect(err.message).to.include(
          'Timed out retrying after 5000ms: `cy.wait()` timed out waiting `5000ms` for the 2nd request to the route: `refreshQuery`. No request ever occurred.'
        )
        done()
      })
    })

    it('can timeout on a preset timeout selected by the user', done => {
      cy.getByTestID('enable-auto-refresh-button').click()
      cy.getByTestID('auto-refresh-input')
        .clear()
        .type('4s', {force: true})
        .type('{enter}', {force: true})
      cy.getByTestID('timerange-popover-button').click()
      cy.getByTestID('timerange-popover--dialog').within(() => {
        cy.getByTestID('timerange--input')
          .clear()
          .type(`${jumpAheadTime('00:00:05')}`, {force: true})
        cy.getByTestID('daterange--apply-btn').click()
      })
      cy.getByTestID('refresh-form-activate-button').click()

      cy.intercept('POST', '/api/v2/query?*', req => {
        req.alias = 'refreshQuery'
      })

      cy.wait('@refreshQuery')
      cy.wait('@refreshQuery')
      cy.on('fail', err => {
        expect(err.message).to.include(
          'Timed out retrying after 5000ms: `cy.wait()` timed out waiting `5000ms` for the 2nd request to the route: `refreshQuery`. No request ever occurred.'
        )
        done()
      })
    })

    it('does not refresh if user edits cell, until user comes back, and then continues', () => {
      cy.getByTestID('enable-auto-refresh-button').click()
      cy.getByTestID('auto-refresh-input')
        .clear()
        .type('2s', {force: true})
        .type('{enter}', {force: true})
      cy.getByTestID('timerange-popover-button').click()
      cy.getByTestID('timerange-popover--dialog').within(() => {
        cy.getByTestID('timerange--input')
          .clear()
          .type(`${jumpAheadTime('00:00:10')}`, {force: true})
        cy.getByTestID('daterange--apply-btn').click()
      })
      cy.intercept('POST', '/api/v2/query?*', req => {
        req.alias = 'refreshQuery'
      })

      cy.getByTestID('refresh-form-activate-button').click()

      cy.wait('@refreshQuery')

      cy.getByTestID('cell-context--toggle')
        .last()
        .click()
      cy.getByTestID('cell-context--configure').click()

      cy.wait(5000)

      cy.getByTestID('overlay').within(() => {
        cy.getByTestID('cancel-cell-edit--button').click()
      })

      const queriesMade = cy.state('requests').filter((call: any) => {
        call.alias === 'refreshQuery'
      }).length

      expect(queriesMade).to.equal(0)

      cy.visit(routeToReturnTo)
      cy.wait('@refreshQuery')
      cy.wait(5000)
      cy.getByTestID(
        'enable-auto-refresh-button'
      ).contains('ENABLE AUTO REFRESH', {matchCase: false})
    })
    it('can timeout on a preset inactivity timeout', done => {
      cy.getByTestID(
        'enable-auto-refresh-button'
      ).contains('ENABLE AUTO REFRESH', {matchCase: false})

      cy.getByTestID('enable-auto-refresh-button').click()
      cy.getByTestID('auto-refresh-input')
        .clear()
        .type('3s', {force: true})
        .type('{enter}', {force: true})
      cy.getByTestID('timerange-popover-button').click()
      cy.getByTestID('timerange-popover--dialog').within(() => {
        cy.getByTestID('timerange--input')
          .clear()
          .type(`${jumpAheadTime('00:00:08')}`, {force: true})
        cy.getByTestID('daterange--apply-btn').click()
      })
      cy.intercept('POST', '/api/v2/query?*', req => {
        req.alias = 'refreshQuery'
      })

      cy.getByTestID('refresh-form-activate-button').click()

      cy.window()
        .its('store')
        .invoke('dispatch', {
          type: 'SET_INACTIVITY_TIMEOUT',
          ...{
            dashboardID: cy.state().window.store.getState().currentDashboard.id,
            inactivityTimeout: 3000,
          },
        })

      cy.wait(3100)
      cy.getByTestID(
        'enable-auto-refresh-button'
      ).contains('ENABLE AUTO REFRESH', {matchCase: false})
      cy.getByTestID('notification-success--children')
        .children()
        .should(
          'have.text',
          'Your dashboard auto refresh settings have been reset due to inactivity '
        )
      cy.wait('@refreshQuery')
      cy.wait('@refreshQuery')
      // Wait the duration we'd expect on the next query to ensure stopping via the inactivity timeout actually stops the process. The fail means the request didn't run, which is what we want
      cy.on('fail', err => {
        expect(err.message).to.include(
          'Timed out retrying after 5000ms: `cy.wait()` timed out waiting `5000ms` for the 2nd request to the route: `refreshQuery`. No request ever occurred.'
        )
        done()
      })
    })
  })

  describe('Dashboard pause cell', () => {
    it('can pause a cell, which takes it (and only it) out of auto refresh loop, even if second cell has same query', done => {
      cy.get('@org').then(({id: orgID, name}: Organization) => {
        cy.createDashboard(orgID).then(({body}) => {
          cy.fixture('routes').then(({orgs}) => {
            cy.visit(`${orgs}/${orgID}/dashboards/${body.id}`)
            cy.getByTestID('tree-nav')
          })
        })
        cy.setFeatureFlags({pauseCell: true, newAutoRefresh: true})

        cy.createBucket(orgID, name, 'schmucket')

        const now = Date.now()
        cy.writeData(
          [
            `test,container_name=cool dopeness=12 ${now - 1000}000000`,
            `test,container_name=beans dopeness=18 ${now - 1200}000000`,
            `test,container_name=cool dopeness=14 ${now - 1400}000000`,
            `test,container_name=beans dopeness=10 ${now - 1600}000000`,
          ],
          'schmucket'
        )
      })

      cy.getByTestID('button').click()
      cy.getByTestID('switch-to-script-editor').should('be.visible')
      cy.getByTestID('switch-to-script-editor').click()
      cy.getByTestID('toolbar-tab').click()

      const query1 = `from(bucket: "schmucket")
|> range(start: v.timeRangeStart, stop: v.timeRangeStop)
|> filter(fn: (r) => r["container_name"] == "cool")`

      const query2 = `from(bucket: "schmucket")
|> range(start: v.timeRangeStart, stop: v.timeRangeStop)
|> filter(fn: (r) => r["container_name"] == "beans")`

      cy.getByTestID('flux-editor').within(() => {
        cy.get('.monaco-editor .view-line:last')
          .click({force: true})
          .focused()
          .type(query1, {force: true})
      })

      cy.getByTestID('overlay').within(() => {
        cy.getByTestID('page-title').click()
        cy.getByTestID('renamable-page-title--input')
          .clear()
          .type('blah{enter}', {force: true})
        cy.getByTestID('save-cell--button').click()
      })

      cy.getByTestID('button').click()
      cy.getByTestID('switch-to-script-editor').should('be.visible')
      cy.getByTestID('switch-to-script-editor').click()
      cy.getByTestID('toolbar-tab').click()

      cy.getByTestID('overlay').within(() => {
        cy.getByTestID('flux-editor').within(() => {
          cy.get('.monaco-editor .view-line:last')
            .click({force: true})
            .focused()
            .type(query2, {force: true})
        })
        cy.getByTestID('save-cell--button').click()
      })

      cy.intercept('POST', '/api/v2/query?*', req => {
        if (req.body.query === query2) {
          req.alias = 'secondCellQuery'
        }
      })
      cy.intercept('POST', '/api/v2/query?*', req => {
        if (req.body.query === query1) {
          req.alias = 'firstCellQuery'
        }
      })
      cy.getByTestID('cell blah').within(() => {
        cy.getByTestID('cell-context--toggle')
          .last()
          .click()
      })
      cy.getByTestID('cell-context--pause').click()

      cy.getByTestID('enable-auto-refresh-button').click()
      cy.getByTestID('auto-refresh-input')
        .clear()
        .type('2s', {force: true})
      cy.getByTestID('refresh-form-activate-button').click({force: true})
      cy.wait('@secondCellQuery')
      cy.wait('@firstCellQuery')

      // Even though both cells have the same query, the pause functionality only affects the cell we selected specifically
      cy.on('fail', err => {
        expect(err.message).to.include(
          'Timed out retrying after 5000ms: `cy.wait()` timed out waiting `5000ms` for the 1st request to the route: `firstCellQuery`. No request ever occurred.'
        )
        done()
      })
    })

    it('can unpause a paused cell, which places it back in auto refresh loop', done => {
      cy.get('@org').then(({id: orgID, name}: Organization) => {
        cy.createDashboard(orgID).then(({body}) => {
          cy.fixture('routes').then(({orgs}) => {
            cy.visit(`${orgs}/${orgID}/dashboards/${body.id}`)
            cy.getByTestID('tree-nav')
          })
        })
        cy.setFeatureFlags({pauseCell: true, newAutoRefresh: true})

        cy.createBucket(orgID, name, 'schmucket')

        const now = Date.now()
        cy.writeData(
          [
            `test,container_name=cool dopeness=12 ${now - 1000}000000`,
            `test,container_name=beans dopeness=18 ${now - 1200}000000`,
            `test,container_name=cool dopeness=14 ${now - 1400}000000`,
            `test,container_name=beans dopeness=10 ${now - 1600}000000`,
          ],
          'schmucket'
        )
      })

      cy.getByTestID('button').click()
      cy.getByTestID('switch-to-script-editor').should('be.visible')
      cy.getByTestID('switch-to-script-editor').click()
      cy.getByTestID('toolbar-tab').click()

      const query1 = `from(bucket: "schmucket")
|> range(start: v.timeRangeStart, stop: v.timeRangeStop)
|> filter(fn: (r) => r["container_name"] == "cool")`

      const query2 = `from(bucket: "schmucket")
|> range(start: v.timeRangeStart, stop: v.timeRangeStop)
|> filter(fn: (r) => r["container_name"] == "beans")`

      cy.getByTestID('flux-editor').within(() => {
        cy.get('.monaco-editor .view-line:last')
          .click({force: true})
          .focused()
          .clear()
          .type(query1, {force: true})
      })

      cy.getByTestID('overlay').within(() => {
        cy.getByTestID('page-title').click()
        cy.getByTestID('renamable-page-title--input')
          .clear()
          .type('blah{enter}', {force: true})
        cy.getByTestID('save-cell--button').click()
      })

      cy.getByTestID('button').click()
      cy.getByTestID('switch-to-script-editor').should('be.visible')
      cy.getByTestID('switch-to-script-editor').click()
      cy.getByTestID('toolbar-tab').click()

      cy.getByTestID('overlay').within(() => {
        cy.getByTestID('flux-editor').within(() => {
          cy.get('.monaco-editor .view-line:last')
            .click({force: true})
            .focused()
            .type(query2, {force: true})
        })
        cy.getByTestID('save-cell--button').click()
      })

      cy.intercept('POST', '/api/v2/query?*', req => {
        if (req.body.query === query1) {
          // This will only fire when the first cell is unpaused AND it then gets refreshed as part of auto refresh loop, indicating successful operation
          done()
        }
        if (req.body.query === query2) {
          req.alias = 'secondCellQuery'
        }
      })
      cy.getByTestID('cell blah').within(() => {
        cy.getByTestID('cell-context--toggle')
          .last()
          .click()
      })
      cy.getByTestID('cell-context--pause').click()

      cy.getByTestID('enable-auto-refresh-button').click()
      cy.getByTestID('auto-refresh-input')
        .clear()
        .type('2s', {force: true})
      cy.getByTestID('refresh-form-activate-button').click({force: true})

      cy.wait('@secondCellQuery')
      cy.getByTestID('cell blah').within(() => {
        cy.getByTestID('cell-context--toggle')
          .last()
          .click()
      })
      cy.getByTestID('cell-context--pause').click()
    })
  })

  describe('Dashboard manual refresh', () => {
    it('can refresh a cell without refreshing the entire dashboard', () => {
      cy.get('@org').then(({id: orgID, name}: Organization) => {
        cy.createDashboard(orgID).then(({body}) => {
          cy.fixture('routes').then(({orgs}) => {
            cy.visit(`${orgs}/${orgID}/dashboards/${body.id}`)
            cy.getByTestID('tree-nav')
          })
        })
        cy.setFeatureFlags({refreshSingleCell: true})

        cy.createBucket(orgID, name, 'schmucket')

        const now = Date.now()
        cy.writeData(
          [
            `test,container_name=cool dopeness=12 ${now - 1000}000000`,
            `test,container_name=beans dopeness=18 ${now - 1200}000000`,
            `test,container_name=cool dopeness=14 ${now - 1400}000000`,
            `test,container_name=beans dopeness=10 ${now - 1600}000000`,
          ],
          'schmucket'
        )
      })

      cy.getByTestID('button').click()
      cy.getByTestID('switch-to-script-editor').should('be.visible')
      cy.getByTestID('switch-to-script-editor').click()
      cy.getByTestID('toolbar-tab').click()

      const query1 = `from(bucket: "schmucket")
|> range(start: v.timeRangeStart, stop: v.timeRangeStop)
|> filter(fn: (r) => r["container_name"] == "cool")`

      const query2 = `from(bucket: "schmucket")
|> range(start: v.timeRangeStart, stop: v.timeRangeStop)
|> filter(fn: (r) => r["container_name"] == "beans")`

      cy.getByTestID('flux-editor').within(() => {
        cy.get('.monaco-editor .view-line:last')
          .click({force: true})
          .focused()
          .type(query1, {force: true})
      })

      cy.getByTestID('overlay').within(() => {
        cy.getByTestID('page-title').click()
        cy.getByTestID('renamable-page-title--input')
          .clear()
          .type('blah{enter}', {force: true})
        cy.getByTestID('save-cell--button').click()
      })

      cy.getByTestID('button').click()
      cy.getByTestID('switch-to-script-editor').should('be.visible')
      cy.getByTestID('switch-to-script-editor').click()
      cy.getByTestID('toolbar-tab').click()

      cy.getByTestID('overlay').within(() => {
        cy.getByTestID('flux-editor').within(() => {
          cy.get('.monaco-editor .view-line:last')
            .click({force: true})
            .focused()
            .type(query2, {force: true})
        })
        cy.getByTestID('save-cell--button').click()
      })

      cy.getByTestID('cell Name this Cell').within(() => {
        cy.getByTestID('giraffe-inner-plot')
      })

      cy.intercept('POST', '/api/v2/query?*', req => {
        if (req.body.query === query1) {
          req.alias = 'refreshCellQuery'
        }
        if (req.body.query === query2) {
          throw new Error('Refreshed the wrong cell')
        }
      })
      cy.getByTestID('cell blah').within(() => {
        cy.getByTestID('cell-context--toggle')
          .last()
          .click()
      })
      cy.getByTestID('cell-context--refresh').click()
      cy.wait('@refreshCellQuery')
    })

    it('can refresh the dashboard, which refreshes both cells', () => {
      cy.get('@org').then(({id: orgID, name}: Organization) => {
        cy.createDashboard(orgID).then(({body}) => {
          cy.fixture('routes').then(({orgs}) => {
            cy.visit(`${orgs}/${orgID}/dashboards/${body.id}`)
            cy.getByTestID('tree-nav')
          })
        })
        cy.setFeatureFlags({refreshSingleCell: true})

        cy.createBucket(orgID, name, 'schmucket')

        const now = Date.now()
        cy.writeData(
          [
            `test,container_name=cool dopeness=12 ${now - 1000}000000`,
            `test,container_name=beans dopeness=18 ${now - 1200}000000`,
            `test,container_name=cool dopeness=14 ${now - 1400}000000`,
            `test,container_name=beans dopeness=10 ${now - 1600}000000`,
          ],
          'schmucket'
        )
      })

      cy.getByTestID('button').click()
      cy.getByTestID('switch-to-script-editor').should('be.visible')
      cy.getByTestID('switch-to-script-editor').click()
      cy.getByTestID('toolbar-tab').click()

      const query1 = `from(bucket: "schmucket")
|> range(start: v.timeRangeStart, stop: v.timeRangeStop)
|> filter(fn: (r) => r["container_name"] == "cool")`

      const query2 = `from(bucket: "schmucket")
|> range(start: v.timeRangeStart, stop: v.timeRangeStop)
|> filter(fn: (r) => r["container_name"] == "beans")`

      cy.getByTestID('flux-editor').within(() => {
        cy.get('.monaco-editor .view-line:last')
          .click({force: true})
          .focused()
          .type(query1, {force: true})
      })

      cy.getByTestID('overlay').within(() => {
        cy.getByTestID('page-title').click()
        cy.getByTestID('renamable-page-title--input')
          .clear()
          .type('blah{enter}', {force: true})
        cy.getByTestID('save-cell--button').click()
      })

      cy.getByTestID('button').click()
      cy.getByTestID('switch-to-script-editor').should('be.visible')
      cy.getByTestID('switch-to-script-editor').click()
      cy.getByTestID('toolbar-tab').click()

      cy.getByTestID('overlay').within(() => {
        cy.getByTestID('flux-editor').within(() => {
          cy.get('.monaco-editor .view-line:last')
            .click({force: true})
            .focused()
            .type(query2, {force: true})
        })
        cy.getByTestID('save-cell--button').click()
      })

      cy.getByTestID('cell Name this Cell').within(() => {
        cy.getByTestID('giraffe-inner-plot')
      })

      cy.intercept('POST', '/api/v2/query?*', req => {
        if (req.body.query === query1) {
          req.alias = 'refreshCellQuery'
        }
        if (req.body.query === query2) {
          req.alias = 'refreshSecondQuery'
        }
      })

      cy.getByTestID('autorefresh-dropdown-refresh').click()
      cy.wait('@refreshCellQuery')
      cy.wait('@refreshSecondQuery')
    })
  })
})
