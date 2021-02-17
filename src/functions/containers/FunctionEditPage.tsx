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
import FunctionListProvider, {
  FunctionListContext,
} from 'src/functions/context/function.list'

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
  const [description, setDescription] = useState('')
  const [params, setParams] = useState('')
  const [script, setScript] = useState('')

  const {functionsList} = useContext(FunctionListContext)
  useEffect(() => {
    const {name, script, description} = functionsList[functionID]
    // TODO what if functionID no exist??
    setName(name)
    setScript(script)
    setDescription(description)
  }, [functionsList, functionID, setName, setScript, setDescription])

  const {trigger} = useContext(FunctionListContext)

  const updateFunction = () => {
    // TODO route away if saved, stay if error
  }

  const cancelFunction = () => {
    history.push(`/orgs/${orgID}/functions/`)
    // TODO dont allow routing away if unsaved changes exist
  }

  const triggerFunction = () => {
    trigger({script, params})
  }

  return (
    <Page titleTag={pageTitleSuffixer(['Edit Function'])}>
      <FunctionHeader
        name={name}
        saveFunction={updateFunction}
        cancelFunction={cancelFunction}
      />
      <Page.Contents fullWidth={false} scrollable={true}>
        <FunctionForm
          name={name}
          setName={setName}
          description={description}
          setDescription={setDescription}
          params={params}
          setParams={setParams}
          triggerFunction={triggerFunction}
        />
        <div className="task-form--editor">
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
      </Page.Contents>
    </Page>
  )
}

const FunctionEditPageWithProvider: FC = () => {
  return (
    <FunctionListProvider>
      <FunctionEditPage />
    </FunctionListProvider>
  )
}

export default FunctionEditPageWithProvider
