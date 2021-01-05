// Libraries
import React, {useEffect, FunctionComponent} from 'react'
import {connect, ConnectedProps, useDispatch} from 'react-redux'
import {Route, Switch} from 'react-router-dom'

// Components
import {SpinnerContainer, TechnoSpinner} from '@influxdata/clockface'
import NoOrgsPage from 'src/organizations/containers/NoOrgsPage'
import App from 'src/App'
import NotFound from 'src/shared/components/NotFound'

// Types
import {RemoteDataState, AppState} from 'src/types'

// Actions
import {getOrganizations} from 'src/organizations/actions/thunks'
import RouteToOrg from './RouteToOrg'
import FitbitCallback from 'src/writeData/components/Integrations/FitbitCallback'

type ReduxProps = ConnectedProps<typeof connector>
type Props = ReduxProps

const GetOrganizations: FunctionComponent<Props> = ({status}) => {
  const dispatch = useDispatch()
  useEffect(() => {
    if (status === RemoteDataState.NotStarted) {
      dispatch(getOrganizations())
    }
  }, [dispatch, status])

  return (
    <SpinnerContainer loading={status} spinnerComponent={<TechnoSpinner />}>
      <Switch>
        <Route path="/no-orgs" component={NoOrgsPage} />
        <Route path="/fitbit-api-callback" component={FitbitCallback} />
        <Route path="/orgs" component={App} />
        <Route exact path="/" component={RouteToOrg} />
        <Route component={NotFound} />
      </Switch>
    </SpinnerContainer>
  )
}

const mstp = ({resources}: AppState) => ({
  status: resources.orgs.status,
})

const connector = connect(mstp)

export default connector(GetOrganizations)
