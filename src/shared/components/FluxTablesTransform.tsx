// Libraries
import {useMemo, FunctionComponent} from 'react'
import {flatMap} from 'lodash'

// Utils
import {parseResponseWithFromFlux} from 'src/shared/parsing/flux/response'

// Types
import {FluxTable} from 'src/types'

interface Props {
  files: string[]
  children: (tables: FluxTable[]) => JSX.Element
}

const FluxTablesTransform: FunctionComponent<Props> = ({files, children}) => {
  const tables = useMemo(() => flatMap(files, parseResponseWithFromFlux), [
    files,
  ])
  return children(tables)
}

export default FluxTablesTransform
