import React, {FC, useEffect, useState, useContext} from 'react'
import {useSelector} from 'react-redux'
import {Switch, Route, useHistory, useParams} from 'react-router-dom'
import {RemoteDataState, ResourceType} from 'src/types'
import {getOrg} from 'src/organizations/selectors'

import {
  RESOURCES,
  SCRIPT_EDITOR_PARAMS,
} from 'src/dataExplorer/components/resources'
import {
  PersistenceContext,
  PersistenceProvider,
  DEFAULT_FLUX_EDITOR_TEXT,
  DEFAULT_SQL_EDITOR_TEXT,
  DEFAULT_INFLUXQL_EDITOR_TEXT,
} from 'src/dataExplorer/context/persistence'
import {LanguageType} from 'src/dataExplorer/components/resources'
import {getLanguage} from 'src/dataExplorer/shared/utils'

const Template: FC = () => {
  const {setQuery, setHasChanged, setResource, clearCompositionSelection} =
    useContext(PersistenceContext)
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

    const language = getLanguage()
    let flux = DEFAULT_FLUX_EDITOR_TEXT

    switch (language) {
      case LanguageType.SQL:
        flux = DEFAULT_SQL_EDITOR_TEXT
        break
      case LanguageType.INFLUXQL:
        flux = DEFAULT_INFLUXQL_EDITOR_TEXT
        break
    }

    setLoading(RemoteDataState.Loading)
    clearCompositionSelection()
    setQuery(flux)
    setResource({
      type: ResourceType.Scripts,
      flux,
      language,
      data: {},
    })

    RESOURCES[params[0]].init.apply(this, params.slice(1)).then(data => {
      setQuery(data.flux)
      setResource(data)
      history.replace(`/orgs/${org.id}/data-explorer${SCRIPT_EDITOR_PARAMS}`)
      setHasChanged(false)
    })
  }, [params])

  return <div></div>
}

const TemplatePage: FC = () => {
  const org = useSelector(getOrg)

  return (
    <PersistenceProvider>
      <Switch>
        <Route
          path={`/orgs/${org.id}/data-explorer/from/*`}
          component={Template}
        />
        <Route component={() => <div />} />
      </Switch>
    </PersistenceProvider>
  )
}

export default TemplatePage
