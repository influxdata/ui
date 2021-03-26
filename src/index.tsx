import 'babel-polyfill'
import 'abortcontroller-polyfill/dist/polyfill-patch-fetch'

// Libraries
import React, {PureComponent, Suspense} from 'react'
import {render} from 'react-dom'
import {Provider} from 'react-redux'
import {Route, Switch} from 'react-router-dom'
import {ConnectedRouter} from 'connected-react-router'

// Stores
import {getStore} from 'src/store/configureStore'
import {history} from 'src/store/history'

// Components
import {
  AccountPage,
  CheckoutPage,
  OperatorPage,
  OrgOverlay,
} from 'src/shared/containers'
import Setup from 'src/Setup'
import PageSpinner from 'src/perf/components/PageSpinner'

// Utilities
import {getRootNode} from 'src/utils/nodes'
import {updateReportingContext} from 'src/cloud/utils/reporting'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

// Actions
import {disablePresentationMode} from 'src/shared/actions/app'

// Constants
import {CLOUD} from 'src/shared/constants'

// Styles
import 'src/style/chronograf.scss'
import '@influxdata/clockface/dist/index.css'

const rootNode = getRootNode()

const SESSION_KEY = 'session'

const cookieSession = document.cookie.match(
  new RegExp('(^| )' + SESSION_KEY + '=([^;]+)')
)

updateReportingContext({
  session: cookieSession ? cookieSession[2].slice(5) : '',
})

const {dispatch} = getStore()

if (window['Cypress']) {
  window['store'] = getStore()
}

history.listen(() => {
  dispatch(disablePresentationMode())
})

declare global {
  interface Window {
    basepath: string
    dataLayer: any[]
  }
}

window.addEventListener('keyup', event => {
  const escapeKeyCode = 27
  // fallback for browsers that don't support event.key
  if (event.key === 'Escape' || event.keyCode === escapeKeyCode) {
    dispatch(disablePresentationMode())
  }
})

class Root extends PureComponent {
  public render() {
    return (
      <Provider store={getStore()}>
        <ConnectedRouter history={history}>
          <Suspense fallback={<PageSpinner />}>
            <Switch>
              {/* TODO(ariel): we need to restrict access to the checkout and operator pages based on specific critera:
                https://github.com/influxdata/ui/issues/848
               */}
              {CLOUD && isFlagEnabled('unity-checkout') && (
                <Route path="/checkout" component={CheckoutPage} />
              )}
              {/* Operator Routes */}
              {/* These are lumped under individual conditions since Switch statements expects a route as a child and can't handle React Fragments */}
              {CLOUD && isFlagEnabled('unity-operator') && (
                <Route exact path="/operator" component={OperatorPage} />
              )}
              {CLOUD && isFlagEnabled('unity-operator') && (
                <Route
                  path="/operator/accounts/:accountID"
                  component={AccountPage}
                />
              )}
              {CLOUD && isFlagEnabled('unity-operator') && (
                <Route
                  path="/operator/organizations/:orgID"
                  component={OrgOverlay}
                />
              )}
              <Route component={Setup} />
            </Switch>
          </Suspense>
        </ConnectedRouter>
      </Provider>
    )
  }
}

if (rootNode) {
  render(<Root />, rootNode)
}
