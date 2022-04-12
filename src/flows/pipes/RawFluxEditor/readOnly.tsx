// Libraries
import React, {FC, lazy, Suspense, useContext} from 'react'
import {
  RemoteDataState,
  SpinnerContainer,
  TechnoSpinner,
} from '@influxdata/clockface'

// Types
import {PipeProp} from 'src/types/flows'

// Components
import {PipeContext} from 'src/flows/context/pipe'
import {pointToCorrectWorkers} from 'src/languageSupport/monaco.utils'

// Styles
import 'src/flows/pipes/RawFluxEditor/style.scss'

const FluxMonacoEditor = lazy(() => {
  pointToCorrectWorkers()
  return import('src/shared/components/FluxMonacoEditor')
})

const Query: FC<PipeProp> = ({Context}) => {
  const {data} = useContext(PipeContext)
  const {queries, activeQuery} = data
  const query = queries[activeQuery]

  return (
    <Context>
      <Suspense
        fallback={
          <SpinnerContainer
            loading={RemoteDataState.Loading}
            spinnerComponent={<TechnoSpinner />}
          />
        }
      >
        <FluxMonacoEditor
          script={query.text}
          onChangeScript={() => {}}
          onSubmitScript={() => {}}
          autogrow
          readOnly
          wrapLines="on"
        />
      </Suspense>
    </Context>
  )
}

export default Query
