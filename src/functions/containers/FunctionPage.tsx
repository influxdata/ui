// Libraries
import React, {FC, lazy, Suspense, useContext, useState} from 'react'
import {useHistory} from 'react-router-dom'
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

const FunctionPage: FC = () => {
  const history = useHistory()
  const {id: orgID} = useSelector(getOrg)

  const [name, setName] = useState('New Function')
  const [description, setDescription] = useState('')
  const [params, setParams] = useState('')
  const [script, setScript] = useState('')
  const [runResult, setRunResult] = useState({})

  const {add, trigger} = useContext(FunctionListContext)

  const saveFunction = () => {
    add({name, description, script})
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
    <Page titleTag={pageTitleSuffixer(['New Function'])}>
      <FunctionHeader
        name={name}
        saveFunction={saveFunction}
        cancelFunction={cancelFunction}
      />
      <Page.Contents fullWidth={true} scrollable={true}>
        <div className="function-form">
          <div className="function-form--options">
            <FunctionForm
              name={name}
              setName={setName}
              description={description}
              setDescription={setDescription}
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

export default FunctionPage
