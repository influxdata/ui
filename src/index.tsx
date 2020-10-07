import 'babel-polyfill'
import 'abortcontroller-polyfill/dist/polyfill-patch-fetch'

// Libraries
import React, {PureComponent} from 'react'
import {render} from 'react-dom'
import {Provider} from 'react-redux'
import {Route} from 'react-router-dom'
import {ConnectedRouter} from 'connected-react-router'

// Stores
import {getStore} from 'src/store/configureStore'
import {history} from 'src/store/history'

// Components
import Setup from 'src/Setup'
import GetLinks from 'src/shared/containers/GetLinks'

// Utilities
import {getRootNode} from 'src/utils/nodes'
import {updateReportingContext} from 'src/cloud/utils/reporting'

// Actions
import {disablePresentationMode} from 'src/shared/actions/app'

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
          <Route component={GetLinks} />
          <Route component={Setup} />
        </ConnectedRouter>
      </Provider>
    )
  }
}

if (rootNode) {
  render(<Root />, rootNode)
}
