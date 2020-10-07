// Libraries
import React, {FC, useMemo, useContext, useCallback} from 'react'

// Types
import {PipeProp} from 'src/types/flows'

// Components
import FluxMonacoEditor from 'src/shared/components/FluxMonacoEditor'
import {PipeContext} from 'src/flows/context/pipe'

// Styles
import 'src/flows/pipes/Query/style.scss'

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
      <Context>
        <FluxMonacoEditor
          script={query.text}
          onChangeScript={updateText}
          onSubmitScript={() => {}}
          autogrow
        />
      </Context>
    ),
    [query.text, updateText, Context]
  )
}

export default Query
