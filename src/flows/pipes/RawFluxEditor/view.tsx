// Libraries
import React, {
  FC,
  lazy,
  Suspense,
  useMemo,
  useContext,
  useCallback,
} from 'react'

// Types
import {PipeProp} from 'src/types/flows'

// Components
import {PipeContext} from 'src/flows/context/pipe'

// Styles
import 'src/flows/pipes/RawFluxEditor/style.scss'

const FluxMonacoEditor = lazy(() =>
  import('src/shared/components/FluxMonacoEditor')
)

const Query: FC<PipeProp> = ({Context}) => {
  const {data, update} = useContext(PipeContext)
  const {queries, activeQuery} = data
  const query = queries[activeQuery]

  const updateText = useCallback(
    text => {
      const _queries = queries.slice()
      _queries[activeQuery] = {
        ...queries[activeQuery],
        text,
      }

      update({queries: _queries})
    },
    [update, queries, activeQuery]
  )

  return useMemo(
    () => (
      <Suspense fallback={<div>loading...</div>}>
        <Context>
          <FluxMonacoEditor
            script={query.text}
            onChangeScript={updateText}
            onSubmitScript={() => {}}
            autogrow
          />
        </Context>
      </Suspense>
    ),
    [query.text, updateText]
  )
}

export default Query
