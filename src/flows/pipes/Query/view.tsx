// Libraries
import React, {FC, useMemo, useContext} from 'react'

// Types
import {PipeProp} from 'src/types/flows'

// Components
import FluxMonacoEditor from 'src/shared/components/FluxMonacoEditor'
import Results from 'src/flows/pipes/Query/Results'
import {PipeContext} from 'src/flows/context/pipe'

// Styles
import 'src/flows/pipes/Query/style.scss'

const Query: FC<PipeProp> = ({Context}) => {
  const {data, update, results} = useContext(PipeContext)
  const {queries, activeQuery} = data
  const query = queries[activeQuery]

  function updateText(text) {
    const _queries = queries.slice()
    _queries[activeQuery] = {
      ...queries[activeQuery],
      text,
    }

    update({queries: _queries})
  }

  return useMemo(
    () => (
      <Context>
        <FluxMonacoEditor
          script={query.text}
          onChangeScript={updateText}
          onSubmitScript={() => {}}
          autogrow
        />
        <Results />
      </Context>
    ),
    [query.text, results, data.panelVisibility, data.panelHeight] // eslint-disable-line react-hooks/exhaustive-deps
  )
}

export default Query
