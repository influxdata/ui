// Libraries
import React, {FC, Suspense, lazy, useContext} from 'react'
import {useSelector} from 'react-redux'
import classnames from 'classnames'
import {Switch, Route} from 'react-router-dom'

import {AppSettingContext, AppSettingProvider} from 'src/shared/contexts/app'

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

const App: FC = () => {
  const {theme, presentationMode} = useContext(AppSettingContext)
  const currentPage = useSelector((state: AppState) => state.currentPage)

  const appWrapperClass = classnames('', {
    'dashboard-light-mode': currentPage === 'dashboard' && theme === 'light',
  })

  return (
    <AppWrapper presentationMode={presentationMode} className={appWrapperClass}>
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

export default () => (
  <AppSettingProvider>
    <App />
  </AppSettingProvider>
)
