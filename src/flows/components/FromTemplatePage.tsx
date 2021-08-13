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

const Template: FC = () => {
  const {add} = useContext(FlowListContext)
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

    add(hydrate(TEMPLATES[params[0]].init.apply(this, params.slice(1)))).then(
      id => {
        history.replace(`/orgs/${org.id}/notebooks/${id}`)
      }
    )
  }, [add, history, org.id, loading, setLoading, params])

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
