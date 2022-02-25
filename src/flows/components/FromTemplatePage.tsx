import React, {FC, useEffect, useContext, useState} from 'react'
import {useSelector} from 'react-redux'
import {Route, Switch, useHistory, useParams} from 'react-router-dom'

import {TEMPLATES} from 'src/flows/templates'
import {RemoteDataState} from 'src/types'

import {getOrg} from 'src/organizations/selectors'
import NotFound from 'src/shared/components/NotFound'
import {event} from 'src/cloud/utils/reporting'
import {
  FlowListProvider,
  FlowListContext,
  hydrate,
} from 'src/flows/context/flow.list'
import {FlowProvider, FlowContext} from 'src/flows/context/flow.current'
import {AppSettingProvider} from 'src/shared/contexts/app'
import QueryProvider from 'src/shared/contexts/query'
import {FlowPage} from 'src/flows/components/FlowPage'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

import {AppWrapper} from '@influxdata/clockface'
import TreeNav from 'src/pageLayout/containers/TreeNav'
import TooltipPortal from 'src/portals/TooltipPortal'
import NotesPortal from 'src/portals/NotesPortal'
import Notifications from 'src/shared/components/notifications/Notifications'
import {
  OverlayProviderComp,
  OverlayController,
} from 'src/overlays/components/OverlayController'
import EngagementLink from 'src/cloud/components/onboarding/EngagementLink'
import {PROJECT_NAME, PROJECT_NAME_PLURAL} from '..'

const Template: FC = () => {
  const {add} = useContext(FlowListContext)
  const {flow, populate} = useContext(FlowContext)
  const [loading, setLoading] = useState(RemoteDataState.NotStarted)
  const org = useSelector(getOrg)
  const history = useHistory()
  const params = useParams()[0].split('/')

  useEffect(() => {
    if (!TEMPLATES[params[0]]) {
      return
    }

    if (loading !== RemoteDataState.NotStarted) {
      return
    }

    setLoading(RemoteDataState.Loading)

    event('Notebook created from template', {type: params[0]})

    TEMPLATES[params[0]].init
      .apply(this, params.slice(1))
      .then(data => {
        data.orgID = org.id
        return hydrate(data)
      })
      .then(data => {
        if (
          isFlagEnabled('ephemeralNotebook') &&
          !isFlagEnabled('flowPublishLifecycle')
        ) {
          populate(data)
        } else {
          add(data).then(id => {
            history.replace(
              `/orgs/${org.id}/${PROJECT_NAME_PLURAL.toLowerCase()}/${id}`
            )
          })
        }
      })
      .catch(() => {
        setLoading(RemoteDataState.Error)
      })
  }, [add, history, org.id, loading, setLoading, params])

  if (loading === RemoteDataState.Error) {
    return <NotFound />
  }

  if (!flow) {
    return <div />
  }

  return <FlowPage />
}

const FromTemplatePage: FC = () => {
  if (
    isFlagEnabled('ephemeralNotebook') &&
    !isFlagEnabled('flowPublishLifecycle')
  ) {
    return (
      <AppWrapper>
        <AppSettingProvider>
          <Notifications />
          <TooltipPortal />
          <NotesPortal />
          <OverlayProviderComp>
            <OverlayController />
          </OverlayProviderComp>
          <EngagementLink />
          <TreeNav />
          <QueryProvider>
            <FlowListProvider>
              <FlowProvider>
                <Switch>
                  <Route
                    path={`/${PROJECT_NAME.toLowerCase()}/from/*`}
                    component={Template}
                  />
                  <Route component={NotFound} />
                </Switch>
              </FlowProvider>
            </FlowListProvider>
          </QueryProvider>
        </AppSettingProvider>
      </AppWrapper>
    )
  }

  return (
    <FlowListProvider>
      <Switch>
        <Route
          path={`/${PROJECT_NAME.toLowerCase()}/from/*`}
          component={Template}
        />
        <Route component={NotFound} />
      </Switch>
    </FlowListProvider>
  )
}

export default FromTemplatePage
