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
import {getQuartzMeThunk} from 'src/me/actions/thunks'
import {getCurrentOrgDetailsThunk} from 'src/identity/actions/thunks'

const canAccessCheckout = (me: Me): boolean => {
  if (!!me?.isRegionBeta) {
    return false
  }
  return me?.accountType !== 'pay_as_you_go' && me?.accountType !== 'contract'
}

const GetOrganizations: FunctionComponent = () => {
  const {status, org} = useSelector(getAllOrgs)

  const quartzMeStatus = useSelector(
    (state: AppState) => state.me.quartzMeStatus
  )
  const quartzMe = useSelector(getQuartzMe)

  const quartzIdentityStatus = useSelector(
    (state: AppState) => state.identity.status
  )

  const {id: meId = '', name: email = ''} = useSelector(getMe)
  const dispatch = useDispatch()

  // It isn't ideal to need to retrieve isRegionBeta from a separate endpoint, just to access the GetOrganizations component.
  useEffect(() => {
    // Remove quartzIdentity condition once flag is deployed for all users.
    if (
      CLOUD &&
      isFlagEnabled('quartzIdentity') &&
      quartzMe?.isRegionBeta === null
    ) {
      dispatch(getCurrentOrgDetailsThunk())
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // This doesn't require another API call.
  useEffect(() => {
    console.log('about to get organizations')
    if (status === RemoteDataState.NotStarted) {
      dispatch(getOrganizations())
    }
  }, [dispatch, status]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    console.log('about to get quartz')
    if (
      isFlagEnabled('uiUnificationFlag') &&
      quartzMeStatus === RemoteDataState.NotStarted
      // For now, just check whether quartzMeStatus is not set, because quartzMe is what is
      // currently being used by the application.
    ) {
      dispatch(getQuartzMeThunk())
    }
  }, [quartzMeStatus, quartzIdentityStatus]) // eslint-disable-line react-hooks/exhaustive-deps

  // This doesn't require another API call.
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
