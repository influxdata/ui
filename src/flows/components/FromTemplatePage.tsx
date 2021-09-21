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

const Template: FC = () => {
  const {add} = useContext(FlowListContext)
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
      .then(data => add(hydrate(data)))
      .then(id => {
        history.replace(`/orgs/${org.id}/notebooks/${id}`)
      })
      .catch(() => {
        setLoading(RemoteDataState.Error)
      })
  }, [add, history, org.id, loading, setLoading, params])

  if (loading === RemoteDataState.Error) {
    return <NotFound />
  }

  return <div />
}

const FromTemplatePage: FC = () => {
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
