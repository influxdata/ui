import React, {FC, useEffect, useState, useContext} from 'react'
import {useSelector} from 'react-redux'
import {Switch, Route, useHistory, useParams} from 'react-router-dom'
import {RemoteDataState} from 'src/types'

import {getOrg} from 'src/organizations/selectors'

import {RESOURCES} from 'src/dataExplorer/components/resources'
import {
  PersistanceContext,
  PersistanceProvider,
} from 'src/dataExplorer/context/persistance'

const Template: FC = () => {
  const {
    setQuery,
    setHasChanged,
    setResource,
    clearSchemaSelection,
  } = useContext(PersistanceContext)
  const params = useParams()[0].split('/')
  const org = useSelector(getOrg)
  const history = useHistory()
  const [loading, setLoading] = useState(RemoteDataState.NotStarted)

  if (!params[0].endsWith('s')) {
    params[0] += 's'
  }

  useEffect(() => {
    if (!RESOURCES[params[0]] || RESOURCES[params[0]].disabled) {
      setLoading(RemoteDataState.Error)
      return
    }

    if (loading !== RemoteDataState.NotStarted) {
      return
    }

    setLoading(RemoteDataState.Loading)
    clearSchemaSelection()
    setQuery('')
    setResource(null)

    RESOURCES[params[0]].init.apply(this, params.slice(1)).then(data => {
      setQuery(data.flux)
      setResource(data)
      history.replace(`/orgs/${org.id}/data-explorer`)
      setHasChanged(false)
    })
  }, [params])

  return <div></div>
}

const TemplatePage: FC = () => {
  const org = useSelector(getOrg)

  return (
    <PersistanceProvider>
      <Switch>
        <Route
          path={`/orgs/${org.id}/data-explorer/from/*`}
          component={Template}
        />
        <Route component={() => <div />} />
      </Switch>
    </PersistanceProvider>
  )
}

export default TemplatePage
