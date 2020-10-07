// Libraries
import {useMemo, FunctionComponent} from 'react'
import {flatMap} from 'lodash'

// Utils
import {
  parseResponse,
  parseResponseWithFromFlux,
} from 'src/shared/parsing/flux/response'
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

// Types
import {FluxTable} from 'src/types'

interface Props {
  files: string[]
  children: (tables: FluxTable[]) => JSX.Element
}

const FluxTablesTransform: FunctionComponent<Props> = ({files, children}) => {
  let parserFunction = parseResponse
  if (isFlagEnabled('fromFluxTableParser')) {
    parserFunction = parseResponseWithFromFlux
  }
  const tables = useMemo(() => flatMap(files, parserFunction), [files])
  return children(tables)
}

export default FluxTablesTransform
