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
import {FlowContext} from 'src/flows/context/flow.current'
import {FlowPage} from 'src/flows/components/FlowPage'
import {PROJECT_NAME, PROJECT_NAME_PLURAL} from '..'

const Template: FC = () => {
  const {add} = useContext(FlowListContext)
  const {flow} = useContext(FlowContext)
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
        add(data).then(id => {
          if (TEMPLATES[params[0]].callback) {
            TEMPLATES[params[0]].callback.apply(this, [params.slice(1), id])
          }
          history.replace(
            `/orgs/${org.id}/${PROJECT_NAME_PLURAL.toLowerCase()}/${id}`
          )
        })
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
