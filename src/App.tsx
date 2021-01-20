// Libraries
import React, {FC, Suspense, lazy} from 'react'
import {withRouter, RouteComponentProps} from 'react-router-dom'
import {connect, ConnectedProps} from 'react-redux'
import classnames from 'classnames'
import {Switch, Route} from 'react-router-dom'

// Components
import {AppWrapper} from '@influxdata/clockface'
import TreeNav from 'src/pageLayout/containers/TreeNav'
import TooltipPortal from 'src/portals/TooltipPortal'
import NotesPortal from 'src/portals/NotesPortal'
import Notifications from 'src/shared/components/notifications/Notifications'
import {
  OverlayProviderComp,
  OverlayController,
} from 'src/overlays/components/OverlayController'
import PageSpinner from 'src/perf/components/PageSpinner'
const SetOrg = lazy(() => import('src/shared/containers/SetOrg'))
const CreateOrgOverlay = lazy(() =>
  import('src/organizations/components/CreateOrgOverlay')
)

// Types
import {AppState} from 'src/types'

type ReduxProps = ConnectedProps<typeof connector>
type RouterProps = RouteComponentProps
type Props = ReduxProps & RouterProps

const App: FC<Props> = ({inPresentationMode, currentPage, theme}) => {
  const appWrapperClass = classnames('', {
    'dashboard-light-mode': currentPage === 'dashboard' && theme === 'light',
  })

  return (
    <AppWrapper
      presentationMode={inPresentationMode}
      className={appWrapperClass}
    >
      <Notifications />
      <TooltipPortal />
      <NotesPortal />
      <OverlayProviderComp>
        <OverlayController />
      </OverlayProviderComp>
      <TreeNav />
      <Suspense fallback={<PageSpinner />}>
        <Switch>
          <Route path="/orgs/new" component={CreateOrgOverlay} />
          <Route path="/orgs/:orgID" component={SetOrg} />
        </Switch>
      </Suspense>
    </AppWrapper>
  )
}

const mstp = (state: AppState) => {
  const {
    app: {
      ephemeral: {inPresentationMode},
      persisted: {theme},
    },
    currentPage,
  } = state

  return {inPresentationMode, currentPage, theme}
}

const connector = connect(mstp)

export default connector(withRouter(App))
