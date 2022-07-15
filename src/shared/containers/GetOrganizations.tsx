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
import {getCurrentOrgDetailsThunk} from 'src/identity/actions/thunks'
import {shouldUseQuartzIdentity} from 'src/identity/utils/shouldUseQuartzIdentity'
import {RemoteDataState, AppState} from 'src/types'

// Thunks
import {getQuartzIdentityThunk} from 'src/identity/actions/thunks'

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
    (state: AppState) => state.identity.currentIdentity.status
  )

  const {id: meId = '', name: email = ''} = useSelector(getMe)
  const dispatch = useDispatch()

  useEffect(() => {
    if (CLOUD && shouldUseQuartzIdentity() && quartzMe?.isRegionBeta === null) {
      dispatch(getCurrentOrgDetailsThunk())
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // This doesn't require another API call.
  useEffect(() => {
    if (status === RemoteDataState.NotStarted) {
      dispatch(getOrganizations())
    }
  }, [dispatch, status]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (
      isFlagEnabled('uiUnificationFlag') &&
      quartzMeStatus === RemoteDataState.NotStarted
    ) {
      dispatch(getQuartzIdentityThunk())
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
