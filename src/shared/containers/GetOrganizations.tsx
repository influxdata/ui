// Libraries
import React, {useEffect, FunctionComponent, lazy, Suspense} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {Route, Switch} from 'react-router-dom'
import {identify} from 'rudder-sdk-js'

// Components
import PageSpinner from 'src/perf/components/PageSpinner'
import {CheckoutPage, OperatorPage} from 'src/shared/containers'
const NoOrgsPage = lazy(() => import('src/organizations/containers/NoOrgsPage'))
const NotebookTemplates = lazy(
  () => import('src/flows/components/FromTemplatePage')
)
const App = lazy(() => import('src/App'))
const NotFound = lazy(() => import('src/shared/components/NotFound'))

// Actions
import {getOrganizations} from 'src/organizations/actions/thunks'
import RouteToOrg from 'src/shared/containers/RouteToOrg'

// Selectors
import {getAllOrgs} from 'src/resources/selectors'
import {
  selectCurrentIdentity,
  selectQuartzIdentityStatus,
  selectQuartzBillingStatus,
} from 'src/identity/selectors'

// Constants
import {CLOUD} from 'src/shared/constants'

// Utils
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {isUserOperator} from 'src/operator/utils'
import {updateReportingContext} from 'src/cloud/utils/reporting'

// Types
import {PROJECT_NAME} from 'src/flows'
import {RemoteDataState} from 'src/types'

// Thunks
import {getQuartzIdentityThunk} from 'src/identity/actions/thunks'
import {getNotebooks} from 'src/flows/actions/flowsThunks'
import {getBillingProviderThunk} from 'src/identity/actions/thunks'

const GetOrganizations: FunctionComponent = () => {
  const {status: orgLoadingStatus} = useSelector(getAllOrgs)

  // This selector is CLOUD-only. It has default empty values in OSS.
  const {user, account, org} = useSelector(selectCurrentIdentity)
  const identityLoadingStatus = useSelector(selectQuartzIdentityStatus)
  const quartzBillingStatus = useSelector(selectQuartzBillingStatus)

  const dispatch = useDispatch()

  useEffect(() => {
    if (orgLoadingStatus === RemoteDataState.NotStarted) {
      dispatch(getOrganizations())
    }
  }, [dispatch, orgLoadingStatus])

  useEffect(() => {
    if (CLOUD && identityLoadingStatus === RemoteDataState.NotStarted) {
      dispatch(getQuartzIdentityThunk())
    }
  }, [dispatch, identityLoadingStatus]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (CLOUD && quartzBillingStatus === RemoteDataState.NotStarted) {
      dispatch(getBillingProviderThunk())
    }
  }, [dispatch, quartzBillingStatus])

  useEffect(() => {
    if (
      CLOUD &&
      user.id &&
      user.email &&
      org.id &&
      account.id &&
      account.name &&
      isFlagEnabled('rudderstackReporting')
    ) {
      identify(user.id, {
        email: user.email,
        orgID: org.id,
        accountID: account.id,
        accountName: account.name,
      })
    }
  }, [user.id, user.email, org.id, account.id, account.name])

  useEffect(() => {
    if (CLOUD) {
      updateReportingContext({
        'org (hide_upgrade_cta)': `${
          account.type === 'free' && account.isUpgradeable === true
        }`,
        'org (account_type)': account.type,
      })
    }
  }, [account.type, account.isUpgradeable])

  useEffect(() => {
    if (CLOUD && org?.id) {
      dispatch(getNotebooks(org.id))
    }
  }, [org.id])

  return (
    <PageSpinner loading={orgLoadingStatus}>
      <Suspense fallback={<PageSpinner />}>
        {CLOUD ? (
          <PageSpinner loading={identityLoadingStatus}>
            <Switch>
              <Route path="/no-orgs" component={NoOrgsPage} />
              <Route
                path={`/${PROJECT_NAME.toLowerCase()}/from`}
                component={NotebookTemplates}
              />
              <Route path="/orgs" component={App} />
              <Route exact path="/" component={RouteToOrg} />
              {CLOUD && account.isUpgradeable === true && (
                <Route path="/checkout" component={CheckoutPage} />
              )}
              {CLOUD && isUserOperator(user.operatorRole) && (
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
