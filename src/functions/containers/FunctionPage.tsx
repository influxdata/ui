// Libraries
import React, {FC, lazy, Suspense, useContext, useEffect, useState} from 'react'
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
import FunctionListProvider, {
  FunctionListContext,
} from 'src/functions/context/function.list'

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

  const {add} = useContext(FunctionListContext)

  const saveFunction = () => {
    add({name, description, script})
    // TODO route away if saved, stay if error
  }

  const cancelFunction = () => {
    history.push(`/orgs/${orgID}/functions/`)
    // TODO dont allow routing away if unsaved changes exist
  }

  return (
    <Page titleTag={pageTitleSuffixer(['New Function'])}>
      <FunctionHeader
        name={name}
        saveFunction={saveFunction}
        cancelFunction={cancelFunction}
      />
      <Page.Contents fullWidth={false} scrollable={true}>
        <div className="task-form">
          <div className="task-form--options">
            <FunctionForm
              name={name}
              setName={setName}
              description={description}
              setDescription={setDescription}
              params={params}
              setParams={setParams}
            />
          </div>
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
        </div>
      </Page.Contents>
    </Page>
  )
}

const FunctionPageWithProvider: FC = () => {
  return (
    <FunctionListProvider>
      <FunctionPage />
    </FunctionListProvider>
  )
}

export default FunctionPageWithProvider
