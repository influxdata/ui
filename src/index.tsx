import 'babel-polyfill'
import 'abortcontroller-polyfill/dist/polyfill-patch-fetch'

// Libraries
import React, {PureComponent, Suspense} from 'react'
import {render} from 'react-dom'
import {Provider} from 'react-redux'
import {Route} from 'react-router-dom'
import {ConnectedRouter} from 'connected-react-router'

// Stores
import {getStore} from 'src/store/configureStore'
import {history} from 'src/store/history'

// Components
import Setup from 'src/Setup'
import PageSpinner from 'src/perf/components/PageSpinner'

// Utilities
import {getRootNode} from 'src/utils/nodes'
import {
  updateReportingContext,
  updateCampaignInfo,
} from 'src/cloud/utils/reporting'

// Constants
import {CLOUD} from 'src/shared/constants'

// Actions
import {disablePresentationMode} from 'src/shared/actions/app'

// Styles
import 'src/style/chronograf.scss'
import '@influxdata/clockface/dist/index.css'
import '@docsearch/css'
const rootNode = getRootNode()

const SESSION_KEY = 'session'

const cookieSession = document.cookie.match(
  new RegExp('(^| )' + SESSION_KEY + '=([^;]+)')
)

updateReportingContext({
  session: cookieSession ? cookieSession[2].slice(5) : '',
})

if (CLOUD) {
  updateCampaignInfo(window.location.search)
}

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
    userpilot: any
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
            <Route component={Setup} />
          </Suspense>
        </ConnectedRouter>
      </Provider>
    )
  }
}

if (rootNode) {
  render(<Root />, rootNode)
}
