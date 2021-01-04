// Libraries
import React, {PureComponent} from 'react'
import {Switch, Route} from 'react-router-dom'

// Components
import {ErrorHandling} from 'src/shared/decorators/errors'
import FitbitPage from 'src/writeData/components/Integrations/FitbitIndex'

// Constants
import {ORGS, ORG_ID, INTEGRATIONS} from 'src/shared/constants/routes'

const integrationPath = `/${ORGS}/${ORG_ID}/load-data/${INTEGRATIONS}`

@ErrorHandling
class IntegrationsPage extends PureComponent {
  public render() {
    const {children} = this.props

    return (
      <>
        <Switch>
          {/* <Route path={integrationPath} exact component={ClientLibrariesIndex} /> */}
          <Route
            path={`${integrationPath}/:contentID`}
            component={FitbitPage}
          />
        </Switch>
        {children}
      </>
    )
  }
}

export default IntegrationsPage