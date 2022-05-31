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
import {getQuartzMe as apiGetQuartzMe} from 'src/me/actions/thunks'
import RouteToOrg from 'src/shared/containers/RouteToOrg'

// Selectors
import {getAllOrgs} from 'src/resources/selectors'
import {getMe, getQuartzMe} from 'src/me/selectors'

// Constants
import {CLOUD} from 'src/shared/constants'

// Utils
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {convertStringToEpoch} from 'src/shared/utils/dateTimeUtils'

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
  console.log('entering getOrganizations component')

  const {status, org} = useSelector(getAllOrgs)
  const quartzMeStatus = useSelector(
    (state: AppState) => state.me.quartzMeStatus
  )
  const quartzMe = useSelector(getQuartzMe)
  const {id: meId = '', name: email = ''} = useSelector(getMe)
  const dispatch = useDispatch()

  useEffect(() => {
    if (status === RemoteDataState.NotStarted) {
      console.log('getting organizations')
      dispatch(getOrganizations())
    }
  }, [dispatch, status])

  useEffect(() => {
    if (
      isFlagEnabled('uiUnificationFlag') &&
      quartzMeStatus === RemoteDataState.NotStarted
    ) {
      console.log('dispatching apiGetQuartzMe')
      dispatch(apiGetQuartzMe())
    }
  }, [dispatch, quartzMeStatus])

  useEffect(() => {
    if (
      isFlagEnabled('credit250Experiment') &&
      quartzMeStatus === RemoteDataState.Done &&
      status === RemoteDataState.Done
    ) {
      const {
        accountType: account_type,
        accountCreatedAt: account_created_at = '',
      } = quartzMe
      const orgId = org?.id ?? ''
      window.dataLayer = window.dataLayer ?? []
      window.dataLayer.push({
        identity: {
          account_type,
          account_created_at: convertStringToEpoch(account_created_at),
          id: meId,
          email,
          organization_id: orgId,
        },
      })
    }
  }, [quartzMeStatus, status]) // eslint-disable-line react-hooks/exhaustive-deps

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
              {CLOUD && canAccessCheckout(quartzMe) && (
                <Route path="/checkout" component={CheckoutPage} />
              )}
              {CLOUD && quartzMe?.isOperator && (
                <Route path="/operator" component={OperatorPage} />
              )}
              <Route component={NotFound} />
            </Switch>
          </PageSpinner>
        ) : (
          <Switch>
            <Route path="/no-orgs" component={NoOrgsPage} />
            <Route
              path={`/${PROJECT_NAME.toLowerCase()}/from`}
              component={NotebookTemplates}
            />
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
