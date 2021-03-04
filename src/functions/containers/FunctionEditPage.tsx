// Libraries
import React, {FC, lazy, Suspense, useContext, useEffect, useState} from 'react'
import {useHistory, useParams} from 'react-router-dom'
import {useSelector} from 'react-redux'

// Components
import {
  Page,
  RemoteDataState,
  SpinnerContainer,
  TechnoSpinner,
} from '@influxdata/clockface'
import FunctionHeader from 'src/functions/components/FunctionHeader'
import FunctionForm from 'src/functions/components/FunctionForm'
import {FunctionListContext} from 'src/functions/context/function.list'

const FluxMonacoEditor = lazy(() =>
  import('src/shared/components/FluxMonacoEditor')
)

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'
import {getOrg} from 'src/organizations/selectors'

const FunctionEditPage: FC = () => {
  const history = useHistory()
  const {id: functionID} = useParams<{id: string}>()
  const {id: orgID} = useSelector(getOrg)

  const [name, setName] = useState('New Function')
  const [params, setParams] = useState('')
  const [script, setScript] = useState('')

  const [runResult, setRunResult] = useState({})

  const {functionsList, update, trigger} = useContext(FunctionListContext)

  useEffect(() => {
    const func = functionsList[functionID]
    if (func) {
      const {name, script} = func
      setName(name)
      setScript(script)
    }
  }, [functionsList, functionID, setName, setScript])

  const updateFunction = () => {
    update(functionID, name, script)
  }

  const cancelFunction = () => {
    history.push(`/orgs/${orgID}/functions/`)
    // TODO dont allow routing away if unsaved changes exist
  }

  const triggerFunction = async () => {
    const runResponse = await trigger({script, params})
    setRunResult(runResponse)
  }

  return (
    <Page titleTag={pageTitleSuffixer(['Edit Function'])}>
      <FunctionHeader
        name={name}
        saveFunction={updateFunction}
        cancelFunction={cancelFunction}
      />
      <Page.Contents fullWidth={true} scrollable={true}>
        <div className="function-form">
          <div className="function-form--options">
            <FunctionForm
              name={name}
              setName={setName}
              params={params}
              setParams={setParams}
              triggerFunction={triggerFunction}
              runResult={runResult}
            />
          </div>
          <div className="function-form--editor">
            <Suspense
              fallback={
                <SpinnerContainer
                  loading={RemoteDataState.Loading}
                  spinnerComponent={<TechnoSpinner />}
                />
              }
            >
              <FluxMonacoEditor script={script} onChangeScript={setScript} />
            </Suspense>
          </div>
        </div>
      </Page.Contents>
    </Page>
  )
}

export default FunctionEditPage
