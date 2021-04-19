// Libraries
import React, {FC, lazy, Suspense, useContext} from 'react'

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

const PythonMonacoEditor = lazy(() =>
  import('src/functions/components/PythonMonacoEditor')
)

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'

const FunctionEditPage: FC = () => {
  const {
    draftFunction: {script},
    updateDraftFunction,
  } = useContext(FunctionListContext)

  const updateScript = (script: string) => {
    updateDraftFunction({script})
  }

  return (
    <Page titleTag={pageTitleSuffixer(['Edit Function'])}>
      <FunctionHeader />
      <Page.Contents fullWidth={true} scrollable={false}>
        <div className="function-form">
          <div className="function-form--options">
            <FunctionForm />
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
              <PythonMonacoEditor
                script={script}
                onChangeScript={updateScript}
              />
            </Suspense>
          </div>
        </div>
      </Page.Contents>
    </Page>
  )
}

export default FunctionEditPage
