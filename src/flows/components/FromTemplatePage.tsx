import React, {FC, useEffect, useContext, useState} from 'react'
import {useSelector} from 'react-redux'
import {Route, Switch, useHistory, useParams} from 'react-router-dom'

import {TEMPLATES} from 'src/flows/templates'

import {getOrg} from 'src/organizations/selectors'
import NotFound from 'src/shared/components/NotFound'
import {event} from 'src/cloud/utils/reporting'
import {
  FlowListProvider,
  FlowListContext,
  hydrate,
} from 'src/flows/context/flow.list'
import {FlowProvider, FlowContext} from 'src/flows/context/flow.current'
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

const Template: FC = () => {
  const {add} = useContext(FlowListContext)
  const {flow, populate} = useContext(FlowContext)
  const [loading, setLoading] = useState(false)
  const org = useSelector(getOrg)
  const history = useHistory()
  const params = useParams()[0].split('/')

  useEffect(() => {
    if (!TEMPLATES[params[0]]) {
      return
    }

    if (loading) {
      return
    }

    setLoading(true)

    event('Notebook created from template', {type: params[0]})

    const data = hydrate(TEMPLATES[params[0]].init.apply(this, params.slice(1)))

    if (isFlagEnabled('ephemeralNotebook')) {
      populate(data)
    } else {
      add(data).then(id => {
        history.replace(`/orgs/${org.id}/notebooks/${id}`)
      })
      return
    }
  }, [])

  if (!flow) {
    return <div />
  }

  return <FlowPage />
}

const FromTemplatePage: FC = () => {
  if (isFlagEnabled('ephemeralNotebook')) {
    return (
      <AppWrapper>
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
                <Route path="/notebook/from/*" component={Template} />
                <Route component={NotFound} />
              </Switch>
            </FlowProvider>
          </FlowListProvider>
        </QueryProvider>
      </AppWrapper>
    )
  }

  return (
    <FlowListProvider>
      <Switch>
        <Route path="/notebook/from/*" component={Template} />
        <Route component={NotFound} />
      </Switch>
    </FlowListProvider>
  )
}

export default FromTemplatePage
