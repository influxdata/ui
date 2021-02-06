// Libraries
import React, {useEffect, FunctionComponent, lazy, Suspense} from 'react'
import {connect, ConnectedProps, useDispatch} from 'react-redux'
import {Route, Switch} from 'react-router-dom'

// Components
import PageSpinner from 'src/perf/components/PageSpinner'
const NoOrgsPage = lazy(() => import('src/organizations/containers/NoOrgsPage'))
const App = lazy(() => import('src/App'))
const NotFound = lazy(() => import('src/shared/components/NotFound'))

// Types
import {RemoteDataState, AppState} from 'src/types'

// Actions
import {getOrganizations} from 'src/organizations/actions/thunks'
import RouteToOrg from './RouteToOrg'

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
    <PageSpinner loading={status}>
      <Suspense fallback={<PageSpinner />}>
        <Switch>
          <Route path="/no-orgs" component={NoOrgsPage} />
          <Route path="/orgs" component={App} />
          <Route exact path="/" component={RouteToOrg} />
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </PageSpinner>
  )
}

const mstp = ({resources}: AppState) => ({
  status: resources.orgs.status,
})

const connector = connect(mstp)

export default connector(GetOrganizations)
