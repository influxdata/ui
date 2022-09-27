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
  selectCurrentIdentity,
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

const GetOrganizations: FunctionComponent = () => {
  const {id: meId = '', name: email = ''} = useSelector(getMe)
  const {account, user, org: quartzOrg} = useSelector(selectCurrentIdentity)
  const identityLoadingStatus = useSelector(selectQuartzIdentityStatus)
  const {status: orgLoadingStatus, org} = useSelector(getAllOrgs)

  const shouldLoadIdentity =
    identityLoadingStatus === RemoteDataState.NotStarted
  const identityFinishedLoading = identityLoadingStatus === RemoteDataState.Done

  const shouldLoadOrg = orgLoadingStatus === RemoteDataState.NotStarted
  const orgFinishedLoading = orgLoadingStatus === RemoteDataState.Done

  const dispatch = useDispatch()

  // This doesn't require another API call.
  useEffect(() => {
    if (shouldLoadOrg) {
      dispatch(getOrganizations())
    }
  }, [dispatch, shouldLoadOrg])

  useEffect(() => {
    if (
      CLOUD &&
      user.email &&
      quartzOrg.id &&
      account.id &&
      account.name &&
      isFlagEnabled('rudderstackReporting')
    ) {
      identify(meId, {
        email: user.email,
        orgID: quartzOrg.id,
        accountID: account.id,
        accountName: account.name,
      })
    }
  }, [meId, user.email, quartzOrg.id, account.id, account.name])

  useEffect(() => {
    if (CLOUD && shouldLoadIdentity) {
      dispatch(getQuartzIdentityThunk())
    }
  }, [dispatch, shouldLoadIdentity])

  // This doesn't require another API call.
  useEffect(() => {
    if (
      isFlagEnabled('credit250Experiment') &&
      identityFinishedLoading &&
      orgFinishedLoading
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
  }, [identityFinishedLoading, orgFinishedLoading]) // eslint-disable-line react-hooks/exhaustive-deps

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
              {CLOUD &&
                (user.operatorRole === 'read-only' ||
                  user.operatorRole === 'read-write') && (
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
