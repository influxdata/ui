// Libraries
import React, {useEffect, FunctionComponent, lazy, Suspense} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {Route, Switch} from 'react-router-dom'

// Components
import PageSpinner from 'src/perf/components/PageSpinner'
import {CheckoutPage, OperatorPage} from 'src/shared/containers'
const NoOrgsPage = lazy(() => import('src/organizations/containers/NoOrgsPage'))
const NotebookTemplates = lazy(() =>
  import('src/flows/components/FromTemplatePage')
)
const App = lazy(() => import('src/App'))
const NotFound = lazy(() => import('src/shared/components/NotFound'))

// Types
import {RemoteDataState, AppState} from 'src/types'

// Actions
import {getOrganizations} from 'src/organizations/actions/thunks'
import {getQuartzMe} from 'src/me/actions/thunks'
import RouteToOrg from 'src/shared/containers/RouteToOrg'

// Constants
import {CLOUD} from 'src/shared/constants'

// Utils
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

// Types
import {Me} from 'src/client/unityRoutes'
import {PROJECT_NAME} from 'src/flows'

const canAccessCheckout = (me: Me): boolean => {
  if (!!me?.isRegionBeta) {
    return false
  }
  return me?.accountType !== 'pay_as_you_go' && me?.accountType !== 'contract'
}

const GetOrganizations: FunctionComponent = () => {
  const status = useSelector((state: AppState) => state.resources.orgs.status)
  const quartzMeStatus = useSelector(
    (state: AppState) => state.me.quartzMeStatus
  )
  const me = useSelector((state: AppState) => state.me.quartzMe)
  const dispatch = useDispatch()
  useEffect(() => {
    if (status === RemoteDataState.NotStarted) {
      dispatch(getOrganizations())
    }
  }, [dispatch, status])

  useEffect(() => {
    if (
      isFlagEnabled('uiUnificationFlag') &&
      quartzMeStatus === RemoteDataState.NotStarted
    ) {
      dispatch(getQuartzMe())
    }
  }, [dispatch, quartzMeStatus])

  return (
    <PageSpinner loading={status}>
      <Suspense fallback={<PageSpinner />}>
        {/*
          NOTE: We'll need this here until Tools gets Quartz integrated
          Since the API request will fail in a tools environment.
        */}
        {isFlagEnabled('uiUnificationFlag') ? (
          <PageSpinner loading={quartzMeStatus}>
            <Switch>
              <Route path="/no-orgs" component={NoOrgsPage} />
              <Route
                path={`/${PROJECT_NAME.toLowerCase()}/from`}
                component={NotebookTemplates}
              />
              <Route path="/orgs" component={App} />
              <Route exact path="/" component={RouteToOrg} />
              {CLOUD && canAccessCheckout(me) && (
                <Route path="/checkout" component={CheckoutPage} />
              )}
              {CLOUD && me?.isOperator && (
                <Route path="/operator" component={OperatorPage} />
              )}
              <Route component={NotFound} />
            </Switch>
          </PageSpinner>
        ) : (
          <Switch>
            <Route path="/no-orgs" component={NoOrgsPage} />
            <Route path="/notebook/from" component={NotebookTemplates} />
            <Route path="/orgs" component={App} />
            <Route exact path="/" component={RouteToOrg} />
            <Route component={NotFound} />
          </Switch>
        )}
      </Suspense>
    </PageSpinner>
  )
}

export default GetOrganizations
