import React, {FC, useEffect, useContext, useState} from 'react'
import {useSelector} from 'react-redux'
import {Route, Switch, useHistory, useParams} from 'react-router-dom'

import {DEFAULT_TIME_RANGE} from 'src/shared/constants/timeRanges'
import {AUTOREFRESH_DEFAULT} from 'src/shared/constants'

import {getOrg} from 'src/organizations/selectors'
import NotFound from 'src/shared/components/NotFound'
import {
  FlowListProvider,
  FlowListContext,
  hydrate,
} from 'src/flows/context/flow.list'

// TODO: decouple this to make it more universal like visualizations and flow panels

// NOTE: Add your templates here. the object key is going to turn into the route suffix
// (ie: `/notebook/from/${key}`) and the value of the entry is going to be the notebook
// that is generated
const TEMPLATE_MAP = {
  intro: {
    name: 'Welcome to Notebooks',
    readOnly: false,
    range: DEFAULT_TIME_RANGE,
    refresh: AUTOREFRESH_DEFAULT,
    pipes: [
      {
        title: 'Welcome',
        visible: true,
        type: 'youtube',
        uri: 'Rs16uhxK0h8',
      },
    ],
  },
}

const Template: FC = () => {
  const {add} = useContext(FlowListContext)
  const [loading, setLoading] = useState(false)
  const org = useSelector(getOrg)
  const history = useHistory()
  const {template} = useParams()

  useEffect(() => {
    setLoading(false)
  }, [template, setLoading])

  useEffect(() => {
    if (!TEMPLATE_MAP[template]) {
      return
    }

    if (loading) {
      return
    }

    setLoading(true)

    add(hydrate(TEMPLATE_MAP[template])).then(id => {
      history.push(`/orgs/${org.id}/notebooks/${id}`)
    })
  }, [add, history, org.id, loading, setLoading, template])

  return <div />
}

const FromTemplatePage: FC = () => {
  return (
    <FlowListProvider>
      <Switch>
        <Route path="/notebook/from/:template" component={Template} />
        <Route component={NotFound} />
      </Switch>
    </FlowListProvider>
  )
}

export default FromTemplatePage
