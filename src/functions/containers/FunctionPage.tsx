// Libraries
import React, {FC, lazy, Suspense, useState} from 'react'

// Components
import {
  Page,
  RemoteDataState,
  SpinnerContainer,
  TechnoSpinner,
} from '@influxdata/clockface'
import FunctionHeader from '../components/FunctionHeader'

const FluxMonacoEditor = lazy(() =>
  import('src/shared/components/FluxMonacoEditor')
)

// Utils
import {pageTitleSuffixer} from 'src/shared/utils/pageTitles'

const FunctionPage: FC = () => {
  const [name] = useState('New Function')
  const [script, setScript] = useState('')

  return (
    <Page titleTag={pageTitleSuffixer(['New Function'])}>
      <FunctionHeader name={name} />
      <Page.Contents fullWidth={false} scrollable={true}>
        <div className="task-form">
          <div className="task-form--options">
            <></>
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

export default FunctionPage
