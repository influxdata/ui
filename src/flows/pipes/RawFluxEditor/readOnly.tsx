// Libraries
import React, {FC, lazy, Suspense, useContext} from 'react'
import {
  RemoteDataState,
  SpinnerContainer,
  TechnoSpinner,
} from '@influxdata/clockface'

// Types and Context
import {PipeProp} from 'src/types/flows'
import {VariablesContext} from 'src/flows/context/variables'

// Components
import {PipeContext} from 'src/flows/context/pipe'

// Styles
import 'src/flows/pipes/RawFluxEditor/style.scss'

const FluxMonacoEditor = lazy(
  () => import('src/shared/components/FluxMonacoEditor')
)

const Query: FC<PipeProp> = ({Context}) => {
  const {data} = useContext(PipeContext)
  const {queries, activeQuery} = data
  const query = queries[activeQuery]
  const {variables} = useContext(VariablesContext)

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
          variables={variables}
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
