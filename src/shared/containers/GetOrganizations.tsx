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
import {getMe} from 'src/me/selectors'
import {
  selectQuartzIdentity,
  selectQuartzIdentityStatus,
} from 'src/identity/selectors'

// Constants
import {CLOUD} from 'src/shared/constants'

// Utils
import {isFlagEnabled} from 'src/shared/utils/featureFlag'
import {convertStringToEpoch} from 'src/shared/utils/dateTimeUtils'
import {updateReportingContext} from 'src/cloud/utils/reporting'

// Types
import {PROJECT_NAME} from 'src/flows'
import {RemoteDataState} from 'src/types'

// Thunks
import {getQuartzIdentityThunk} from 'src/identity/actions/thunks'

const canAccessCheckout = (account): boolean => {
  if (!account.isUpgradeable) {
    return false
  }
  return account.type !== 'pay_as_you_go' && account.type !== 'contract'
}

const GetOrganizations: FunctionComponent = () => {
  const {status: orgLoadingStatus, org} = useSelector(getAllOrgs)
  const identity = useSelector(selectQuartzIdentity)
  const {account, user, org: currentOrg} = identity.currentIdentity
  const identityStatus = useSelector(selectQuartzIdentityStatus)
  const {id: meId = '', name: email = ''} = useSelector(getMe)

  const dispatch = useDispatch()

  // This doesn't require another API call.
  useEffect(() => {
    if (orgLoadingStatus === RemoteDataState.NotStarted) {
      dispatch(getOrganizations())
    }
  }, [dispatch, orgLoadingStatus]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (
      CLOUD &&
      user.email &&
      currentOrg.id &&
      account.id &&
      account.name &&
      isFlagEnabled('rudderstackReporting')
    ) {
      identify(meId, {
        email: user.email,
        orgID: currentOrg.id,
        accountID: account.id,
        accountName: account.name,
      })
    }
  }, [meId, user.email, currentOrg.id, account.id, account.name])

  useEffect(() => {
    if (CLOUD && identityStatus === RemoteDataState.NotStarted) {
      dispatch(getQuartzIdentityThunk())
    }
  }, [dispatch, identityStatus])

  // This doesn't require another API call.
  useEffect(() => {
    if (
      isFlagEnabled('credit250Experiment') &&
      orgLoadingStatus === RemoteDataState.Done
    ) {
      const orgId = org?.id ?? ''
      window.dataLayer = window.dataLayer ?? []
      window.dataLayer.push({
        identity: {
          account_type: account.type,
          account_created_at: convertStringToEpoch(account.accountCreatedAt),
          id: meId,
          email,
          organization_id: orgId,
        },
      })
    }
  }, [identityStatus, orgLoadingStatus]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (CLOUD) {
      updateReportingContext({
        'org (hide_upgrade_cta)': `${
          account.type === 'free' && account.isUpgradeable
        }`,
        'org (account_type)': account.type,
      })
    }
  }, [account.type, account.isUpgradeable])

  return (
    <PageSpinner loading={orgLoadingStatus}>
      <Suspense fallback={<PageSpinner />}>
        {CLOUD ? (
          <PageSpinner loading={identityStatus}>
            <Switch>
              <Route path="/no-orgs" component={NoOrgsPage} />
              <Route
                path={`/${PROJECT_NAME.toLowerCase()}/from`}
                component={NotebookTemplates}
              />
              <Route path="/orgs" component={App} />
              <Route exact path="/" component={RouteToOrg} />
              {CLOUD && canAccessCheckout(account) && (
                <Route path="/checkout" component={CheckoutPage} />
              )}
              {CLOUD && user.operatorRole && (
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
